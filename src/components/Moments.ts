import { moments } from '../content';
import { escapeHtml, sectionLabel } from '../utils';

export function Moments(): string {
  return `
    <section
      class="moments"
      id="moments"
      aria-labelledby="moments-title"
    >
      <div class="shell">

        ${
          // Small section label above the heading.
              sectionLabel('04')
        }

        <div class="section-heading reveal">

          <!-- Main section heading. -->
          <h2 id="moments-title">
            A few<br />
            moments<span class="accent-dot">.</span>
          </h2>

          <!-- Short introduction to the photo section. -->
          <p>
            Some snapshots from life lately.
            The real photos will find their way here soon.
          </p>

        </div>

        <!-- Grid of clickable moment/photo tiles. -->
        <div class="moments-grid">

          ${
            // Create one button for every moment in the moments array.
            moments
              .map((moment, index) => `
                <button
                  class="moment-tile reveal"
                  type="button"
                  data-moment="${index}"
                  aria-label="Open ${escapeHtml(moment.title)}"
                >

                  <!-- Photo for this moment. -->
                  <img
                    src="${moment.image}"
                    alt="${escapeHtml(moment.alt)}"
                    loading="lazy"
                  />

                  <!-- Visible title shown on the tile. -->
                  <span>
                    ${escapeHtml(moment.title)}
                  </span>

                </button>
              `)
              .join('')
          }

        </div>

      </div>
    </section>
  `;
}
