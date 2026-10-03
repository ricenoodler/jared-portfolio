import { sortedProjects } from '../content';
import { arrow, escapeHtml, internalLink } from '../utils';


/* ============================================================
   Projects Page
   ============================================================ */

/**
 * Render the main Projects page.
 */
export function Projects(): string {
  return `
    <main class="subpage projects-page">
      <div class="shell">

        <!-- Page introduction. -->
        <div class="page-intro reveal">

          <span class="page-kicker">
            01 / SELECTED WORK
            <span lang="ja">
              プロジェクト
            </span>
          </span>

          <h1>
            Projects<span class="accent-dot">.</span>
          </h1>

          <p>
            Hands on learning through systems, networks, and infrastructure.
            These are works in progress, as good labs usually are.
          </p>

        </div>


        <!-- List of all projects. -->
        <div class="project-detail-list">

          ${
            // Create one project section for every item in sortedProjects.
            sortedProjects
              .map((project, index) => `
                <article
                  class="project-detail reveal"
                  id="${project.slug}"
                >

                  ${
                    // Clickable project image.
                    // Also shows the project's position in the full list.
                    internalLink(
                      `/projects/${project.slug}`,
                      `
                        <img
                          src="${project.image}"
                          alt="${escapeHtml(project.imageAlt)}"
                        />

                        <span>
                          0${index + 1} / 0${sortedProjects.length}
                        </span>
                      `,
                      'project-detail-image'
                    )
                  }


                  <!-- Project information. -->
                  <div class="project-detail-copy">

                    <!-- Project number and current status. -->
                    <span class="detail-kicker">
                      PROJECT 0${index + 1}
                      /
                      ${escapeHtml(project.status)}
                    </span>


                    <!-- Project title links to its detail page. -->
                    <h2>
                      ${
                        internalLink(
                          `/projects/${project.slug}`,
                          escapeHtml(project.title)
                        )
                      }
                    </h2>


                    <!-- Longer project description. -->
                    <p>
                      ${escapeHtml(project.detail)}
                    </p>


                    <!-- Project topics / technologies. -->
                    <ul
                      class="tag-list"
                      aria-label="Topics"
                    >

                      ${
                        // Create one list item for every project tag.
                        project.tags
                          .map((tag) => `
                            <li>
                              ${escapeHtml(tag)}
                            </li>
                          `)
                          .join('')
                      }

                    </ul>


                    ${
                      // Link to the project's full page.
                      internalLink(
                        `/projects/${project.slug}`,
                        `View project ${arrow}`,
                        'detail-status'
                      )
                    }

                  </div>

                </article>
              `)
              .join('')
          }

        </div>


        <!-- Link back to the homepage. -->
        <div class="page-outro">

          ${
            internalLink(
              '/',
              '← Back to the homepage',
              'text-link dark-link'
            )
          }

        </div>

      </div>
    </main>
  `;
}