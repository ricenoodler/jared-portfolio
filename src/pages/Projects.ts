import { projects } from '../content';
import { arrow, escapeHtml, internalLink } from '../utils';

export function Projects(): string {
  return `<main class="subpage projects-page"><div class="shell">
    <div class="page-intro reveal"><span class="page-kicker">01 / SELECTED WORK <span lang="ja">プロジェクト</span></span><h1>Projects<span class="accent-dot">.</span></h1><p>Hands on learning through systems, networks, and infrastructure. These are works in progress, as good labs usually are.</p></div>
    <div class="project-detail-list">${projects.map((project, index) => `<article class="project-detail reveal" id="${project.slug}"><div class="project-detail-image"><img src="${project.image}" alt="${escapeHtml(project.imageAlt)}" /><span>0${index + 1} / 0${projects.length}</span></div><div class="project-detail-copy"><span class="detail-kicker">FIELD NOTES / PROJECT 0${index + 1}</span><h2>${escapeHtml(project.title)}</h2><p>${escapeHtml(project.detail)}</p><ul class="tag-list">${project.tags.map((tag) => `<li>${escapeHtml(tag)}</li>`).join('')}</ul><span class="detail-status">Case study in progress ${arrow}</span></div></article>`).join('')}</div>
    <div class="page-outro">${internalLink('/', '← Back to the homepage', 'text-link dark-link')}</div>
  </div></main>`;
}
