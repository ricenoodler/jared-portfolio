import { aboutContent, aboutPhotos } from '../content';
import { escapeHtml } from '../utils';
import { PhotoCarousel } from './PhotoCarousel';

export function About(): string {
  return `<section class="about-section section-light" id="about" aria-labelledby="about-title">
    <div class="shell about-layout">
      <div class="about-copy reveal">
        <h2 id="about-title">${escapeHtml(aboutContent.heading)}<span class="accent-dot">.</span></h2>
        <p class="about-subheading">${escapeHtml(aboutContent.subheading)}</p>
        ${aboutContent.paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('')}
      </div>
      <div class="about-photos reveal">${PhotoCarousel(aboutPhotos, 'About me photo carousel')}</div>
    </div>
  </section>`;
}
