import { interests } from '../content';
import { escapeHtml, sectionLabel } from '../utils';

export function Interests(): string {
  return `<section class="interests section-light" id="interests" aria-labelledby="interests-title"><div class="shell">
    ${sectionLabel('好きなもの', '01')}
    <div class="section-heading interests-heading reveal"><h2 id="interests-title">Things<br />I’m into<span class="accent-dot">.</span></h2><p>Outside of school and work, these are the things that keep me curious, creative, and motivated to keep learning.</p></div>
    <div class="interest-list">${interests.map((interest) => `<article class="interest-row reveal"><div class="interest-copy"><span class="interest-number">${interest.number}</span><div><h3>${escapeHtml(interest.title)}</h3><p>${escapeHtml(interest.description)}</p></div></div><img src="${interest.image}" alt="${escapeHtml(interest.alt)}" loading="lazy" /><div class="interest-japanese"><span lang="ja">${interest.japanese}</span><span aria-hidden="true">✈</span></div></article>`).join('')}</div>
  </div></section>`;
}
