export type ArchitectureStatus = 'inactive' | 'helper';

export interface ArchitectureNode {
  id: string;
  label: string;
  type: string;
  category: string;
  parent?: string;
  description: string;
  details?: { label: string; value: string }[];
  status?: ArchitectureStatus;
  position?: { x: number; y: number; z?: number };
  collapsedByDefault?: boolean;
  link?: { label: string; href: string };
}

export interface ArchitectureConnection {
  from: string;
  to: string;
  type: 'contains' | 'runs' | 'storage' | 'backup' | 'observes' | 'dns' | 'remote' | 'allowed' | 'blocked' | 'exception';
  label: string;
  direction: 'forward' | 'bidirectional';
  views: string[];
}

export interface ArchitectureView {
  id: string;
  label: string;
  description: string;
  focus: string[];
}

export interface Architecture {
  title: string;
  intro: string;
  rootId: string;
  views: ArchitectureView[];
  nodes: ArchitectureNode[];
  connections: ArchitectureConnection[];
}

export function architecturePath(architecture: Architecture, id: string): ArchitectureNode[] {
  const byId = new Map(architecture.nodes.map((node) => [node.id, node]));
  const path: ArchitectureNode[] = [];
  let current = byId.get(id);
  const seen = new Set<string>();
  while (current) {
    if (seen.has(current.id)) throw new Error(`Architecture cycle at ${current.id}`);
    seen.add(current.id);
    path.unshift(current);
    current = current.parent ? byId.get(current.parent) : undefined;
  }
  return path;
}

export function architectureChildren(architecture: Architecture, id: string, showInactive = false): ArchitectureNode[] {
  return architecture.nodes.filter((node) => node.parent === id && (showInactive || node.status !== 'inactive'));
}

export function validateArchitecture(architecture: Architecture): void {
  const ids = new Set(architecture.nodes.map((node) => node.id));
  if (ids.size !== architecture.nodes.length || !ids.has(architecture.rootId)) throw new Error('Invalid architecture node IDs');
  for (const node of architecture.nodes) {
    if (node.parent && !ids.has(node.parent)) throw new Error(`Invalid parent for ${node.id}`);
    architecturePath(architecture, node.id);
  }
  for (const connection of architecture.connections) {
    if (!ids.has(connection.from) || !ids.has(connection.to)) throw new Error(`Invalid architecture connection: ${connection.from} to ${connection.to}`);
  }
  for (const view of architecture.views) {
    if (view.focus.some((id) => !ids.has(id))) throw new Error(`Invalid architecture view: ${view.id}`);
  }
}
