import { featuredProjects } from '../content';
import { arrow, escapeHtml, internalLink } from '../utils';

export function FeaturedProjects(): string {
  return `
    <section
      class="featured section-dark"
      id="featured"
      aria-labelledby="featured-title"
    >
      <div class="shell">

        <!-- Section heading and "view all" link. -->
        <div class="featured-heading reveal">

          <h2 id="featured-title">
            <span class="orange-line"></span>
            Featured projects
          </h2>

          ${
            // Link to the full projects page.
            internalLink(
              '/projects',
              `View all projects ${arrow}`,
              'small-link'
            )
          }

        </div>

        <!-- Grid containing all featured project cards. -->
        <div class="project-grid">

          ${
            // Create one card for every featured project.
            featuredProjects
              .map((project, index) => `
                <article class="project-card reveal">

                  ${
                    // Clickable project image.
                    // The image also displays its position in the featured list.
                    internalLink(
                      `/projects/${project.slug}`,
                      `
                        <img
                          src="${project.image}"
                          alt="${escapeHtml(project.imageAlt)}"
                          loading="lazy"
                        />

                        <span class="project-image-number">
                          0${index + 1}
                        </span>
                      `,
                      'project-image'
                    )
                  }

                  <div class="project-card-body">

                    <!-- Project title and description. -->
                    <div>

                      <h3>
                        ${
                          // Project title links to the project's detail page.
                          internalLink(
                            `/projects/${project.slug}`,
                            escapeHtml(project.title)
                          )
                        }
                      </h3>

                      <p>
                        ${escapeHtml(project.description)}
                      </p>

                    </div>

                    <!--
                      Circular arrow link to the project's detail page.
                      aria-label gives the link a descriptive accessible name.
                    -->
                    <a
                      class="round-arrow"
                      href="/projects/${project.slug}"
                      data-link
                      aria-label="View ${escapeHtml(project.title)}"
                    >
                      ${arrow}
                    </a>

                    <!-- Project topic/technology tags. -->
                    <ul class="tag-list" aria-label="Topics">

                      ${
                        // Create one list item for each project tag.
                        project.tags
                          .map((tag) => `
                            <li>
                              ${escapeHtml(tag)}
                            </li>
                          `)
                          .join('')
                      }

                    </ul>

                  </div>

                </article>
              `)
              .join('')
          }

        </div>

      </div>
    </section>
  `;
}