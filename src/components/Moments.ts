import { moments } from '../content';
import { escapeHtml, sectionLabel } from '../utils';

export function Moments(): string {
  return `<section class="moments" id="moments" aria-labelledby="moments-title"><div class="shell">
    ${sectionLabel('いくつかの瞬間', '04')}
    <div class="section-heading reveal"><h2 id="moments-title">A few<br />moments<span class="accent-dot">.</span></h2><p>Some snapshots from life lately. The real photos will find their way here soon.</p></div>
    <div class="moments-grid">${moments.map((moment, index) => `<button class="moment-tile reveal" type="button" data-moment="${index}" aria-label="Open ${escapeHtml(moment.title)}"><img src="${moment.image}" alt="${escapeHtml(moment.alt)}" loading="lazy" /><span>${escapeHtml(moment.title)}</span></button>`).join('')}</div>
  </div></section>`;
}
