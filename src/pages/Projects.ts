import { sortedProjects } from '../content';
import { arrow, escapeHtml, internalLink } from '../utils';

export function Projects(): string {
  return `<main class="subpage projects-page"><div class="shell">
    <div class="page-intro reveal"><span class="page-kicker">01 / SELECTED WORK <span lang="ja">プロジェクト</span></span><h1>Projects<span class="accent-dot">.</span></h1><p>Hands on learning through systems, networks, and infrastructure. These are works in progress, as good labs usually are.</p></div>
    <div class="project-detail-list">${sortedProjects.map((project, index) => `<article class="project-detail reveal" id="${project.slug}">
      ${internalLink(`/projects/${project.slug}`, `<img src="${project.image}" alt="${escapeHtml(project.imageAlt)}" /><span>0${index + 1} / 0${sortedProjects.length}</span>`, 'project-detail-image')}
      <div class="project-detail-copy"><span class="detail-kicker">PROJECT 0${index + 1} / ${escapeHtml(project.status)}</span><h2>${internalLink(`/projects/${project.slug}`, escapeHtml(project.title))}</h2><p>${escapeHtml(project.detail)}</p><ul class="tag-list" aria-label="Topics">${project.tags.map((tag) => `<li>${escapeHtml(tag)}</li>`).join('')}</ul>${internalLink(`/projects/${project.slug}`, `View project ${arrow}`, 'detail-status')}</div>
    </article>`).join('')}</div>
    <div class="page-outro">${internalLink('/', '← Back to the homepage', 'text-link dark-link')}</div>
  </div></main>`;
}
