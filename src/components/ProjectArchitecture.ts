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

import {
  createArchitectureScene,
  type ArchitectureScene,
} from './ArchitectureScene';


/* ============================================================
   Available Architectures
   ============================================================ */

/**
 * Maps each supported project architecture key to its data.
 */
const architectures: Record<
  NonNullable<Project['caseStudy']['architecture']>,
  Architecture
> = {
  proxmox: proxmoxArchitecture,
  unifi: unifiArchitecture,
};


/**
 * Stores the Three.js scene associated with each explorer element.
 *
 * WeakMap allows the DOM element and its scene reference to be
 * garbage-collected when the explorer is removed.
 */
const sceneInstances =
  new WeakMap<
    HTMLElement,
    ArchitectureScene
  >();


/* ============================================================
   Explorer State
   ============================================================ */

interface ExplorerState {
  // Currently selected architecture node.
  selected: string;

  // Currently selected architecture view.
  view: string;

  // Whether inactive nodes should be visible.
  showInactive: boolean;

  // Whether the details panel is currently open.
  detailOpen: boolean;
}


/* ============================================================
   View Helpers
   ============================================================ */

/**
 * Return the currently selected architecture view.
 *
 * Falls back to the first available view if the requested
 * view cannot be found.
 */
function viewFor(
  architecture: Architecture,
  state: ExplorerState
) {
  return (
    architecture.views.find(
      (view) =>
        view.id === state.view
    ) ??
    architecture.views[0]
  );
}


/**
 * Determine which node should become selected when changing views.
 *
 * Overview always starts at the root.
 *
 * For other views, this finds the deepest node shared by all
 * configured focus paths.
 */
function viewAnchor(
  architecture: Architecture,
  viewId: string
): string {
  const focus =
    architecture.views.find(
      (view) =>
        view.id === viewId
    )?.focus ?? [];


  // Overview and views without focus nodes start at the root.
  if (
    viewId === 'overview' ||
    !focus.length
  ) {
    return architecture.rootId;
  }


  // Get the full hierarchy path for every focus node.
  const paths =
    focus.map(
      (id) =>
        architecturePath(
          architecture,
          id
        )
    );


  /**
   * Find the hierarchy nodes shared by every focus path.
   *
   * The final shared node becomes the anchor for the view.
   */
  const shared =
    paths[0].filter(
      (node, index) =>
        paths.every(
          (path) =>
            path[index]?.id ===
            node.id
        )
    );


  return (
    shared.at(-1)?.id ??
    architecture.rootId
  );
}


/**
 * Determine whether a node is relevant to the current view.
 *
 * Irrelevant nodes can still appear, but may be visually dimmed.
 */
function relevant(
  architecture: Architecture,
  state: ExplorerState,
  node: ArchitectureNode
): boolean {
  // Everything is relevant in overview mode.
  if (
    state.view === 'overview'
  ) {
    return true;
  }


  const view =
    viewFor(
      architecture,
      state
    );


  // Get the hierarchy path of the selected node.
  const selectedPath =
    architecturePath(
      architecture,
      state.selected
    ).map(
      (item) =>
        item.id
    );


  // Nodes along the selected path are always relevant.
  if (
    selectedPath.includes(
      node.id
    )
  ) {
    return true;
  }


  // Get the hierarchy path of the node being checked.
  const nodePath =
    architecturePath(
      architecture,
      node.id
    ).map(
      (item) =>
        item.id
    );


  /**
   * A node is relevant if:
   * - one of the view's focus nodes appears in its path, or
   * - this node appears in the path to one of the focus nodes.
   */
  return view.focus.some(
    (id) =>
      nodePath.includes(id) ||
      architecturePath(
        architecture,
        id
      ).some(
        (item) =>
          item.id === node.id
      )
  );
}


/* ============================================================
   Node Button
   ============================================================ */

/**
 * Render one architecture node as an accessible button.
 */
function nodeButton(
  architecture: Architecture,
  state: ExplorerState,
  node: ArchitectureNode,
  className: string
): string {
  // Determine which children are currently visible.
  const children =
    architectureChildren(
      architecture,
      node.id,
      state.showInactive
    );


  /**
   * Expandable nodes receive aria-expanded.
   *
   * It becomes true when this is the currently selected node.
   */
  const expanded =
    children.length
      ? ` aria-expanded="${node.id === state.selected}"`
      : '';


  // Build the final CSS class list.
  const classes = [
    className,

    // Dim nodes unrelated to the current view.
    relevant(
      architecture,
      state,
      node
    )
      ? ''
      : 'is-dimmed',

    // Highlight the selected node.
    node.id === state.selected
      ? 'is-selected'
      : '',
  ]
    .filter(Boolean)
    .join(' ');


  return `
    <button
      type="button"
      class="${classes}"
      data-explorer-node="${escapeHtml(node.id)}"
      ${expanded}
    >

      <!-- Node type, such as VM, service, network, etc. -->
      <span class="explorer-node-type">
        ${escapeHtml(node.type)}
      </span>

      <!-- Main node name. -->
      <strong>
        ${escapeHtml(node.label)}
      </strong>

      <!-- Short hint explaining what selecting the node does. -->
      <span class="explorer-node-hint">
        ${
          node.status === 'inactive'
            ? 'Inactive'
            : children.length
              ? `Explore ${children.length}`
              : 'View details'
        }
      </span>

    </button>
  `;
}


/* ============================================================
   Fallback 2D Explorer Stage
   ============================================================ */

/**
 * Render the HTML version of the architecture explorer.
 *
 * This acts as the fallback when WebGL is unavailable.
 */
function stage(
  architecture: Architecture,
  state: ExplorerState
): string {
  // Find the currently selected node.
  const current =
    architecture.nodes.find(
      (node) =>
        node.id === state.selected
    ) ??
    architecture.nodes[0];


  // Full hierarchy path leading to the selected node.
  const path =
    architecturePath(
      architecture,
      current.id
    );


  // Children inside the selected node.
  const children =
    architectureChildren(
      architecture,
      current.id,
      state.showInactive
    );


  // Other nodes sharing the same parent.
  const siblings =
    current.parent
      ? architectureChildren(
          architecture,
          current.parent,
          state.showInactive
        ).filter(
          (node) =>
            node.id !== current.id
        )
      : [];


  /**
   * Count inactive children that are currently hidden.
   *
   * This lets us show the "inactive items hidden" message.
   */
  const hiddenInactive =
    architecture.nodes.filter(
      (node) =>
        node.parent === current.id &&
        node.status === 'inactive'
    ).length;


  return `
    <!-- Breadcrumb showing the current architecture location. -->
    <div
      class="explorer-path"
      aria-label="Architecture location"
    >
      ${
        path
          .map(
            (node, index) => `
              <button
                type="button"
                data-explorer-jump="${escapeHtml(node.id)}"
                ${
                  index === path.length - 1
                    ? 'aria-current="location"'
                    : ''
                }
              >
                ${escapeHtml(node.label)}
              </button>
            `
          )
          .join(
            '<span aria-hidden="true">/</span>'
          )
      }
    </div>


    <div class="explorer-map">

      <!-- Currently selected node. -->
      <div class="explorer-focus">
        ${
          nodeButton(
            architecture,
            state,
            current,
            'explorer-node explorer-node--focus'
          )
        }
      </div>


      ${
        children.length
          ? `
              <!-- Visual connector between parent and children. -->
              <div
                class="explorer-flow"
                aria-hidden="true"
              >
                <span></span>
                <b>Contains / connects</b>
                <span></span>
              </div>


              <!-- Direct children of the current node. -->
              <div
                class="explorer-children"
                aria-label="Inside ${escapeHtml(current.label)}"
              >
                ${
                  children
                    .map(
                      (node) =>
                        nodeButton(
                          architecture,
                          state,
                          node,
                          'explorer-node'
                        )
                    )
                    .join('')
                }
              </div>
            `
          : `
              <!-- This branch cannot be expanded any further. -->
              <p class="explorer-end">
                No deeper level in this branch.
              </p>
            `
      }


      ${
        hiddenInactive &&
        !state.showInactive
          ? `
              <!-- Let the user reveal hidden inactive children. -->
              <p class="explorer-inactive-note">
                ${hiddenInactive}
                inactive
                ${
                  hiddenInactive === 1
                    ? 'item'
                    : 'items'
                }
                hidden.

                <button
                  type="button"
                  data-explorer-inactive
                >
                  Show inactive
                </button>
              </p>
            `
          : ''
      }


      ${
        siblings.length
          ? `
              <!-- Other nodes at the same hierarchy level. -->
              <div class="explorer-siblings">

                <span>
                  Other branches at this level
                </span>

                <div>
                  ${
                    siblings
                      .map(
                        (node) =>
                          nodeButton(
                            architecture,
                            state,
                            node,
                            'explorer-node explorer-node--sibling'
                          )
                      )
                      .join('')
                  }
                </div>

              </div>
            `
          : ''
      }

    </div>
  `;
}


/* ============================================================
   Relationship Badges
   ============================================================ */

/**
 * Render the colored badge used for a connection type.
 */
function relationBadge(
  connection: ArchitectureConnection
): string {
  const label =
    connection.type === 'blocked'
      ? 'Blocked'
      : connection.type === 'allowed'
        ? 'Allowed'
        : connection.type === 'exception'
          ? 'Exception'
          : connection.type;


  return `
    <span
      class="explorer-relation-badge explorer-relation-badge--${escapeHtml(connection.type)}"
    >
      ${escapeHtml(label)}
    </span>
  `;
}


/**
 * Render all explicitly defined relationships for the current view.
 */
function viewRelations(
  architecture: Architecture,
  state: ExplorerState
): string {
  const connections =
    architecture.connections.filter(
      (connection) =>
        connection.views.includes(
          state.view
        )
    );


  // Hide the relationship section when this view has none.
  if (!connections.length) {
    return '';
  }


  return `
    <div
      class="explorer-relations"
      aria-label="Relationships in ${escapeHtml(
        viewFor(
          architecture,
          state
        ).label
      )} view"
    >

      ${
        connections
          .map(
            (connection) => `
              <div class="explorer-relation">

                ${relationBadge(connection)}

                <span>
                  ${escapeHtml(connection.label)}
                </span>

              </div>
            `
          )
          .join('')
      }

    </div>
  `;
}


/* ============================================================
   Detail Panel
   ============================================================ */

/**
 * Render the details panel for the currently selected node.
 */
function detail(
  architecture: Architecture,
  state: ExplorerState
): string {
  // Panel is hidden unless explicitly opened.
  if (!state.detailOpen) {
    return '';
  }


  const node =
    architecture.nodes.find(
      (entry) =>
        entry.id === state.selected
    );


  if (!node) {
    return '';
  }


  /**
   * Find every defined connection involving this node.
   *
   * Inactive connected nodes are ignored unless showInactive is enabled.
   */
  const related =
    architecture.connections.filter(
      (connection) =>
        (
          connection.from === node.id ||
          connection.to === node.id
        ) &&
        (
          state.showInactive ||
          architecture.nodes.find(
            (item) =>
              item.id === (
                connection.from === node.id
                  ? connection.to
                  : connection.from
              )
          )?.status !== 'inactive'
        )
    );


  // Number of visible children contained inside this node.
  const count =
    architectureChildren(
      architecture,
      node.id,
      state.showInactive
    ).length;


  return `
    <!-- Detail panel heading. -->
    <div class="explorer-detail-head">

      <div>

        <span>
          ${escapeHtml(node.type)}
        </span>

        <h3 id="explorer-detail-title">
          ${escapeHtml(node.label)}
        </h3>

      </div>

      <button
        type="button"
        class="explorer-detail-back"
        data-explorer-back
        aria-label="Back to previous architecture level"
      >
        ← Back
      </button>

    </div>


    <!-- Node description. -->
    <p>
      ${escapeHtml(node.description)}
    </p>


    ${
      node.status
        ? `
            <!-- Optional status label. -->
            <span class="explorer-status">
              ${
                node.status === 'inactive'
                  ? 'Inactive / exited'
                  : 'Helper'
              }
            </span>
          `
        : ''
    }


    ${
      node.details?.length
        ? `
            <!-- Additional key/value details about the node. -->
            <dl class="explorer-details">

              ${
                node.details
                  .map(
                    (item) => `
                      <div>

                        <dt>
                          ${escapeHtml(item.label)}
                        </dt>

                        <dd>
                          ${escapeHtml(item.value)}
                        </dd>

                      </div>
                    `
                  )
                  .join('')
              }

            </dl>
          `
        : ''
    }


    ${
      count
        ? `
            <!-- Indicate that the node contains another level. -->
            <p class="explorer-contains">
              Contains
              ${count}
              ${
                count === 1
                  ? 'item'
                  : 'items'
              }
              at the next level
            </p>
          `
        : ''
    }


    ${
      related.length
        ? `
            <!-- Connections involving this node. -->
            <div class="explorer-related">

              <h4>
                Relationships
              </h4>

              ${
                related
                  .map(
                    (connection) => {
                      // Determine the node on the other end.
                      const otherId =
                        connection.from === node.id
                          ? connection.to
                          : connection.from;


                      const other =
                        architecture.nodes.find(
                          (item) =>
                            item.id === otherId
                        );


                      return `
                        <div>

                          ${relationBadge(connection)}

                          <button
                            type="button"
                            data-explorer-jump="${escapeHtml(otherId)}"
                          >
                            ${escapeHtml(connection.label)}
                            ${other ? '↗' : ''}
                          </button>

                        </div>
                      `;
                    }
                  )
                  .join('')
              }

            </div>
          `
        : ''
    }


    ${
      node.link
        ? `
            <!-- Optional link to another page on the portfolio. -->
            <a
              href="${escapeHtml(node.link.href)}"
              data-link
              class="explorer-cross-link"
            >
              ${escapeHtml(node.link.label)}
            </a>
          `
        : ''
    }
  `;
}


/* ============================================================
   Update Explorer UI
   ============================================================ */

/**
 * Synchronize the explorer DOM and Three.js scene with state.
 */
function updateExplorer(
  root: HTMLElement,
  architecture: Architecture,
  state: ExplorerState
): void {
  // Update the WebGL scene if one exists.
  sceneInstances
    .get(root)
    ?.update(state);


  const view =
    viewFor(
      architecture,
      state
    );


  // Update the fallback HTML architecture stage.
  root.querySelector<HTMLElement>(
    '[data-explorer-stage]'
  )!.innerHTML =
    stage(
      architecture,
      state
    );


  // Update the explanatory text for the current view.
  root.querySelector<HTMLElement>(
    '[data-explorer-view-copy]'
  )!.textContent =
    view.description;


  // Update relationship descriptions.
  root.querySelector<HTMLElement>(
    '[data-explorer-relations]'
  )!.innerHTML =
    viewRelations(
      architecture,
      state
    );


  // Update the details panel.
  const detailPanel =
    root.querySelector<HTMLElement>(
      '[data-explorer-detail]'
    )!;


  detailPanel.innerHTML =
    detail(
      architecture,
      state
    );


  detailPanel.hidden =
    !state.detailOpen;


  // Allows CSS to change the layout while details are visible.
  root.classList.toggle(
    'has-detail',
    state.detailOpen
  );


  // Update selected architecture-view button.
  root
    .querySelectorAll<HTMLButtonElement>(
      '[data-explorer-view]'
    )
    .forEach(
      (button) =>
        button.setAttribute(
          'aria-pressed',
          String(
            button.dataset.explorerView ===
            state.view
          )
        )
    );


  // Update inactive-node toggles.
  root
    .querySelectorAll<HTMLButtonElement>(
      '[data-explorer-inactive]'
    )
    .forEach(
      (button) => {
        button.setAttribute(
          'aria-pressed',
          String(
            state.showInactive
          )
        );


        // Main toolbar toggle also changes its visible label.
        if (
          button.classList.contains(
            'explorer-inactive-toggle'
          )
        ) {
          button.textContent =
            state.showInactive
              ? 'Hide inactive'
              : 'Show inactive';
        }
      }
    );
}


/* ============================================================
   Focus Helpers
   ============================================================ */

/**
 * Move keyboard focus to a specific architecture node.
 */
function focusNode(
  root: HTMLElement,
  id: string
): void {
  /**
   * If the WebGL version is active, focus its matching
   * accessible HTML node label.
   */
  if (
    sceneInstances.has(root)
  ) {
    [
      ...root.querySelectorAll<HTMLButtonElement>(
        '[data-scene-node]'
      ),
    ]
      .find(
        (item) =>
          item.dataset.sceneNode === id
      )
      ?.focus();

    return;
  }


  // Otherwise focus the fallback HTML node.
  const button = [
    ...root.querySelectorAll<HTMLButtonElement>(
      '[data-explorer-node]'
    ),
  ].find(
    (item) =>
      item.dataset.explorerNode === id
  );


  button?.focus();
}


/* ============================================================
   Relationship Highlighting
   ============================================================ */

/**
 * Highlight nodes directly related to a hovered/focused node.
 */
function highlightRelations(
  root: HTMLElement,
  architecture: Architecture,
  id?: string
): void {
  /**
   * Find every node connected to the currently highlighted node.
   */
  const related =
    new Set(
      id
        ? architecture.connections
            .filter(
              (connection) =>
                connection.from === id ||
                connection.to === id
            )
            .flatMap(
              (connection) => [
                connection.from,
                connection.to,
              ]
            )
        : []
    );


  root
    .querySelectorAll<HTMLElement>(
      '[data-explorer-node]'
    )
    .forEach(
      (element) => {
        const nodeId =
          element.dataset.explorerNode ??
          '';


        // Highlight connected nodes.
        element.classList.toggle(
          'is-related',
          Boolean(id) &&
            related.has(nodeId) &&
            nodeId !== id
        );


        // Dim everything unrelated.
        element.classList.toggle(
          'is-soft-muted',
          Boolean(id) &&
            !related.has(nodeId) &&
            nodeId !== id
        );
      }
    );
}


/* ============================================================
   Architecture Section HTML
   ============================================================ */

/**
 * Build the architecture section for a project page.
 */
export function ProjectArchitecture(
  project: Project
): string {
  const key =
    project.caseStudy.architecture;


  const architecture =
    key
      ? architectures[key]
      : undefined;


  /**
   * Projects without architecture data receive a simple
   * placeholder instead of an explorer.
   */
  if (!architecture) {
    return `
      <section
        class="case-section case-architecture"
        id="architecture"
        aria-labelledby="architecture-title"
      >
        <div class="shell case-section-grid">

          <div class="case-section-heading">

            <span class="case-section-number">
              02 / SYSTEM MAP
            </span>

            <h2 id="architecture-title">
              Architecture<span class="accent-dot">.</span>
            </h2>

          </div>

          <div class="architecture-empty">
            A system map for this project is in preparation.
          </div>

        </div>
      </section>
    `;
  }


  // Verify the architecture data before rendering it.
  validateArchitecture(
    architecture
  );


  // Initial explorer state.
  const state: ExplorerState = {
    selected:
      architecture.rootId,

    view:
      'overview',

    showInactive:
      false,

    detailOpen:
      false,
  };


  return `
    <section
      class="case-section case-architecture"
      id="architecture"
      aria-labelledby="architecture-title"
    >
      <div class="shell">


        <!-- Section heading and introduction. -->
        <div class="case-section-grid">

          <div class="case-section-heading">

            <span class="case-section-number">
              02 / SYSTEM MAP
            </span>

            <h2 id="architecture-title">
              Architecture<span class="accent-dot">.</span>
            </h2>

          </div>


          <div class="case-section-copy">

            <p>
              ${escapeHtml(architecture.intro)}
            </p>

            <span class="architecture-status">
              Select a node to explore a branch
            </span>

          </div>

        </div>


        <!-- Main architecture explorer. -->
        <div
          class="architecture-explorer"
          data-architecture-explorer="${key}"
        >


          <!-- View controls. -->
          <div class="explorer-toolbar">

            <div
              class="explorer-views"
              role="group"
              aria-label="Architecture views"
            >

              ${
                architecture.views
                  .map(
                    (view) => `
                      <button
                        type="button"
                        data-explorer-view="${escapeHtml(view.id)}"
                        aria-pressed="${view.id === 'overview'}"
                      >
                        ${escapeHtml(view.label)}
                      </button>
                    `
                  )
                  .join('')
              }

            </div>


            ${
              key === 'proxmox'
                ? `
                    <!-- Proxmox explorer can reveal inactive services. -->
                    <button
                      type="button"
                      class="explorer-inactive-toggle"
                      data-explorer-inactive
                      aria-pressed="false"
                    >
                      Show inactive
                    </button>
                  `
                : ''
            }

          </div>


          <!-- Description for the currently selected view. -->
          <p
            class="explorer-view-copy"
            data-explorer-view-copy
          >
            ${escapeHtml(architecture.views[0].description)}
          </p>


          <div class="explorer-layout">

            <div class="explorer-visual">

              <!-- Three.js scene gets inserted here when supported. -->
              <div data-explorer-scene-host></div>

              <!-- HTML fallback architecture explorer. -->
              <div
                class="explorer-stage"
                data-explorer-stage
              >
                ${stage(architecture, state)}
              </div>

            </div>


            <!-- Details for the currently selected node. -->
            <aside
              class="explorer-detail"
              data-explorer-detail
              role="region"
              aria-live="polite"
              aria-labelledby="explorer-detail-title"
              hidden
            ></aside>

          </div>


          <!-- Relationship legend/list for the selected view. -->
          <div data-explorer-relations>
            ${viewRelations(architecture, state)}
          </div>

        </div>

      </div>
    </section>
  `;
}


/* ============================================================
   Initialize Architecture Explorers
   ============================================================ */

/**
 * Find every architecture explorer on the page and attach
 * interaction behavior.
 */
export function initProjectArchitectures(): void {
  document
    .querySelectorAll<HTMLElement>(
      '[data-architecture-explorer]'
    )
    .forEach(
      (root) => {
        // Determine which architecture this explorer should use.
        const key =
          root.dataset.architectureExplorer as keyof typeof architectures;


        const architecture =
          architectures[key];


        // Ignore invalid architecture keys.
        if (!architecture) {
          return;
        }


        // Initial interactive state.
        const state: ExplorerState = {
          selected:
            architecture.rootId,

          view:
            'overview',

          showInactive:
            false,

          detailOpen:
            false,
        };


        /* ------------------------------------------------------
           Back Navigation
           ------------------------------------------------------ */

        /**
         * Move one level upward in the architecture hierarchy.
         */
        const back = () => {
          const selected =
            architecture.nodes.find(
              (node) =>
                node.id ===
                state.selected
            );


          // Select the parent, or root if no parent exists.
          state.selected =
            selected?.parent ??
            architecture.rootId;


          // Root does not display a details panel.
          state.detailOpen =
            state.selected !==
            architecture.rootId;


          updateExplorer(
            root,
            architecture,
            state
          );


          focusNode(
            root,
            state.selected
          );
        };


        /* ------------------------------------------------------
           Initialize Three.js Scene
           ------------------------------------------------------ */

        const sceneHost =
          root.querySelector<HTMLElement>(
            '[data-explorer-scene-host]'
          );


        if (sceneHost) {
          /**
           * Called when a node is selected inside the Three.js scene.
           */
          const selectInScene =
            (id: string) => {
              state.selected = id;

              state.detailOpen =
                id !==
                architecture.rootId;


              updateExplorer(
                root,
                architecture,
                state
              );


              focusNode(
                root,
                id
              );
            };


          const scene =
            createArchitectureScene(
              sceneHost,
              architecture,
              selectInScene,
              back
            );


          if (scene) {
            // Store scene so later UI updates can reach it.
            sceneInstances.set(
              root,
              scene
            );


            // Allows CSS to hide/use the HTML fallback appropriately.
            root.classList.add(
              'has-webgl'
            );


            // Perform the initial Three.js scene update.
            scene.update(
              state
            );
          } else {
            /**
             * Remove the unused scene host if WebGL is unavailable.
             * The HTML explorer remains as the fallback.
             */
            sceneHost.remove();
          }
        }


        /* ======================================================
           Click Handling
           ====================================================== */

        root.addEventListener(
          'click',
          (event) => {
            const target =
              event.target as HTMLElement;


            /* --------------------------------------------------
               Change Architecture View
               -------------------------------------------------- */

            const viewButton =
              target.closest<HTMLButtonElement>(
                '[data-explorer-view]'
              );


            if (viewButton) {
              state.view =
                viewButton.dataset.explorerView ??
                'overview';


              // Pick the appropriate starting node for this view.
              state.selected =
                viewAnchor(
                  architecture,
                  state.view
                );


              // Changing views closes details.
              state.detailOpen =
                false;


              updateExplorer(
                root,
                architecture,
                state
              );


              // Return keyboard focus to the selected view button.
              root
                .querySelector<HTMLButtonElement>(
                  `[data-explorer-view="${state.view}"]`
                )
                ?.focus();


              return;
            }


            /* --------------------------------------------------
               Toggle Inactive Nodes
               -------------------------------------------------- */

            if (
              target.closest(
                '[data-explorer-inactive]'
              )
            ) {
              state.showInactive =
                !state.showInactive;


              const selected =
                architecture.nodes.find(
                  (node) =>
                    node.id ===
                    state.selected
                );


              /**
               * If inactive nodes were hidden while an inactive
               * node was selected, walk upward until an active
               * ancestor is found.
               */
              if (
                selected?.status ===
                  'inactive' &&
                !state.showInactive
              ) {
                let candidate:
                  ArchitectureNode | undefined =
                    selected;


                while (
                  candidate?.status ===
                  'inactive'
                ) {
                  const parentId:
                    string | undefined =
                      candidate.parent;


                  candidate =
                    architecture.nodes.find(
                      (node) =>
                        node.id ===
                        parentId
                    );
                }


                state.selected =
                  candidate?.id ??
                  architecture.rootId;


                state.detailOpen =
                  state.selected !==
                  architecture.rootId;
              }


              updateExplorer(
                root,
                architecture,
                state
              );


              // Keep keyboard focus on the toolbar toggle.
              root
                .querySelector<HTMLButtonElement>(
                  '.explorer-inactive-toggle'
                )
                ?.focus();


              return;
            }


            /* --------------------------------------------------
               Detail Back Button
               -------------------------------------------------- */

            if (
              target.closest(
                '[data-explorer-back]'
              )
            ) {
              back();
              return;
            }


            /* --------------------------------------------------
               Jump Links
               -------------------------------------------------- */

            const jump =
              target.closest<HTMLButtonElement>(
                '[data-explorer-jump]'
              );


            if (jump) {
              state.selected =
                jump.dataset.explorerJump ??
                architecture.rootId;


              state.detailOpen =
                state.selected !==
                architecture.rootId;


              updateExplorer(
                root,
                architecture,
                state
              );


              focusNode(
                root,
                state.selected
              );


              return;
            }


            /* --------------------------------------------------
               Architecture Node Selection
               -------------------------------------------------- */

            const button =
              target.closest<HTMLButtonElement>(
                '[data-explorer-node]'
              );


            if (!button) {
              return;
            }


            const id =
              button.dataset.explorerNode ??
              architecture.rootId;


            /**
             * Clicking the currently selected node behaves
             * differently from clicking another node.
             */
            if (
              id === state.selected
            ) {
              const selected =
                architecture.nodes.find(
                  (node) =>
                    node.id === id
                );


              /**
               * Clicking a selected child node goes back
               * to its parent.
               */
              if (
                selected?.parent
              ) {
                back();
                return;
              }


              /**
               * Clicking the selected root toggles its details.
               */
              state.detailOpen =
                !state.detailOpen;
            } else {
              // Select another node and open its details.
              state.selected = id;
              state.detailOpen = true;
            }


            updateExplorer(
              root,
              architecture,
              state
            );


            focusNode(
              root,
              state.selected
            );
          }
        );


        /* ======================================================
           Keyboard Navigation
           ====================================================== */

        root.addEventListener(
          'keydown',
          (event) => {
            const target =
              event.target as HTMLElement;


            /**
             * Escape goes back whenever the explorer is not
             * already in its initial root state.
             */
            if (
              event.key === 'Escape' &&
              (
                state.selected !==
                  architecture.rootId ||
                state.detailOpen
              )
            ) {
              event.preventDefault();
              back();
            }


            const nodeButton =
              target.closest<HTMLButtonElement>(
                '[data-explorer-node]'
              );


            // Remaining keyboard shortcuts only apply to node buttons.
            if (!nodeButton) {
              return;
            }


            /**
             * Left Arrow / Backspace:
             * move to the parent node.
             */
            if (
              event.key ===
                'ArrowLeft' ||
              event.key ===
                'Backspace'
            ) {
              event.preventDefault();
              back();
            }


            /**
             * Home:
             * return directly to the architecture root.
             */
            if (
              event.key === 'Home'
            ) {
              event.preventDefault();


              state.selected =
                architecture.rootId;

              state.detailOpen =
                false;


              updateExplorer(
                root,
                architecture,
                state
              );


              focusNode(
                root,
                state.selected
              );
            }


            /**
             * Right Arrow:
             * enter the first child of the current node.
             */
            if (
              event.key ===
              'ArrowRight'
            ) {
              const first =
                architectureChildren(
                  architecture,
                  nodeButton.dataset.explorerNode ??
                    '',
                  state.showInactive
                )[0];


              if (first) {
                event.preventDefault();


                state.selected =
                  first.id;

                state.detailOpen =
                  true;


                updateExplorer(
                  root,
                  architecture,
                  state
                );


                focusNode(
                  root,
                  first.id
                );
              }
            }
          }
        );


        /* ======================================================
           Hover Highlighting
           ====================================================== */

        root.addEventListener(
          'pointerover',
          (event) => {
            const button =
              (
                event.target as HTMLElement
              ).closest<HTMLElement>(
                '[data-explorer-node]'
              );


            if (button) {
              highlightRelations(
                root,
                architecture,
                button.dataset.explorerNode
              );
            }
          }
        );


        root.addEventListener(
          'pointerout',
          (event) => {
            /**
             * Clear relationship highlighting when the pointer
             * leaves the entire explorer.
             */
            if (
              !(
                event.relatedTarget
                instanceof Node
              ) ||
              !root.contains(
                event.relatedTarget
              )
            ) {
              highlightRelations(
                root,
                architecture
              );
            }
          }
        );


        /* ======================================================
           Keyboard Focus Highlighting
           ====================================================== */

        root.addEventListener(
          'focusin',
          (event) => {
            const button =
              (
                event.target as HTMLElement
              ).closest<HTMLElement>(
                '[data-explorer-node]'
              );


            if (button) {
              highlightRelations(
                root,
                architecture,
                button.dataset.explorerNode
              );
            }
          }
        );


        root.addEventListener(
          'focusout',
          (event) => {
            /**
             * Clear relationship highlighting when keyboard focus
             * completely leaves the explorer.
             */
            if (
              !(
                event.relatedTarget
                instanceof Node
              ) ||
              !root.contains(
                event.relatedTarget
              )
            ) {
              highlightRelations(
                root,
                architecture
              );
            }
          }
        );
      }
    );
}