import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { architectureChildren, architecturePath, type Architecture, type ArchitectureConnection, type ArchitectureNode } from '../data/architecture';

export interface SceneState { selected: string; view: string; showInactive: boolean }
export interface ArchitectureScene { update(state: SceneState): void; focus(): void }

const palette: Record<string, number> = { compute: 0xffad8d, network: 0x91c8ee, storage: 0xb7a8ee, backup: 0xe7bf85, monitoring: 0x9ed6bd, service: 0xadc5ef, system: 0xadc5ef };
const lineColors: Record<ArchitectureConnection['type'], number> = { contains: 0x86a1c2, runs: 0xb8d5ef, storage: 0xb7a8ee, backup: 0xe7bf85, observes: 0x9ed6bd, dns: 0x91c8ee, remote: 0xffad8d, allowed: 0x9ed6bd, blocked: 0xff8e91, exception: 0xe7bf85 };

function visibleNodes(data: Architecture, state: SceneState): ArchitectureNode[] {
  const ids = new Set<string>([data.rootId]);
  const add = (id: string) => architecturePath(data, id).forEach((node) => ids.add(node.id));
  add(state.selected);
  architectureChildren(data, state.selected, state.showInactive).forEach((node) => ids.add(node.id));
  if (state.view !== 'overview') {
    data.views.find((view) => view.id === state.view)?.focus.forEach(add);
    if (state.view === 'firewall') {
      data.connections.filter((edge) => edge.views.includes(state.view)).forEach((edge) => { add(edge.from); add(edge.to); });
    }
  }
  return data.nodes.filter((node) => ids.has(node.id) && (state.showInactive || node.status !== 'inactive'));
}

function positionsFor(data: Architecture, nodes: ArchitectureNode[], selected: string): Map<string, THREE.Vector3> {
  const depthAtFocus = architecturePath(data, selected).length - 1;
  const layers = new Map<number, ArchitectureNode[]>();
  nodes.forEach((node) => { const depth = architecturePath(data, node.id).length - 1; layers.set(depth, [...(layers.get(depth) ?? []), node]); });
  const positions = new Map<string, THREE.Vector3>();
  layers.forEach((layer, depth) => layer.forEach((node, index) => {
    positions.set(node.id, new THREE.Vector3((depth - depthAtFocus) * 3.65, node.id === selected ? 0.98 : 0.65, (index - (layer.length - 1) / 2) * (layer.length > 9 ? 1.9 : 2.65)));
  }));
  return positions;
}

function connectionsFor(data: Architecture, nodes: ArchitectureNode[], view: string): ArchitectureConnection[] {
  const ids = new Set(nodes.map((node) => node.id));
  const explicit = data.connections.filter((edge) => ids.has(edge.from) && ids.has(edge.to) && edge.views.includes(view));
  const pair = (a: string, b: string) => [a, b].sort().join(':');
  const known = new Set(explicit.map((edge) => pair(edge.from, edge.to)));
  const hierarchy: ArchitectureConnection[] = nodes.filter((node) => node.parent && ids.has(node.parent) && !known.has(pair(node.parent, node.id))).map((node) => ({ from: node.parent!, to: node.id, type: 'contains', label: 'Contains', direction: 'forward', views: [view] }));
  return [...hierarchy, ...explicit];
}

export function createArchitectureScene(container: HTMLElement, data: Architecture, onSelect: (id: string) => void, onBack: () => void): ArchitectureScene | null {
  const canvas = document.createElement('canvas');
  if (!canvas.getContext('webgl2') && !canvas.getContext('webgl')) return null;
  let renderer: THREE.WebGLRenderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power' }); }
  catch { return null; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 250);
  scene.add(new THREE.AmbientLight(0xffffff, 2));
  const light = new THREE.DirectionalLight(0xffffff, 2.2);
  light.position.set(-4, 12, 10);
  scene.add(light);

  const viewport = document.createElement('div');
  viewport.className = 'architecture-scene';
  canvas.className = 'architecture-scene-canvas';
  canvas.tabIndex = 0;
  canvas.setAttribute('aria-label', 'Architecture diagram. Tab through node labels. Escape returns one level.');
  const labels = document.createElement('div');
  labels.className = 'architecture-scene-labels';
  const controls = document.createElement('div');
  controls.className = 'architecture-scene-controls';
  controls.innerHTML = '<button type="button" data-scene-back aria-label="Back one level" title="Back one level">Back</button><div class="architecture-camera-controls" role="group" aria-label="Camera controls"><button type="button" data-scene-zoom-out aria-label="Zoom out" title="Zoom out">−</button><button type="button" data-scene-zoom-in aria-label="Zoom in" title="Zoom in">+</button><button type="button" data-scene-fit aria-label="Fit architecture to view" title="Fit architecture to view">Fit</button><button type="button" data-scene-reset aria-label="Reset camera" title="Reset camera">Reset</button></div>';
  const legend = document.createElement('div');
  legend.className = 'architecture-scene-legend';
  legend.innerHTML = '<span><i class="line-solid"></i>Hierarchy / flow</span><span><i class="line-dashed"></i>Backup / remote / exception</span><span><i class="line-blocked"></i>Blocked</span>';
  viewport.append(canvas, labels, controls, legend);
  viewport.dataset.cameraMinDistance = String(4.5);
  viewport.dataset.cameraMaxDistance = String(120);
  container.append(viewport);

  const nodes3d = new THREE.Group();
  const edges3d = new THREE.Group();
  scene.add(edges3d, nodes3d);
  const orbit = new OrbitControls(camera, canvas);
  orbit.minDistance = 4.5;
  orbit.maxDistance = 120;
  orbit.minPolarAngle = 0.28;
  orbit.maxPolarAngle = 1.48;
  orbit.enableDamping = true;
  orbit.dampingFactor = 0.085;
  orbit.enablePan = true;
  orbit.screenSpacePanning = true;
  orbit.touches.ONE = THREE.TOUCH.ROTATE;
  orbit.touches.TWO = THREE.TOUCH.DOLLY_PAN;
  canvas.style.touchAction = 'pan-y';
  const meshes: THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>[] = [];
  const placed = new Map<string, THREE.Vector3>();
  const labelPoints = new Map<HTMLElement, THREE.Vector3>();
  let transition: { position: THREE.Vector3; target: THREE.Vector3 } | null = null;
  let defaultCamera: { position: THREE.Vector3; target: THREE.Vector3 } | null = null;
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  orbit.enableDamping = !motion.matches;
  let state: SceneState = { selected: data.rootId, view: 'overview', showInactive: false };
  let current: ArchitectureNode[] = [];
  let frame = 0;
  const activePointers = new Map<number, { x: number; y: number }>();
  let gestureMoved = false;
  let hoveredId: string | undefined;

  function invalidate() { if (!frame) frame = requestAnimationFrame(render); }
  function render() {
    frame = 0;
    if (!viewport.isConnected) { observer.disconnect(); orbit.dispose(); renderer.dispose(); return; }
    if (transition) {
      const amount = motion.matches ? 1 : 0.16;
      camera.position.lerp(transition.position, amount);
      orbit.target.lerp(transition.target, amount);
      if (camera.position.distanceToSquared(transition.position) < 0.0004 && orbit.target.distanceToSquared(transition.target) < 0.0004) {
        camera.position.copy(transition.position);
        orbit.target.copy(transition.target);
        transition = null;
      }
    }
    orbit.update();
    renderer.render(scene, camera);
    viewport.dataset.cameraDistance = camera.position.distanceTo(orbit.target).toFixed(3);
    viewport.dataset.cameraPosition = camera.position.toArray().map((value) => value.toFixed(3)).join(',');
    viewport.dataset.cameraTarget = orbit.target.toArray().map((value) => value.toFixed(3)).join(',');
    labelPoints.forEach((point, element) => {
      const p = point.clone().project(camera);
      element.style.display = p.z > -1 && p.z < 1 ? '' : 'none';
      element.style.left = `${(p.x * 0.5 + 0.5) * 100}%`;
      element.style.top = `${(-p.y * 0.5 + 0.5) * 100}%`;
    });
    if (transition) invalidate();
  }
  function resize() {
    const width = Math.max(1, viewport.clientWidth);
    const height = Math.max(1, viewport.clientHeight);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    if (current.length) fitView();
    else invalidate();
  }
  function moveCamera(position: THREE.Vector3, target: THREE.Vector3) {
    const damping = orbit.enableDamping;
    orbit.enableDamping = false;
    orbit.update();
    orbit.enableDamping = damping;
    const offset = position.clone().sub(target);
    offset.setLength(THREE.MathUtils.clamp(offset.length(), orbit.minDistance, orbit.maxDistance));
    const goal = { position: target.clone().add(offset), target: target.clone() };
    if (motion.matches) {
      camera.position.copy(goal.position);
      orbit.target.copy(goal.target);
      transition = null;
      orbit.update();
    } else transition = goal;
    invalidate();
  }
  function fitView() {
    if (!current.length) return;
    const bounds = new THREE.Box3().setFromObject(nodes3d).expandByVector(new THREE.Vector3(0.8, 1.25, 0.8));
    if (bounds.isEmpty()) return;
    const center = bounds.getCenter(new THREE.Vector3());
    const direction = (transition ? transition.position.clone().sub(transition.target) : camera.position.clone().sub(orbit.target));
    if (direction.lengthSq() < 0.001) direction.set(0.06, 0.95, 0.58);
    direction.normalize();
    const viewCamera = camera.clone();
    viewCamera.position.copy(center).add(direction);
    viewCamera.lookAt(center);
    viewCamera.updateMatrixWorld();
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(viewCamera.quaternion);
    const up = new THREE.Vector3(0, 1, 0).applyQuaternion(viewCamera.quaternion);
    const halfY = THREE.MathUtils.degToRad(camera.fov) / 2;
    const tanY = Math.tan(halfY);
    const tanX = tanY * camera.aspect;
    let distance = orbit.minDistance;
    for (const x of [bounds.min.x, bounds.max.x]) for (const y of [bounds.min.y, bounds.max.y]) for (const z of [bounds.min.z, bounds.max.z]) {
      const point = new THREE.Vector3(x, y, z).sub(center);
      const depth = point.dot(direction);
      distance = Math.max(distance, depth + Math.abs(point.dot(right)) / tanX, depth + Math.abs(point.dot(up)) / tanY);
    }
    distance = THREE.MathUtils.clamp(distance * 1.08, orbit.minDistance, orbit.maxDistance);
    moveCamera(center.clone().addScaledVector(direction, distance), center);
    if (!defaultCamera) defaultCamera = { position: center.clone().addScaledVector(direction, distance), target: center.clone() };
  }
  function zoom(factor: number) {
    const base = transition ?? { position: camera.position, target: orbit.target };
    const offset = base.position.clone().sub(base.target);
    const distance = THREE.MathUtils.clamp(offset.length() * factor, orbit.minDistance, orbit.maxDistance);
    moveCamera(base.target.clone().add(offset.setLength(distance)), base.target);
  }
  function resetCamera() {
    if (defaultCamera) moveCamera(defaultCamera.position, defaultCamera.target);
  }
  function clear(group: THREE.Group) {
    group.children.slice().forEach((object) => {
      group.remove(object);
      if (object instanceof THREE.Mesh || object instanceof THREE.Line) {
        object.geometry.dispose();
        (Array.isArray(object.material) ? object.material : [object.material]).forEach((material) => material.dispose());
      }
    });
  }

  function update(next: SceneState) {
    state = { ...next };
    current = visibleNodes(data, state);
    const path = new Set(architecturePath(data, state.selected).map((node) => node.id));
    const related = new Set([...path, ...architectureChildren(data, state.selected, state.showInactive).map((node) => node.id)]);
    const positions = positionsFor(data, current, state.selected);
    placed.clear(); positions.forEach((point, id) => placed.set(id, point));
    clear(nodes3d); clear(edges3d); labels.replaceChildren(); meshes.length = 0; labelPoints.clear();
    hoveredId = undefined;

    const depths = [...new Set(current.map((node) => architecturePath(data, node.id).length - 1))];
    depths.forEach((depth) => {
      const layer = current.filter((node) => architecturePath(data, node.id).length - 1 === depth);
      const x = positions.get(layer[0].id)!.x;
      const zs = layer.map((node) => positions.get(node.id)!.z);
      const platform = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.08, Math.max(2.2, Math.max(...zs) - Math.min(...zs) + 2.4)), new THREE.MeshBasicMaterial({ color: 0x6e91bb, transparent: true, opacity: 0.12, depthWrite: false }));
      platform.position.set(x, -0.04, (Math.min(...zs) + Math.max(...zs)) / 2);
      nodes3d.add(platform);
    });

    connectionsFor(data, current, state.view).forEach((edge) => {
      const from = positions.get(edge.from); const to = positions.get(edge.to);
      if (!from || !to) return;
      const geometry = new THREE.BufferGeometry().setFromPoints([from.clone().add(new THREE.Vector3(0, 0.25, 0)), to.clone().add(new THREE.Vector3(0, 0.25, 0))]);
      const dashed = ['blocked', 'backup', 'exception', 'remote'].includes(edge.type);
      const material = dashed ? new THREE.LineDashedMaterial({ color: lineColors[edge.type], opacity: 0.82, transparent: true, dashSize: edge.type === 'blocked' ? 0.14 : 0.38, gapSize: 0.19 }) : new THREE.LineBasicMaterial({ color: lineColors[edge.type], opacity: edge.type === 'contains' ? 0.42 : 0.9, transparent: true });
      const line = new THREE.Line(geometry, material);
      if (dashed) line.computeLineDistances();
      edges3d.add(line);
      if (edge.type !== 'contains') {
        const marker = new THREE.Mesh(edge.type === 'blocked' ? new THREE.OctahedronGeometry(0.12) : new THREE.ConeGeometry(0.12, 0.32, 5), new THREE.MeshBasicMaterial({ color: lineColors[edge.type] }));
        marker.position.copy(from).lerp(to, 0.76).add(new THREE.Vector3(0, 0.25, 0));
        marker.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), to.clone().sub(from).normalize());
        edges3d.add(marker);
        if (state.view !== 'overview') {
          const badge = document.createElement('span');
          badge.className = `architecture-connection-label architecture-connection-label--${edge.type}`;
          badge.textContent = edge.type === 'blocked' ? '× BLOCK' : edge.type === 'allowed' ? 'ALLOW' : edge.type.toUpperCase();
          badge.title = `${edge.type}: ${edge.label}`;
          labels.append(badge);
          labelPoints.set(badge, from.clone().lerp(to, 0.5).add(new THREE.Vector3(0, 0.35, 0)));
        }
      }
    });

    current.forEach((node) => {
      const point = positions.get(node.id)!;
      const selected = node.id === state.selected;
      const childCount = architectureChildren(data, node.id, state.showInactive).length;
      const geometry = childCount ? new THREE.BoxGeometry(1.35, 0.72, 0.85) : new THREE.OctahedronGeometry(0.54);
      const material = new THREE.MeshStandardMaterial({ color: palette[node.category] ?? palette.system, emissive: selected ? 0x9c4e3f : 0x10263f, emissiveIntensity: selected ? 0.38 : 0.16, transparent: true, opacity: !related.has(node.id) ? 0.42 : node.status === 'inactive' ? 0.62 : 1, roughness: 0.55, metalness: 0.12 });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.copy(point); mesh.scale.setScalar(selected ? 1.14 : 1); mesh.userData.nodeId = node.id;
      nodes3d.add(mesh); meshes.push(mesh);
      const button = document.createElement('button');
      button.type = 'button'; button.className = 'architecture-node-label'; button.dataset.sceneNode = node.id;
      button.setAttribute('aria-label', `${node.label}, ${node.type}${childCount ? ', opens group' : ''}`);
      if (selected) button.setAttribute('aria-current', 'location');
      if (!related.has(node.id)) button.classList.add('is-dimmed');
      const type = document.createElement('span'); type.textContent = node.type;
      const name = document.createElement('strong'); name.textContent = node.label;
      button.append(type, name);
      if (childCount) { const count = document.createElement('small'); count.textContent = `${childCount} inside`; button.append(count); }
      labels.append(button);
      labelPoints.set(button, point.clone().add(new THREE.Vector3(0, childCount ? 1.12 : 0.94, 0)));
    });
    controls.querySelector<HTMLButtonElement>('[data-scene-back]')!.disabled = state.selected === data.rootId;
    fitView();
  }

  function hover(id?: string) {
    if (hoveredId === id) return;
    hoveredId = id;
    meshes.forEach((mesh) => {
      const active = mesh.userData.nodeId === id;
      const selected = mesh.userData.nodeId === state.selected;
      mesh.scale.setScalar(active ? 1.2 : selected ? 1.14 : 1);
      mesh.material.emissiveIntensity = active ? 0.5 : selected ? 0.38 : 0.16;
    });
    labels.querySelectorAll<HTMLElement>('[data-scene-node]').forEach((label) => label.classList.toggle('is-hovered', label.dataset.sceneNode === id));
    invalidate();
  }

  function hit(event: PointerEvent): string | undefined {
    const box = canvas.getBoundingClientRect();
    pointer.set(((event.clientX - box.left) / box.width) * 2 - 1, -((event.clientY - box.top) / box.height) * 2 + 1);
    raycaster.setFromCamera(pointer, camera);
    return raycaster.intersectObjects(meshes)[0]?.object.userData.nodeId as string | undefined;
  }
  labels.addEventListener('click', (event) => { const button = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-scene-node]'); if (button?.dataset.sceneNode) onSelect(button.dataset.sceneNode); });
  labels.addEventListener('pointerover', (event) => hover((event.target as HTMLElement).closest<HTMLElement>('[data-scene-node]')?.dataset.sceneNode));
  labels.addEventListener('pointerout', (event) => { if (!(event.relatedTarget instanceof Node) || !labels.contains(event.relatedTarget)) hover(); });
  labels.addEventListener('focusin', (event) => hover((event.target as HTMLElement).closest<HTMLElement>('[data-scene-node]')?.dataset.sceneNode));
  labels.addEventListener('focusout', (event) => { if (!(event.relatedTarget instanceof Node) || !labels.contains(event.relatedTarget)) hover(); });
  controls.addEventListener('click', (event) => {
    const target = event.target as HTMLElement;
    if (target.closest('[data-scene-back]')) onBack();
    if (target.closest('[data-scene-zoom-in]')) zoom(0.8);
    if (target.closest('[data-scene-zoom-out]')) zoom(1.25);
    if (target.closest('[data-scene-fit]')) fitView();
    if (target.closest('[data-scene-reset]')) resetCamera();
  });
  canvas.addEventListener('pointerdown', (event) => {
    if (!activePointers.size) gestureMoved = false;
    activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (activePointers.size > 1 || event.button !== 0) gestureMoved = true;
  });
  canvas.addEventListener('pointermove', (event) => {
    const id = hit(event);
    canvas.style.cursor = id ? 'pointer' : 'grab';
    hover(id);
    const start = activePointers.get(event.pointerId);
    if (start && Math.abs(event.clientX - start.x) + Math.abs(event.clientY - start.y) > 6) gestureMoved = true;
  });
  canvas.addEventListener('pointerup', (event) => {
    const singleTap = activePointers.size === 1 && !gestureMoved && event.button === 0;
    activePointers.delete(event.pointerId);
    if (!singleTap) return;
    const id = hit(event);
    if (id) onSelect(id); else onBack();
  });
  canvas.addEventListener('pointercancel', (event) => { activePointers.delete(event.pointerId); gestureMoved = true; });
  canvas.addEventListener('keydown', (event) => {
    if (['Escape', 'Backspace', 'ArrowLeft'].includes(event.key)) { event.preventDefault(); onBack(); }
    if (event.key === 'Home') { event.preventDefault(); onSelect(data.rootId); }
    if (event.key === 'ArrowRight') { const child = architectureChildren(data, state.selected, state.showInactive)[0]; if (child) { event.preventDefault(); onSelect(child.id); } }
  });
  orbit.addEventListener('change', invalidate);
  orbit.addEventListener('start', () => { transition = null; invalidate(); });
  const observer = new ResizeObserver(resize);
  observer.observe(viewport);
  resize();
  motion.addEventListener('change', () => { orbit.enableDamping = !motion.matches; invalidate(); });
  return { update, focus: () => canvas.focus() };
}
