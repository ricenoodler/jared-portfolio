import { site } from '../content';
import { escapeHtml, internalLink } from '../utils';

export function Hero(): string {
  return `<section class="hero" aria-labelledby="hero-title">
    <div class="hero-art" aria-hidden="true"></div>
    <div class="hero-overlay" aria-hidden="true"></div>
    <div class="shell hero-grid">
      <div class="hero-copy">
        <div class="hero-eyebrow reveal"><span class="eyebrow-box">HELLO THERE <span aria-hidden="true">✦</span></span><span class="eyebrow-rule"></span></div>
        <h1 id="hero-title" class="reveal">Hi! I’m Jared<span class="accent-dot">.</span></h1>
        <p class="hero-intro reveal">I’m an Information Technology student drawn to systems administration, networking, infrastructure, aviation, and learning how things work.</p>
        <div class="hero-actions reveal">
          ${internalLink('/projects', '<span aria-hidden="true">→</span> View my projects', 'button button-cream')}
          <a href="#interests" class="text-link">A little about me <span aria-hidden="true">→</span></a>
        </div>
        <div class="hero-social reveal">
          ${site.github ? `<a href="${escapeHtml(site.github)}" target="_blank" rel="noopener noreferrer">GitHub ↗</a>` : '<span>GitHub soon</span>'}
          <a href="${escapeHtml(site.linkedin)}" target="_blank" rel="noopener noreferrer">LinkedIn ↗</a>
          ${site.resume ? `<a href="${escapeHtml(site.resume)}">Resume ↗</a>` : ''}
        </div>
      </div>
      <div class="portrait-wrap reveal" aria-label="Portrait placeholder">
        <div class="portrait-frame"><div class="portrait-orbit"></div><span class="portrait-cross">✳</span><span class="portrait-label">A PORTRAIT<br />GOES HERE</span><span class="portrait-corner">01 / YOU & ME</span></div>
        <span class="portrait-caption">portrait / coming soon</span>
      </div>
    </div>
    <div class="hero-bottom shell"><span class="hero-motto">GOOD SYSTEMS.<br /><strong>BRIGHTER PLACES.</strong></span><span class="hero-scroll">SCROLL TO EXPLORE <span aria-hidden="true">↓</span></span><span lang="ja">次の場所へ</span></div>
  </section>`;
}
