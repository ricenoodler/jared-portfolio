import { featuredProjects } from '../content';
import { arrow, escapeHtml, internalLink } from '../utils';

export function FeaturedProjects(): string {
  return `<section class="featured section-dark" id="featured" aria-labelledby="featured-title"><div class="shell">
    <div class="featured-heading reveal"><h2 id="featured-title"><span class="orange-line"></span> Featured projects</h2>${internalLink('/projects', `View all projects ${arrow}`, 'small-link')}</div>
    <div class="project-grid">${featuredProjects.map((project, index) => `<article class="project-card reveal">
      ${internalLink(`/projects#${project.slug}`, `<img src="${project.image}" alt="${escapeHtml(project.imageAlt)}" loading="lazy" /><span class="project-image-number">0${index + 1}</span>`, 'project-image')}
      <div class="project-card-body"><div><h3>${escapeHtml(project.title)}</h3><p>${escapeHtml(project.description)}</p></div><a class="round-arrow" href="/projects#${project.slug}" data-link aria-label="View ${escapeHtml(project.title)}">${arrow}</a><ul class="tag-list" aria-label="Topics">${project.tags.map((tag) => `<li>${escapeHtml(tag)}</li>`).join('')}</ul></div>
    </article>`).join('')}</div>
  </div></section>`;
}
