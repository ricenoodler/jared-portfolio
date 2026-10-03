import type { Project } from '../content';
import {
  architectureChildren,
  architecturePath,
  validateArchitecture,
  type Architecture,
  type ArchitectureConnection,
  type ArchitectureNode,
} from '../data/architecture';
import { proxmoxArchitecture } from '../data/proxmoxArchitecture';
import { unifiArchitecture } from '../data/unifiArchitecture';
import { escapeHtml } from '../utils';
import { createArchitectureScene, type ArchitectureScene } from './ArchitectureScene';

const architectures: Record<NonNullable<Project['caseStudy']['architecture']>, Architecture> = {
  proxmox: proxmoxArchitecture,
  unifi: unifiArchitecture,
};

const sceneInstances = new WeakMap<HTMLElement, ArchitectureScene>();

interface ExplorerState {
  selected: string;
  view: string;
  showInactive: boolean;
  detailOpen: boolean;
}

function viewFor(architecture: Architecture, state: ExplorerState) {
  return architecture.views.find((view) => view.id === state.view) ?? architecture.views[0];
}

function viewAnchor(architecture: Architecture, viewId: string): string {
  const focus = architecture.views.find((view) => view.id === viewId)?.focus ?? [];
  if (viewId === 'overview' || !focus.length) return architecture.rootId;
  const paths = focus.map((id) => architecturePath(architecture, id));
  const shared = paths[0].filter((node, index) => paths.every((path) => path[index]?.id === node.id));
  return shared.at(-1)?.id ?? architecture.rootId;
}

function relevant(architecture: Architecture, state: ExplorerState, node: ArchitectureNode): boolean {
  if (state.view === 'overview') return true;
  const view = viewFor(architecture, state);
  const selectedPath = architecturePath(architecture, state.selected).map((item) => item.id);
  if (selectedPath.includes(node.id)) return true;
  const nodePath = architecturePath(architecture, node.id).map((item) => item.id);
  return view.focus.some((id) => nodePath.includes(id) || architecturePath(architecture, id).some((item) => item.id === node.id));
}

function nodeButton(architecture: Architecture, state: ExplorerState, node: ArchitectureNode, className: string): string {
  const children = architectureChildren(architecture, node.id, state.showInactive);
  const expanded = children.length ? ` aria-expanded="${node.id === state.selected}"` : '';
  const classes = [className, relevant(architecture, state, node) ? '' : 'is-dimmed', node.id === state.selected ? 'is-selected' : ''].filter(Boolean).join(' ');
  return `<button type="button" class="${classes}" data-explorer-node="${escapeHtml(node.id)}"${expanded}>
    <span class="explorer-node-type">${escapeHtml(node.type)}</span>
    <strong>${escapeHtml(node.label)}</strong>
    <span class="explorer-node-hint">${node.status === 'inactive' ? 'Inactive' : children.length ? `Explore ${children.length}` : 'View details'}</span>
  </button>`;
}

function stage(architecture: Architecture, state: ExplorerState): string {
  const current = architecture.nodes.find((node) => node.id === state.selected) ?? architecture.nodes[0];
  const path = architecturePath(architecture, current.id);
  const children = architectureChildren(architecture, current.id, state.showInactive);
  const siblings = current.parent ? architectureChildren(architecture, current.parent, state.showInactive).filter((node) => node.id !== current.id) : [];
  const hiddenInactive = architecture.nodes.filter((node) => node.parent === current.id && node.status === 'inactive').length;
  return `<div class="explorer-path" aria-label="Architecture location">${path.map((node, index) =>
    `<button type="button" data-explorer-jump="${escapeHtml(node.id)}" ${index === path.length - 1 ? 'aria-current="location"' : ''}>${escapeHtml(node.label)}</button>`).join('<span aria-hidden="true">/</span>')}</div>
    <div class="explorer-map">
      <div class="explorer-focus">${nodeButton(architecture, state, current, 'explorer-node explorer-node--focus')}</div>
      ${children.length ? `<div class="explorer-flow" aria-hidden="true"><span></span><b>Contains / connects</b><span></span></div>
        <div class="explorer-children" aria-label="Inside ${escapeHtml(current.label)}">${children.map((node) => nodeButton(architecture, state, node, 'explorer-node')).join('')}</div>` : `<p class="explorer-end">No deeper level in this branch.</p>`}
      ${hiddenInactive && !state.showInactive ? `<p class="explorer-inactive-note">${hiddenInactive} inactive item${hiddenInactive === 1 ? '' : 's'} hidden. <button type="button" data-explorer-inactive>Show inactive</button></p>` : ''}
      ${siblings.length ? `<div class="explorer-siblings"><span>Other branches at this level</span><div>${siblings.map((node) => nodeButton(architecture, state, node, 'explorer-node explorer-node--sibling')).join('')}</div></div>` : ''}
    </div>`;
}

function relationBadge(connection: ArchitectureConnection): string {
  const label = connection.type === 'blocked' ? 'Blocked' : connection.type === 'allowed' ? 'Allowed' : connection.type === 'exception' ? 'Exception' : connection.type;
  return `<span class="explorer-relation-badge explorer-relation-badge--${escapeHtml(connection.type)}">${escapeHtml(label)}</span>`;
}

function viewRelations(architecture: Architecture, state: ExplorerState): string {
  const connections = architecture.connections.filter((connection) => connection.views.includes(state.view));
  if (!connections.length) return '';
  return `<div class="explorer-relations" aria-label="Relationships in ${escapeHtml(viewFor(architecture, state).label)} view">
    ${connections.map((connection) => `<div class="explorer-relation">${relationBadge(connection)}<span>${escapeHtml(connection.label)}</span></div>`).join('')}
  </div>`;
}

function detail(architecture: Architecture, state: ExplorerState): string {
  if (!state.detailOpen) return '';
  const node = architecture.nodes.find((entry) => entry.id === state.selected);
  if (!node) return '';
  const related = architecture.connections.filter((connection) =>
    (connection.from === node.id || connection.to === node.id) &&
    (state.showInactive || architecture.nodes.find((item) => item.id === (connection.from === node.id ? connection.to : connection.from))?.status !== 'inactive'));
  const count = architectureChildren(architecture, node.id, state.showInactive).length;
  return `<div class="explorer-detail-head"><div><span>${escapeHtml(node.type)}</span><h3 id="explorer-detail-title">${escapeHtml(node.label)}</h3></div>
      <button type="button" class="explorer-detail-back" data-explorer-back aria-label="Back to previous architecture level">← Back</button></div>
    <p>${escapeHtml(node.description)}</p>
    ${node.status ? `<span class="explorer-status">${node.status === 'inactive' ? 'Inactive / exited' : 'Helper'}</span>` : ''}
    ${node.details?.length ? `<dl class="explorer-details">${node.details.map((item) => `<div><dt>${escapeHtml(item.label)}</dt><dd>${escapeHtml(item.value)}</dd></div>`).join('')}</dl>` : ''}
    ${count ? `<p class="explorer-contains">Contains ${count} ${count === 1 ? 'item' : 'items'} at the next level</p>` : ''}
    ${related.length ? `<div class="explorer-related"><h4>Relationships</h4>${related.map((connection) => {
      const otherId = connection.from === node.id ? connection.to : connection.from;
      const other = architecture.nodes.find((item) => item.id === otherId);
      return `<div>${relationBadge(connection)}<button type="button" data-explorer-jump="${escapeHtml(otherId)}">${escapeHtml(connection.label)} ${other ? '↗' : ''}</button></div>`;
    }).join('')}</div>` : ''}
    ${node.link ? `<a href="${escapeHtml(node.link.href)}" data-link class="explorer-cross-link">${escapeHtml(node.link.label)}</a>` : ''}`;
}

function updateExplorer(root: HTMLElement, architecture: Architecture, state: ExplorerState): void {
  sceneInstances.get(root)?.update(state);
  const view = viewFor(architecture, state);
  root.querySelector<HTMLElement>('[data-explorer-stage]')!.innerHTML = stage(architecture, state);
  root.querySelector<HTMLElement>('[data-explorer-view-copy]')!.textContent = view.description;
  root.querySelector<HTMLElement>('[data-explorer-relations]')!.innerHTML = viewRelations(architecture, state);
  const detailPanel = root.querySelector<HTMLElement>('[data-explorer-detail]')!;
  detailPanel.innerHTML = detail(architecture, state);
  detailPanel.hidden = !state.detailOpen;
  root.classList.toggle('has-detail', state.detailOpen);
  root.querySelectorAll<HTMLButtonElement>('[data-explorer-view]').forEach((button) =>
    button.setAttribute('aria-pressed', String(button.dataset.explorerView === state.view)));
  root.querySelectorAll<HTMLButtonElement>('[data-explorer-inactive]').forEach((button) => {
    button.setAttribute('aria-pressed', String(state.showInactive));
    if (button.classList.contains('explorer-inactive-toggle')) button.textContent = state.showInactive ? 'Hide inactive' : 'Show inactive';
  });
}

function focusNode(root: HTMLElement, id: string): void {
  if (sceneInstances.has(root)) {
    [...root.querySelectorAll<HTMLButtonElement>('[data-scene-node]')].find((item) => item.dataset.sceneNode === id)?.focus();
    return;
  }
  const button = [...root.querySelectorAll<HTMLButtonElement>('[data-explorer-node]')].find((item) => item.dataset.explorerNode === id);
  button?.focus();
}

function highlightRelations(root: HTMLElement, architecture: Architecture, id?: string): void {
  const related = new Set(id ? architecture.connections.filter((connection) => connection.from === id || connection.to === id)
    .flatMap((connection) => [connection.from, connection.to]) : []);
  root.querySelectorAll<HTMLElement>('[data-explorer-node]').forEach((element) => {
    const nodeId = element.dataset.explorerNode ?? '';
    element.classList.toggle('is-related', Boolean(id) && related.has(nodeId) && nodeId !== id);
    element.classList.toggle('is-soft-muted', Boolean(id) && !related.has(nodeId) && nodeId !== id);
  });
}

export function ProjectArchitecture(project: Project): string {
  const key = project.caseStudy.architecture;
  const architecture = key ? architectures[key] : undefined;
  if (!architecture) {
    return `<section class="case-section case-architecture" id="architecture" aria-labelledby="architecture-title"><div class="shell case-section-grid">
      <div class="case-section-heading"><span class="case-section-number">02 / SYSTEM MAP</span><h2 id="architecture-title">Architecture<span class="accent-dot">.</span></h2></div>
      <div class="architecture-empty">A system map for this project is in preparation.</div>
    </div></section>`;
  }
  validateArchitecture(architecture);
  const state: ExplorerState = { selected: architecture.rootId, view: 'overview', showInactive: false, detailOpen: false };
  return `<section class="case-section case-architecture" id="architecture" aria-labelledby="architecture-title"><div class="shell">
    <div class="case-section-grid"><div class="case-section-heading"><span class="case-section-number">02 / SYSTEM MAP</span><h2 id="architecture-title">Architecture<span class="accent-dot">.</span></h2></div>
      <div class="case-section-copy"><p>${escapeHtml(architecture.intro)}</p><span class="architecture-status">Select a node to explore a branch</span></div></div>
    <div class="architecture-explorer" data-architecture-explorer="${key}">
      <div class="explorer-toolbar"><div class="explorer-views" role="group" aria-label="Architecture views">
        ${architecture.views.map((view) => `<button type="button" data-explorer-view="${escapeHtml(view.id)}" aria-pressed="${view.id === 'overview'}">${escapeHtml(view.label)}</button>`).join('')}
      </div>${key === 'proxmox' ? '<button type="button" class="explorer-inactive-toggle" data-explorer-inactive aria-pressed="false">Show inactive</button>' : ''}</div>
      <p class="explorer-view-copy" data-explorer-view-copy>${escapeHtml(architecture.views[0].description)}</p>
      <div class="explorer-layout"><div class="explorer-visual"><div data-explorer-scene-host></div><div class="explorer-stage" data-explorer-stage>${stage(architecture, state)}</div></div>
        <aside class="explorer-detail" data-explorer-detail role="region" aria-live="polite" aria-labelledby="explorer-detail-title" hidden></aside></div>
      <div data-explorer-relations>${viewRelations(architecture, state)}</div>
    </div>
  </div></section>`;
}

export function initProjectArchitectures(): void {
  document.querySelectorAll<HTMLElement>('[data-architecture-explorer]').forEach((root) => {
    const key = root.dataset.architectureExplorer as keyof typeof architectures;
    const architecture = architectures[key];
    if (!architecture) return;
    const state: ExplorerState = { selected: architecture.rootId, view: 'overview', showInactive: false, detailOpen: false };
    const back = () => {
      const selected = architecture.nodes.find((node) => node.id === state.selected);
      state.selected = selected?.parent ?? architecture.rootId;
      state.detailOpen = state.selected !== architecture.rootId;
      updateExplorer(root, architecture, state);
      focusNode(root, state.selected);
    };

    const sceneHost = root.querySelector<HTMLElement>('[data-explorer-scene-host]');
    if (sceneHost) {
      const selectInScene = (id: string) => {
        state.selected = id;
        state.detailOpen = id !== architecture.rootId;
        updateExplorer(root, architecture, state);
        focusNode(root, id);
      };
      const scene = createArchitectureScene(sceneHost, architecture, selectInScene, back);
      if (scene) {
        sceneInstances.set(root, scene);
        root.classList.add('has-webgl');
        scene.update(state);
      } else {
        sceneHost.remove();
      }
    }
    root.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      const viewButton = target.closest<HTMLButtonElement>('[data-explorer-view]');
      if (viewButton) {
        state.view = viewButton.dataset.explorerView ?? 'overview';
        state.selected = viewAnchor(architecture, state.view);
        state.detailOpen = false;
        updateExplorer(root, architecture, state);
        root.querySelector<HTMLButtonElement>(`[data-explorer-view="${state.view}"]`)?.focus();
        return;
      }
      if (target.closest('[data-explorer-inactive]')) {
        state.showInactive = !state.showInactive;
        const selected = architecture.nodes.find((node) => node.id === state.selected);
        if (selected?.status === 'inactive' && !state.showInactive) {
          let candidate: ArchitectureNode | undefined = selected;
          while (candidate?.status === 'inactive') {
            const parentId: string | undefined = candidate.parent;
            candidate = architecture.nodes.find((node) => node.id === parentId);
          }
          state.selected = candidate?.id ?? architecture.rootId;
          state.detailOpen = state.selected !== architecture.rootId;
        }
        updateExplorer(root, architecture, state);
        root.querySelector<HTMLButtonElement>('.explorer-inactive-toggle')?.focus();
        return;
      }
      if (target.closest('[data-explorer-back]')) { back(); return; }
      const jump = target.closest<HTMLButtonElement>('[data-explorer-jump]');
      if (jump) {
        state.selected = jump.dataset.explorerJump ?? architecture.rootId;
        state.detailOpen = state.selected !== architecture.rootId;
        updateExplorer(root, architecture, state);
        focusNode(root, state.selected);
        return;
      }
      const button = target.closest<HTMLButtonElement>('[data-explorer-node]');
      if (!button) return;
      const id = button.dataset.explorerNode ?? architecture.rootId;
      if (id === state.selected) {
        const selected = architecture.nodes.find((node) => node.id === id);
        if (selected?.parent) { back(); return; }
        state.detailOpen = !state.detailOpen;
      } else {
        state.selected = id;
        state.detailOpen = true;
      }
      updateExplorer(root, architecture, state);
      focusNode(root, state.selected);
    });
    root.addEventListener('keydown', (event) => {
      const target = event.target as HTMLElement;
      if (event.key === 'Escape' && (state.selected !== architecture.rootId || state.detailOpen)) {
        event.preventDefault();
        back();
      }
      const nodeButton = target.closest<HTMLButtonElement>('[data-explorer-node]');
      if (!nodeButton) return;
      if (event.key === 'ArrowLeft' || event.key === 'Backspace') { event.preventDefault(); back(); }
      if (event.key === 'Home') {
        event.preventDefault();
        state.selected = architecture.rootId; state.detailOpen = false;
        updateExplorer(root, architecture, state); focusNode(root, state.selected);
      }
      if (event.key === 'ArrowRight') {
        const first = architectureChildren(architecture, nodeButton.dataset.explorerNode ?? '', state.showInactive)[0];
        if (first) {
          event.preventDefault();
          state.selected = first.id; state.detailOpen = true;
          updateExplorer(root, architecture, state); focusNode(root, first.id);
        }
      }
    });
    root.addEventListener('pointerover', (event) => {
      const button = (event.target as HTMLElement).closest<HTMLElement>('[data-explorer-node]');
      if (button) highlightRelations(root, architecture, button.dataset.explorerNode);
    });
    root.addEventListener('pointerout', (event) => {
      if (!(event.relatedTarget instanceof Node) || !root.contains(event.relatedTarget)) highlightRelations(root, architecture);
    });
    root.addEventListener('focusin', (event) => {
      const button = (event.target as HTMLElement).closest<HTMLElement>('[data-explorer-node]');
      if (button) highlightRelations(root, architecture, button.dataset.explorerNode);
    });
    root.addEventListener('focusout', (event) => {
      if (!(event.relatedTarget instanceof Node) || !root.contains(event.relatedTarget)) highlightRelations(root, architecture);
    });
  });
}
