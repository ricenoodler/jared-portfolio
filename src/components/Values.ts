import { values } from '../content';
import { escapeHtml, sectionLabel } from '../utils';

export function Values(): string {
  return `<section class="values" id="values" aria-labelledby="values-title"><div class="shell">
    ${sectionLabel('大切にしていること', '02')}
    <div class="section-heading reveal"><h2 id="values-title">What I<br />care about<span class="accent-dot">.</span></h2><p>A few beliefs that shape how I approach school, work, and life in general.</p></div>
    <div class="values-grid">${values.map((value) => `<article class="value-item reveal"><span class="value-icon" aria-hidden="true">${value.icon}</span><h3>${escapeHtml(value.title)}</h3><p>${escapeHtml(value.description)}</p></article>`).join('')}</div>
  </div><div class="values-star" aria-hidden="true">✦</div></section>`;
}
