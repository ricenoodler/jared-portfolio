import { trivia } from '../content';
import { escapeHtml, sectionLabel } from '../utils';

export function Trivia(): string {
  return `<section class="trivia section-light" id="trivia" aria-labelledby="trivia-title"><div class="shell">
    ${sectionLabel('03')}
    <div class="section-heading reveal"><h2 id="trivia-title">A few random<br />things about me<span class="accent-dot">.</span></h2><p>Some small, random, and probably unnecessary facts about me. Because why not.</p></div>
    <div class="trivia-layout"><ol class="trivia-list">${trivia.map((fact, index) => `<li class="reveal"><span class="trivia-number">${String(index + 1).padStart(2, '0')}</span><span>${escapeHtml(fact)}</span></li>`).join('')}</ol><div class="postcard reveal"><div class="postcard-image" role="img" aria-label="Illustrated city at sunset"></div></div></div>
  </div></section>`;
}
