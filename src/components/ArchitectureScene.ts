import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import {
  architectureChildren,
  architecturePath,
  type Architecture,
  type ArchitectureConnection,
  type ArchitectureNode,
} from '../data/architecture';


/* ============================================================
   Public Types
   ============================================================ */

/**
 * Describes the current state of the architecture viewer.
 */
export interface SceneState {
  selected: string;
  view: string;
  showInactive: boolean;
}

/**
 * Public API returned by createArchitectureScene().
 */
export interface ArchitectureScene {
  update(state: SceneState): void;
  focus(): void;
}


/* ============================================================
   Colors
   ============================================================ */

/**
 * Colors used for architecture nodes based on their category.
 */
const palette: Record<string, number> = {
  compute: 0xffad8d,
  network: 0x91c8ee,
  storage: 0xb7a8ee,
  backup: 0xe7bf85,
  monitoring: 0x9ed6bd,
  service: 0xadc5ef,
  system: 0xadc5ef,
};

/**
 * Colors used for the different connection types.
 */
const lineColors: Record<ArchitectureConnection['type'], number> = {
  contains: 0x86a1c2,
  runs: 0xb8d5ef,
  storage: 0xb7a8ee,
  backup: 0xe7bf85,
  observes: 0x9ed6bd,
  dns: 0x91c8ee,
  remote: 0xffad8d,
  allowed: 0x9ed6bd,
  blocked: 0xff8e91,
  exception: 0xe7bf85,
};


/* ============================================================
   Determine Which Nodes Should Be Visible
   ============================================================ */

function visibleNodes(
  data: Architecture,
  state: SceneState
): ArchitectureNode[] {
  // Always include the architecture root.
  const ids = new Set<string>([data.rootId]);

  /**
   * Adds the entire hierarchy path leading to a particular node.
   */
  const add = (id: string) =>
    architecturePath(data, id).forEach((node) => ids.add(node.id));

  // Include the selected node and everything above it.
  add(state.selected);

  // Include children directly underneath the selected node.
  architectureChildren(
    data,
    state.selected,
    state.showInactive
  ).forEach((node) => ids.add(node.id));

  // Additional nodes may become visible depending on the active view.
  if (state.view !== 'overview') {
    data.views
      .find((view) => view.id === state.view)
      ?.focus.forEach(add);

    // Firewall view also needs both ends of its connections visible.
    if (state.view === 'firewall') {
      data.connections
        .filter((edge) => edge.views.includes(state.view))
        .forEach((edge) => {
          add(edge.from);
          add(edge.to);
        });
    }
  }

  // Return only nodes that are supposed to be visible.
  return data.nodes.filter(
    (node) =>
      ids.has(node.id) &&
      (state.showInactive || node.status !== 'inactive')
  );
}


/* ============================================================
   Calculate Node Positions
   ============================================================ */

function positionsFor(
  data: Architecture,
  nodes: ArchitectureNode[],
  selected: string
): Map<string, THREE.Vector3> {
  // Determine the hierarchy depth of the selected node.
  const depthAtFocus =
    architecturePath(data, selected).length - 1;

  // Group nodes by their hierarchy depth.
  const layers = new Map<number, ArchitectureNode[]>();

  nodes.forEach((node) => {
    const depth =
      architecturePath(data, node.id).length - 1;

    layers.set(
      depth,
      [
        ...(layers.get(depth) ?? []),
        node,
      ]
    );
  });

  const positions = new Map<string, THREE.Vector3>();

  // Position every hierarchy layer along the X axis.
  // Nodes inside each layer are distributed along the Z axis.
  layers.forEach((layer, depth) => {
    layer.forEach((node, index) => {
      positions.set(
        node.id,
        new THREE.Vector3(
          // Horizontal position based on hierarchy depth.
          (depth - depthAtFocus) * 3.65,

          // Selected node sits slightly higher.
          node.id === selected ? 0.98 : 0.65,

          // Spread nodes within the layer along the Z axis.
          (
            index -
            (layer.length - 1) / 2
          ) * (
            layer.length > 9
              ? 1.9
              : 2.65
          )
        )
      );
    });
  });

  return positions;
}


/* ============================================================
   Determine Connections Between Visible Nodes
   ============================================================ */

function connectionsFor(
  data: Architecture,
  nodes: ArchitectureNode[],
  view: string
): ArchitectureConnection[] {
  // IDs of nodes currently visible.
  const ids = new Set(
    nodes.map((node) => node.id)
  );

  // Connections explicitly defined in the architecture data.
  const explicit = data.connections.filter(
    (edge) =>
      ids.has(edge.from) &&
      ids.has(edge.to) &&
      edge.views.includes(view)
  );

  /**
   * Creates a consistent identifier for a pair of nodes.
   *
   * Sorting makes A:B and B:A count as the same pair.
   */
  const pair = (a: string, b: string) =>
    [a, b].sort().join(':');

  // Track node pairs already connected explicitly.
  const known = new Set(
    explicit.map((edge) =>
      pair(edge.from, edge.to)
    )
  );

  /**
   * Automatically create "contains" connections for parent/child
   * relationships that do not already have an explicit connection.
   */
  const hierarchy: ArchitectureConnection[] = nodes
    .filter(
      (node) =>
        node.parent &&
        ids.has(node.parent) &&
        !known.has(pair(node.parent, node.id))
    )
    .map((node) => ({
      from: node.parent!,
      to: node.id,
      type: 'contains',
      label: 'Contains',
      direction: 'forward',
      views: [view],
    }));

  return [
    ...hierarchy,
    ...explicit,
  ];
}


/* ============================================================
   Create Architecture Scene
   ============================================================ */

export function createArchitectureScene(
  container: HTMLElement,
  data: Architecture,
  onSelect: (id: string) => void,
  onBack: () => void
): ArchitectureScene | null {

  /* ----------------------------------------------------------
     Canvas / WebGL Setup
     ---------------------------------------------------------- */

  const canvas = document.createElement('canvas');

  // Stop immediately if the browser does not support WebGL.
  if (
    !canvas.getContext('webgl2') &&
    !canvas.getContext('webgl')
  ) {
    return null;
  }

  let renderer: THREE.WebGLRenderer;

  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'low-power',
    });
  } catch {
    // Renderer creation can fail even when WebGL exists.
    return null;
  }

  // Limit pixel ratio to avoid unnecessarily expensive rendering.
  renderer.setPixelRatio(
    Math.min(
      window.devicePixelRatio || 1,
      1.75
    )
  );

  renderer.outputColorSpace =
    THREE.SRGBColorSpace;


  /* ----------------------------------------------------------
     Scene / Camera / Lighting
     ---------------------------------------------------------- */

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    38,
    1,
    0.1,
    250
  );

  // General ambient lighting.
  scene.add(
    new THREE.AmbientLight(
      0xffffff,
      2
    )
  );

  // Strong directional light to give shapes depth.
  const light = new THREE.DirectionalLight(
    0xffffff,
    2.2
  );

  light.position.set(
    -4,
    12,
    10
  );

  scene.add(light);


  /* ----------------------------------------------------------
     DOM Elements
     ---------------------------------------------------------- */

  // Main wrapper around the Three.js scene.
  const viewport =
    document.createElement('div');

  viewport.className =
    'architecture-scene';


  // Three.js rendering canvas.
  canvas.className =
    'architecture-scene-canvas';

  canvas.tabIndex = 0;

  canvas.setAttribute(
    'aria-label',
    'Architecture diagram. Tab through node labels. Escape returns one level.'
  );


  // HTML labels placed over the 3D objects.
  const labels =
    document.createElement('div');

  labels.className =
    'architecture-scene-labels';


  // Camera/navigation controls.
  const controls =
    document.createElement('div');

  controls.className =
    'architecture-scene-controls';

  controls.innerHTML =
    '<button type="button" data-scene-back aria-label="Back one level" title="Back one level">Back</button>' +
    '<div class="architecture-camera-controls" role="group" aria-label="Camera controls">' +
      '<button type="button" data-scene-zoom-out aria-label="Zoom out" title="Zoom out">−</button>' +
      '<button type="button" data-scene-zoom-in aria-label="Zoom in" title="Zoom in">+</button>' +
      '<button type="button" data-scene-fit aria-label="Fit architecture to view" title="Fit architecture to view">Fit</button>' +
      '<button type="button" data-scene-reset aria-label="Reset camera" title="Reset camera">Reset</button>' +
    '</div>';


  // Legend explaining different connection styles.
  const legend =
    document.createElement('div');

  legend.className =
    'architecture-scene-legend';

  legend.innerHTML =
    '<span>' +
      '<i class="line-solid"></i>' +
      'Hierarchy / flow' +
    '</span>' +
    '<span>' +
      '<i class="line-dashed"></i>' +
      'Backup / remote / exception' +
    '</span>' +
    '<span>' +
      '<i class="line-blocked"></i>' +
      'Blocked' +
    '</span>';


  // Assemble the architecture viewport.
  viewport.append(
    canvas,
    labels,
    controls,
    legend
  );

  // Expose camera limits through data attributes.
  viewport.dataset.cameraMinDistance =
    String(4.5);

  viewport.dataset.cameraMaxDistance =
    String(120);

  container.append(viewport);


  /* ----------------------------------------------------------
     Three.js Groups
     ---------------------------------------------------------- */

  // All rendered nodes live here.
  const nodes3d =
    new THREE.Group();

  // All connection lines live here.
  const edges3d =
    new THREE.Group();

  scene.add(
    edges3d,
    nodes3d
  );


  /* ----------------------------------------------------------
     Orbit Controls
     ---------------------------------------------------------- */

  const orbit =
    new OrbitControls(
      camera,
      canvas
    );

  // Minimum/maximum zoom distance.
  orbit.minDistance = 4.5;
  orbit.maxDistance = 120;

  // Restrict vertical rotation.
  orbit.minPolarAngle = 0.28;
  orbit.maxPolarAngle = 1.48;

  // Smooth camera motion.
  orbit.enableDamping = true;
  orbit.dampingFactor = 0.085;

  // Allow the user to pan around the scene.
  orbit.enablePan = true;
  orbit.screenSpacePanning = true;

  // Touch controls.
  orbit.touches.ONE =
    THREE.TOUCH.ROTATE;

  orbit.touches.TWO =
    THREE.TOUCH.DOLLY_PAN;

  // Allow normal vertical page scrolling on touch devices.
  canvas.style.touchAction = 'pan-y';


  /* ----------------------------------------------------------
     Scene State
     ---------------------------------------------------------- */

  // Clickable Three.js node meshes.
  const meshes:
    THREE.Mesh<
      THREE.BufferGeometry,
      THREE.MeshStandardMaterial
    >[] = [];

  // Map architecture node IDs to their 3D positions.
  const placed =
    new Map<
      string,
      THREE.Vector3
    >();

  // Map HTML labels to corresponding points in 3D space.
  const labelPoints =
    new Map<
      HTMLElement,
      THREE.Vector3
    >();

  /**
   * Camera transition currently in progress.
   *
   * null means the camera is not automatically moving.
   */
  let transition: {
    position: THREE.Vector3;
    target: THREE.Vector3;
  } | null = null;

  /**
   * Camera state used by the Reset button.
   */
  let defaultCamera: {
    position: THREE.Vector3;
    target: THREE.Vector3;
  } | null = null;


  // Used for detecting which 3D node the pointer is over.
  const raycaster =
    new THREE.Raycaster();

  const pointer =
    new THREE.Vector2();


  // Respect the user's reduced-motion accessibility setting.
  const motion = matchMedia(
    '(prefers-reduced-motion: reduce)'
  );

  orbit.enableDamping =
    !motion.matches;


  // Initial architecture state.
  let state: SceneState = {
    selected: data.rootId,
    view: 'overview',
    showInactive: false,
  };


  // Nodes currently visible.
  let current:
    ArchitectureNode[] = [];


  // Current animation-frame request.
  let frame = 0;


  /**
   * Tracks active mouse/touch pointers.
   *
   * Used to distinguish a click/tap from a drag gesture.
   */
  const activePointers =
    new Map<
      number,
      {
        x: number;
        y: number;
      }
    >();

  let gestureMoved = false;

  // Node currently hovered by mouse or keyboard focus.
  let hoveredId:
    string | undefined;


  /* ==========================================================
     Rendering
     ========================================================== */

  /**
   * Schedule a render on the next animation frame.
   *
   * Prevents multiple unnecessary render requests from piling up.
   */
  function invalidate() {
    if (!frame) {
      frame =
        requestAnimationFrame(render);
    }
  }


  /**
   * Draw the scene and update the HTML labels.
   */
  function render() {
    frame = 0;

    /**
     * If the viewport has been removed from the document,
     * clean everything up.
     */
    if (!viewport.isConnected) {
      observer.disconnect();
      orbit.dispose();
      renderer.dispose();

      return;
    }


    /* --------------------------------------------------------
       Camera Transition
       -------------------------------------------------------- */

    if (transition) {
      // Reduced motion jumps immediately to the final position.
      const amount =
        motion.matches
          ? 1
          : 0.16;

      camera.position.lerp(
        transition.position,
        amount
      );

      orbit.target.lerp(
        transition.target,
        amount
      );

      // Stop the transition when sufficiently close.
      if (
        camera.position.distanceToSquared(
          transition.position
        ) < 0.0004 &&
        orbit.target.distanceToSquared(
          transition.target
        ) < 0.0004
      ) {
        camera.position.copy(
          transition.position
        );

        orbit.target.copy(
          transition.target
        );

        transition = null;
      }
    }


    /* --------------------------------------------------------
       Render Three.js Scene
       -------------------------------------------------------- */

    orbit.update();

    renderer.render(
      scene,
      camera
    );


    /* --------------------------------------------------------
       Expose Camera State
       -------------------------------------------------------- */

    viewport.dataset.cameraDistance =
      camera.position
        .distanceTo(orbit.target)
        .toFixed(3);

    viewport.dataset.cameraPosition =
      camera.position
        .toArray()
        .map((value) =>
          value.toFixed(3)
        )
        .join(',');

    viewport.dataset.cameraTarget =
      orbit.target
        .toArray()
        .map((value) =>
          value.toFixed(3)
        )
        .join(',');


    /* --------------------------------------------------------
       Position HTML Labels Over 3D Points
       -------------------------------------------------------- */

    labelPoints.forEach(
      (point, element) => {
        // Convert the 3D position into screen coordinates.
        const p =
          point
            .clone()
            .project(camera);

        // Hide labels outside the camera's visible depth.
        element.style.display =
          p.z > -1 && p.z < 1
            ? ''
            : 'none';

        element.style.left =
          `${(p.x * 0.5 + 0.5) * 100}%`;

        element.style.top =
          `${(-p.y * 0.5 + 0.5) * 100}%`;
      }
    );

    // Keep rendering while the camera is moving.
    if (transition) {
      invalidate();
    }
  }


  /* ==========================================================
     Resize Handling
     ========================================================== */

  function resize() {
    const width =
      Math.max(
        1,
        viewport.clientWidth
      );

    const height =
      Math.max(
        1,
        viewport.clientHeight
      );

    renderer.setSize(
      width,
      height,
      false
    );

    camera.aspect =
      width / height;

    camera.updateProjectionMatrix();

    // Re-fit the diagram after a resize if nodes exist.
    if (current.length) {
      fitView();
    } else {
      invalidate();
    }
  }


  /* ==========================================================
     Camera Controls
     ========================================================== */

  /**
   * Move the camera toward a new position and target.
   */
  function moveCamera(
    position: THREE.Vector3,
    target: THREE.Vector3
  ) {
    /**
     * Temporarily disable damping while synchronizing
     * OrbitControls.
     */
    const damping =
      orbit.enableDamping;

    orbit.enableDamping = false;
    orbit.update();

    orbit.enableDamping =
      damping;


    // Calculate camera offset from its target.
    const offset =
      position
        .clone()
        .sub(target);

    // Enforce zoom limits.
    offset.setLength(
      THREE.MathUtils.clamp(
        offset.length(),
        orbit.minDistance,
        orbit.maxDistance
      )
    );

    const goal = {
      position:
        target
          .clone()
          .add(offset),

      target:
        target.clone(),
    };


    // Reduced-motion users skip camera animation.
    if (motion.matches) {
      camera.position.copy(
        goal.position
      );

      orbit.target.copy(
        goal.target
      );

      transition = null;

      orbit.update();
    } else {
      transition = goal;
    }

    invalidate();
  }


  /**
   * Automatically position the camera so all visible nodes fit.
   */
  function fitView() {
    if (!current.length) {
      return;
    }

    // Find the bounding box surrounding all visible 3D nodes.
    const bounds =
      new THREE.Box3()
        .setFromObject(nodes3d)
        .expandByVector(
          new THREE.Vector3(
            0.8,
            1.25,
            0.8
          )
        );

    if (bounds.isEmpty()) {
      return;
    }


    // Center point of the architecture diagram.
    const center =
      bounds.getCenter(
        new THREE.Vector3()
      );


    /**
     * Preserve the current camera viewing direction.
     *
     * If a transition is running, use its destination direction.
     */
    const direction =
      transition
        ? transition.position
            .clone()
            .sub(transition.target)
        : camera.position
            .clone()
            .sub(orbit.target);

    // Provide a fallback direction if the camera is at the target.
    if (
      direction.lengthSq() < 0.001
    ) {
      direction.set(
        0.06,
        0.95,
        0.58
      );
    }

    direction.normalize();


    /**
     * Clone the camera to calculate its local right/up
     * directions without altering the real camera.
     */
    const viewCamera =
      camera.clone();

    viewCamera.position
      .copy(center)
      .add(direction);

    viewCamera.lookAt(center);
    viewCamera.updateMatrixWorld();


    const right =
      new THREE.Vector3(
        1,
        0,
        0
      ).applyQuaternion(
        viewCamera.quaternion
      );

    const up =
      new THREE.Vector3(
        0,
        1,
        0
      ).applyQuaternion(
        viewCamera.quaternion
      );


    // Calculate horizontal and vertical field-of-view limits.
    const halfY =
      THREE.MathUtils.degToRad(
        camera.fov
      ) / 2;

    const tanY =
      Math.tan(halfY);

    const tanX =
      tanY * camera.aspect;


    let distance =
      orbit.minDistance;


    /**
     * Test every corner of the bounding box and determine
     * how far away the camera must be to fit everything.
     */
    for (
      const x of [
        bounds.min.x,
        bounds.max.x,
      ]
    ) {
      for (
        const y of [
          bounds.min.y,
          bounds.max.y,
        ]
      ) {
        for (
          const z of [
            bounds.min.z,
            bounds.max.z,
          ]
        ) {
          const point =
            new THREE.Vector3(
              x,
              y,
              z
            ).sub(center);

          const depth =
            point.dot(direction);

          distance = Math.max(
            distance,

            depth +
              Math.abs(
                point.dot(right)
              ) /
                tanX,

            depth +
              Math.abs(
                point.dot(up)
              ) /
                tanY
          );
        }
      }
    }


    // Slight padding so nodes do not touch screen edges.
    distance =
      THREE.MathUtils.clamp(
        distance * 1.08,
        orbit.minDistance,
        orbit.maxDistance
      );


    moveCamera(
      center
        .clone()
        .addScaledVector(
          direction,
          distance
        ),
      center
    );


    // Save the first fitted camera state for Reset.
    if (!defaultCamera) {
      defaultCamera = {
        position:
          center
            .clone()
            .addScaledVector(
              direction,
              distance
            ),

        target:
          center.clone(),
      };
    }
  }


  /**
   * Zoom relative to the current camera distance.
   *
   * factor < 1 = zoom in
   * factor > 1 = zoom out
   */
  function zoom(
    factor: number
  ) {
    const base =
      transition ?? {
        position:
          camera.position,

        target:
          orbit.target,
      };

    const offset =
      base.position
        .clone()
        .sub(base.target);

    const distance =
      THREE.MathUtils.clamp(
        offset.length() * factor,
        orbit.minDistance,
        orbit.maxDistance
      );

    moveCamera(
      base.target
        .clone()
        .add(
          offset.setLength(
            distance
          )
        ),
      base.target
    );
  }


  /**
   * Return to the camera position saved during the initial fit.
   */
  function resetCamera() {
    if (defaultCamera) {
      moveCamera(
        defaultCamera.position,
        defaultCamera.target
      );
    }
  }


  /* ==========================================================
     Dispose Existing Three.js Objects
     ========================================================== */

  function clear(
    group: THREE.Group
  ) {
    group.children
      .slice()
      .forEach((object) => {
        group.remove(object);

        /**
         * Explicitly dispose geometries/materials so WebGL
         * resources do not leak.
         */
        if (
          object instanceof THREE.Mesh ||
          object instanceof THREE.Line
        ) {
          object.geometry.dispose();

          (
            Array.isArray(
              object.material
            )
              ? object.material
              : [object.material]
          ).forEach(
            (material) =>
              material.dispose()
          );
        }
      });
  }


  /* ==========================================================
     Rebuild Scene
     ========================================================== */

  function update(
    next: SceneState
  ) {
    // Copy the incoming state.
    state = {
      ...next,
    };


    // Determine which nodes should appear.
    current =
      visibleNodes(
        data,
        state
      );


    /**
     * Nodes in the selected hierarchy path remain fully visible.
     */
    const path =
      new Set(
        architecturePath(
          data,
          state.selected
        ).map(
          (node) =>
            node.id
        )
      );


    /**
     * Related nodes include:
     * - selected path
     * - children of the currently selected node
     */
    const related =
      new Set([
        ...path,

        ...architectureChildren(
          data,
          state.selected,
          state.showInactive
        ).map(
          (node) =>
            node.id
        ),
      ]);


    // Calculate positions for every visible node.
    const positions =
      positionsFor(
        data,
        current,
        state.selected
      );


    // Store calculated node positions.
    placed.clear();

    positions.forEach(
      (point, id) =>
        placed.set(
          id,
          point
        )
    );


    /* --------------------------------------------------------
       Clear Previous Scene
       -------------------------------------------------------- */

    clear(nodes3d);
    clear(edges3d);

    labels.replaceChildren();

    meshes.length = 0;

    labelPoints.clear();

    hoveredId = undefined;


    /* --------------------------------------------------------
       Draw Layer Platforms
       -------------------------------------------------------- */

    const depths = [
      ...new Set(
        current.map(
          (node) =>
            architecturePath(
              data,
              node.id
            ).length - 1
        )
      ),
    ];


    depths.forEach(
      (depth) => {
        // Get all nodes at this hierarchy depth.
        const layer =
          current.filter(
            (node) =>
              architecturePath(
                data,
                node.id
              ).length - 1 === depth
          );

        // Every node in the layer has the same X coordinate.
        const x =
          positions.get(
            layer[0].id
          )!.x;

        // Collect Z coordinates to determine platform size.
        const zs =
          layer.map(
            (node) =>
              positions.get(
                node.id
              )!.z
          );


        const platform =
          new THREE.Mesh(
            new THREE.BoxGeometry(
              2.1,
              0.08,
              Math.max(
                2.2,

                Math.max(...zs) -
                  Math.min(...zs) +
                  2.4
              )
            ),

            new THREE.MeshBasicMaterial({
              color: 0x6e91bb,
              transparent: true,
              opacity: 0.12,
              depthWrite: false,
            })
          );


        platform.position.set(
          x,
          -0.04,
          (
            Math.min(...zs) +
            Math.max(...zs)
          ) / 2
        );


        nodes3d.add(
          platform
        );
      }
    );


    /* --------------------------------------------------------
       Draw Connections
       -------------------------------------------------------- */

    connectionsFor(
      data,
      current,
      state.view
    ).forEach((edge) => {
      const from =
        positions.get(
          edge.from
        );

      const to =
        positions.get(
          edge.to
        );

      // Ignore connections whose nodes are missing.
      if (!from || !to) {
        return;
      }


      // Build a straight line between both nodes.
      const geometry =
        new THREE.BufferGeometry()
          .setFromPoints([
            from
              .clone()
              .add(
                new THREE.Vector3(
                  0,
                  0.25,
                  0
                )
              ),

            to
              .clone()
              .add(
                new THREE.Vector3(
                  0,
                  0.25,
                  0
                )
              ),
          ]);


      // Certain connection types use dashed lines.
      const dashed = [
        'blocked',
        'backup',
        'exception',
        'remote',
      ].includes(
        edge.type
      );


      const material =
        dashed
          ? new THREE.LineDashedMaterial({
              color:
                lineColors[
                  edge.type
                ],

              opacity: 0.82,

              transparent: true,

              dashSize:
                edge.type ===
                'blocked'
                  ? 0.14
                  : 0.38,

              gapSize: 0.19,
            })
          : new THREE.LineBasicMaterial({
              color:
                lineColors[
                  edge.type
                ],

              opacity:
                edge.type ===
                'contains'
                  ? 0.42
                  : 0.9,

              transparent: true,
            });


      const line =
        new THREE.Line(
          geometry,
          material
        );


      // Required for dashed line rendering.
      if (dashed) {
        line.computeLineDistances();
      }


      edges3d.add(line);


      /**
       * "contains" relationships only use a line.
       *
       * Other connection types receive an arrow/marker.
       */
      if (
        edge.type !==
        'contains'
      ) {
        const marker =
          new THREE.Mesh(
            edge.type ===
              'blocked'
              ? new THREE.OctahedronGeometry(
                  0.12
                )
              : new THREE.ConeGeometry(
                  0.12,
                  0.32,
                  5
                ),

            new THREE.MeshBasicMaterial({
              color:
                lineColors[
                  edge.type
                ],
            })
          );


        // Place marker about 76% of the way toward the destination.
        marker.position
          .copy(from)
          .lerp(
            to,
            0.76
          )
          .add(
            new THREE.Vector3(
              0,
              0.25,
              0
            )
          );


        // Rotate marker so it points toward the destination.
        marker.quaternion
          .setFromUnitVectors(
            new THREE.Vector3(
              0,
              1,
              0
            ),

            to
              .clone()
              .sub(from)
              .normalize()
          );


        edges3d.add(
          marker
        );


        /**
         * Detailed views display labels on connections.
         *
         * Overview mode keeps the visualization cleaner.
         */
        if (
          state.view !==
          'overview'
        ) {
          const badge =
            document.createElement(
              'span'
            );


          badge.className =
            `architecture-connection-label architecture-connection-label--${edge.type}`;


          badge.textContent =
            edge.type ===
            'blocked'
              ? '× BLOCK'
              : edge.type ===
                'allowed'
                ? 'ALLOW'
                : edge.type.toUpperCase();


          badge.title =
            `${edge.type}: ${edge.label}`;


          labels.append(
            badge
          );


          // Position label halfway between the connected nodes.
          labelPoints.set(
            badge,

            from
              .clone()
              .lerp(
                to,
                0.5
              )
              .add(
                new THREE.Vector3(
                  0,
                  0.35,
                  0
                )
              )
          );
        }
      }
    });


    /* --------------------------------------------------------
       Draw Nodes
       -------------------------------------------------------- */

    current.forEach(
      (node) => {
        const point =
          positions.get(
            node.id
          )!;

        const selected =
          node.id ===
          state.selected;


        // Determine whether this node contains child nodes.
        const childCount =
          architectureChildren(
            data,
            node.id,
            state.showInactive
          ).length;


        /**
         * Nodes containing children use boxes.
         *
         * Leaf nodes use octahedrons.
         */
        const geometry =
          childCount
            ? new THREE.BoxGeometry(
                1.35,
                0.72,
                0.85
              )
            : new THREE.OctahedronGeometry(
                0.54
              );


        const material =
          new THREE.MeshStandardMaterial({
            color:
              palette[
                node.category
              ] ??
              palette.system,

            // Selected node receives a warmer emissive highlight.
            emissive:
              selected
                ? 0x9c4e3f
                : 0x10263f,

            emissiveIntensity:
              selected
                ? 0.38
                : 0.16,

            transparent: true,

            /**
             * Dim unrelated and inactive nodes.
             */
            opacity:
              !related.has(
                node.id
              )
                ? 0.42
                : node.status ===
                  'inactive'
                  ? 0.62
                  : 1,

            roughness: 0.55,
            metalness: 0.12,
          });


        const mesh =
          new THREE.Mesh(
            geometry,
            material
          );


        mesh.position.copy(
          point
        );

        // Selected node is slightly larger.
        mesh.scale.setScalar(
          selected
            ? 1.14
            : 1
        );

        // Store architecture ID for raycasting.
        mesh.userData.nodeId =
          node.id;


        nodes3d.add(
          mesh
        );

        meshes.push(
          mesh
        );


        /* ----------------------------------------------------
           Accessible HTML Label
           ---------------------------------------------------- */

        const button =
          document.createElement(
            'button'
          );

        button.type =
          'button';

        button.className =
          'architecture-node-label';

        button.dataset.sceneNode =
          node.id;


        button.setAttribute(
          'aria-label',
          `${node.label}, ${node.type}${childCount ? ', opens group' : ''}`
        );


        // Tell assistive technologies which node is selected.
        if (selected) {
          button.setAttribute(
            'aria-current',
            'location'
          );
        }


        // Visually dim unrelated labels as well.
        if (
          !related.has(
            node.id
          )
        ) {
          button.classList.add(
            'is-dimmed'
          );
        }


        // Small node type label.
        const type =
          document.createElement(
            'span'
          );

        type.textContent =
          node.type;


        // Main node name.
        const name =
          document.createElement(
            'strong'
          );

        name.textContent =
          node.label;


        button.append(
          type,
          name
        );


        // Display number of children when this node is expandable.
        if (childCount) {
          const count =
            document.createElement(
              'small'
            );

          count.textContent =
            `${childCount} inside`;

          button.append(
            count
          );
        }


        labels.append(
          button
        );


        // Position HTML label slightly above its corresponding 3D node.
        labelPoints.set(
          button,

          point
            .clone()
            .add(
              new THREE.Vector3(
                0,
                childCount
                  ? 1.12
                  : 0.94,
                0
              )
            )
        );
      }
    );


    /* --------------------------------------------------------
       Finish Scene Update
       -------------------------------------------------------- */

    // Disable Back while the root node is selected.
    controls.querySelector<HTMLButtonElement>(
      '[data-scene-back]'
    )!.disabled =
      state.selected ===
      data.rootId;


    // Reposition camera to show all visible nodes.
    fitView();
  }


  /* ==========================================================
     Hover State
     ========================================================== */

  function hover(
    id?: string
  ) {
    // Avoid unnecessary updates.
    if (
      hoveredId === id
    ) {
      return;
    }

    hoveredId = id;


    meshes.forEach(
      (mesh) => {
        const active =
          mesh.userData.nodeId ===
          id;

        const selected =
          mesh.userData.nodeId ===
          state.selected;


        // Hovered node becomes largest.
        mesh.scale.setScalar(
          active
            ? 1.2
            : selected
              ? 1.14
              : 1
        );


        // Hovered node also glows more strongly.
        mesh.material.emissiveIntensity =
          active
            ? 0.5
            : selected
              ? 0.38
              : 0.16;
      }
    );


    // Synchronize hover appearance on HTML labels.
    labels
      .querySelectorAll<HTMLElement>(
        '[data-scene-node]'
      )
      .forEach(
        (label) =>
          label.classList.toggle(
            'is-hovered',
            label.dataset.sceneNode === id
          )
      );


    invalidate();
  }


  /* ==========================================================
     Pointer Hit Detection
     ========================================================== */

  /**
   * Determine which 3D node is underneath the pointer.
   */
  function hit(
    event: PointerEvent
  ): string | undefined {
    const box =
      canvas.getBoundingClientRect();


    // Convert screen coordinates to Three.js normalized coordinates.
    pointer.set(
      (
        (
          event.clientX -
          box.left
        ) /
        box.width
      ) *
        2 -
        1,

      -(
        (
          event.clientY -
          box.top
        ) /
        box.height
      ) *
        2 +
        1
    );


    raycaster.setFromCamera(
      pointer,
      camera
    );


    return raycaster
      .intersectObjects(
        meshes
      )[0]
      ?.object
      .userData
      .nodeId as
      | string
      | undefined;
  }


  /* ==========================================================
     HTML Label Events
     ========================================================== */

  // Select a node when its HTML label is clicked.
  labels.addEventListener(
    'click',
    (event) => {
      const button =
        (
          event.target as HTMLElement
        ).closest<HTMLButtonElement>(
          '[data-scene-node]'
        );

      if (
        button?.dataset.sceneNode
      ) {
        onSelect(
          button.dataset.sceneNode
        );
      }
    }
  );


  // Highlight node when its label is hovered.
  labels.addEventListener(
    'pointerover',
    (event) =>
      hover(
        (
          event.target as HTMLElement
        )
          .closest<HTMLElement>(
            '[data-scene-node]'
          )
          ?.dataset.sceneNode
      )
  );


  // Remove hover when pointer leaves the label container.
  labels.addEventListener(
    'pointerout',
    (event) => {
      if (
        !(
          event.relatedTarget
          instanceof Node
        ) ||
        !labels.contains(
          event.relatedTarget
        )
      ) {
        hover();
      }
    }
  );


  // Keyboard focus gets the same highlight as pointer hover.
  labels.addEventListener(
    'focusin',
    (event) =>
      hover(
        (
          event.target as HTMLElement
        )
          .closest<HTMLElement>(
            '[data-scene-node]'
          )
          ?.dataset.sceneNode
      )
  );


  labels.addEventListener(
    'focusout',
    (event) => {
      if (
        !(
          event.relatedTarget
          instanceof Node
        ) ||
        !labels.contains(
          event.relatedTarget
        )
      ) {
        hover();
      }
    }
  );


  /* ==========================================================
     Camera Button Events
     ========================================================== */

  controls.addEventListener(
    'click',
    (event) => {
      const target =
        event.target as HTMLElement;


      if (
        target.closest(
          '[data-scene-back]'
        )
      ) {
        onBack();
      }


      // Smaller factor = closer to target.
      if (
        target.closest(
          '[data-scene-zoom-in]'
        )
      ) {
        zoom(0.8);
      }


      // Larger factor = farther from target.
      if (
        target.closest(
          '[data-scene-zoom-out]'
        )
      ) {
        zoom(1.25);
      }


      if (
        target.closest(
          '[data-scene-fit]'
        )
      ) {
        fitView();
      }


      if (
        target.closest(
          '[data-scene-reset]'
        )
      ) {
        resetCamera();
      }
    }
  );


  /* ==========================================================
     Canvas Pointer / Touch Events
     ========================================================== */

  canvas.addEventListener(
    'pointerdown',
    (event) => {
      // New gesture begins when no pointers are currently active.
      if (!activePointers.size) {
        gestureMoved = false;
      }


      activePointers.set(
        event.pointerId,
        {
          x: event.clientX,
          y: event.clientY,
        }
      );


      /**
       * Multi-touch and non-left mouse buttons are treated as
       * camera gestures rather than node clicks.
       */
      if (
        activePointers.size > 1 ||
        event.button !== 0
      ) {
        gestureMoved = true;
      }
    }
  );


  canvas.addEventListener(
    'pointermove',
    (event) => {
      // Check whether pointer is currently over a node.
      const id =
        hit(event);


      canvas.style.cursor =
        id
          ? 'pointer'
          : 'grab';


      hover(id);


      /**
       * Detect whether the pointer moved enough to count as
       * a drag instead of a click/tap.
       */
      const start =
        activePointers.get(
          event.pointerId
        );


      if (
        start &&
        Math.abs(
          event.clientX -
          start.x
        ) +
          Math.abs(
            event.clientY -
            start.y
          ) >
          6
      ) {
        gestureMoved = true;
      }
    }
  );


  canvas.addEventListener(
    'pointerup',
    (event) => {
      /**
       * A valid node click must:
       * - involve one pointer
       * - not have moved significantly
       * - use the primary mouse button
       */
      const singleTap =
        activePointers.size === 1 &&
        !gestureMoved &&
        event.button === 0;


      activePointers.delete(
        event.pointerId
      );


      if (!singleTap) {
        return;
      }


      const id =
        hit(event);


      // Click a node to enter it.
      if (id) {
        onSelect(id);
      } else {
        // Clicking empty space moves back one level.
        onBack();
      }
    }
  );


  // Cancelled gestures should not trigger a click.
  canvas.addEventListener(
    'pointercancel',
    (event) => {
      activePointers.delete(
        event.pointerId
      );

      gestureMoved = true;
    }
  );


  /* ==========================================================
     Keyboard Navigation
     ========================================================== */

  canvas.addEventListener(
    'keydown',
    (event) => {
      /**
       * Escape, Backspace, or left arrow:
       * return to the parent level.
       */
      if (
        [
          'Escape',
          'Backspace',
          'ArrowLeft',
        ].includes(
          event.key
        )
      ) {
        event.preventDefault();
        onBack();
      }


      // Home returns to the architecture root.
      if (
        event.key === 'Home'
      ) {
        event.preventDefault();

        onSelect(
          data.rootId
        );
      }


      /**
       * Right arrow enters the first child of the current node,
       * if one exists.
       */
      if (
        event.key ===
        'ArrowRight'
      ) {
        const child =
          architectureChildren(
            data,
            state.selected,
            state.showInactive
          )[0];


        if (child) {
          event.preventDefault();

          onSelect(
            child.id
          );
        }
      }
    }
  );


  /* ==========================================================
     Orbit Control Events
     ========================================================== */

  // Re-render whenever OrbitControls changes the camera.
  orbit.addEventListener(
    'change',
    invalidate
  );


  /**
   * Manual camera movement cancels automatic camera transitions.
   */
  orbit.addEventListener(
    'start',
    () => {
      transition = null;
      invalidate();
    }
  );


  /* ==========================================================
     Resize Observer
     ========================================================== */

  const observer =
    new ResizeObserver(
      resize
    );

  observer.observe(
    viewport
  );


  // Perform the initial render sizing.
  resize();


  /* ==========================================================
     Reduced Motion Changes
     ========================================================== */

  motion.addEventListener(
    'change',
    () => {
      orbit.enableDamping =
        !motion.matches;

      invalidate();
    }
  );


  /* ==========================================================
     Public Scene API
     ========================================================== */

  return {
    update,

    // Allows outside code to move keyboard focus into the scene.
    focus: () =>
      canvas.focus(),
  };
}