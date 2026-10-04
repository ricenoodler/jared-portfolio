import { interests } from '../content';
import { escapeHtml, sectionLabel } from '../utils';

export function Interests(): string {
  return `
    <section
      class="interests section-light"
      id="interests"
      aria-labelledby="interests-title"
    >
      <div class="shell">

        ${
          // Small section label shown above the heading.
              sectionLabel('01')
        }

        <div class="section-heading interests-heading reveal">

          <!-- Main section heading. -->
          <h2 id="interests-title">
            Things<br />
            I’m into<span class="accent-dot">.</span>
          </h2>

          <!-- Short introduction to the interests section. -->
          <p>
            Outside of school and work, these are the things that keep me
            curious, creative, and motivated to keep learning.
          </p>

        </div>

        <div class="interest-list">

          ${
            // Create one article for every item in the interests array.
            interests
              .map((interest) => `
                <article class="interest-row reveal">

                  <!-- Left side: number, title, and description. -->
                  <div class="interest-copy">

                    <!-- Interest number, such as 01, 02, etc. -->
                    <span class="interest-number">
                      ${interest.number}
                    </span>

                    <div>

                      <!--
                        Escape user/content data before inserting it into HTML.
                      -->
                      <h3>
                        ${escapeHtml(interest.title)}
                      </h3>

                      <p>
                        ${escapeHtml(interest.description)}
                      </p>

                    </div>

                  </div>

                  <!--
                    Image associated with the interest.
                    loading="lazy" delays loading until the image is needed.
                  -->
                  <img
                    src="${interest.image}"
                    alt="${escapeHtml(interest.alt)}"
                    loading="lazy"
                  />

                </article>
              `)
              .join('')
          }

        </div>

      </div>
    </section>
  `;
}
