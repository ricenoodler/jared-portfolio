import { values } from '../content';
import { escapeHtml, sectionLabel } from '../utils';

export function Values(): string {
  return `
    <section
      class="values"
      id="values"
      aria-labelledby="values-title"
    >
      <div class="shell">

        ${
          // Small section label shown above the heading.
              sectionLabel('02')
        }

        <div class="section-heading reveal">

          <!-- Main section heading. -->
          <h2 id="values-title">
            What I<br />
            care about<span class="accent-dot">.</span>
          </h2>

          <!-- Short introduction to the values section. -->
          <p>
            A few beliefs that shape how I approach school, work,
            and life in general.
          </p>

        </div>

        <div class="values-grid">

          ${
            // Create one value card for every item in the values array.
            values
              .map((value) => `
                <article class="value-item reveal">

                  <!-- Decorative icon for the value. -->
                  <span
                    class="value-icon"
                    aria-hidden="true"
                  >
                    ${value.icon}
                  </span>

                  <!-- Value title. -->
                  <h3>
                    ${escapeHtml(value.title)}
                  </h3>

                  <!-- Value description. -->
                  <p>
                    ${escapeHtml(value.description)}
                  </p>

                </article>
              `)
              .join('')
          }

        </div>

      </div>

      <!-- Decorative star outside the main content container. -->
      <div class="values-star" aria-hidden="true">
        ✦
      </div>

    </section>
  `;
}
