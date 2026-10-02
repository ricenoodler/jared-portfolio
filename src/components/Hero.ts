import { site } from '../content';
import { escapeHtml, internalLink } from '../utils';
export function Hero(): string {
 return '<section class="hero" aria-labelledby="hero-title"><div class="hero-art" aria-hidden="true"></div><div class="hero-overlay" aria-hidden="true"></div><div class="shell hero-grid"><div class="hero-copy">' +
 '<h1 id="hero-title" class="reveal">Hi! I\u2019m Jared<span class="accent-dot">.</span></h1><p class="hero-intro reveal">I\u2019m Information Technology student drawn systems administration, networking, infrastructure, aviation, learning how things work.</p>' +
 '<div class="hero-actions reveal">' + internalLink('/projects','<span aria-hidden="true">\u2192</span> View my projects','button button-cream') + ' <a href="#interests" class="text-link">A little about me <span aria-hidden="true">\u2192</span></a></div>' +
 '<div class="hero-social reveal">' + (site.github?'<a href="'+escapeHtml(site.github)+'" target="_blank" rel="noopener noreferrer">GitHub \u2197</a>':'') + '<a href="'+escapeHtml(site.linkedin)+'" target="_blank" rel="noopener noreferrer">LinkedIn \u2197</a>' + (site.resume?'<a href="'+escapeHtml(site.resume)+'">Resume \u2197</a>':'') + '</div></div>' +
 '<div class="portrait-wrap reveal"><div class="portrait-frame"><img class="portrait-image" src="/images/hero/portrait.webp" alt="Jared Del Mundo" fetchpriority="high" /></div></div></div><div class="hero-bottom shell"><span class="hero-scroll">SCROLL TO EXPLORE <span aria-hidden="true">\u2193</span></span></div></section>';
}
