import { sortedProjects } from '../content';
import { notes } from '../notes';
import { ProjectArchitecture } from '../components/ProjectArchitecture';
import { WindowsArchitecture } from '../components/WindowsArchitecture';
import { arrow, escapeHtml, internalLink } from '../utils';

function formatDate(date: string): string {
  return new Date(`${date}T12:00:00Z`).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

export function ProjectArticle(slug: string): string {
  const index = sortedProjects.findIndex((entry) => entry.slug === slug);
  const project = sortedProjects[index];
  if (!project) {
    return `<main class="subpage missing-page"><div class="shell"><span class="page-kicker">404 / PROJECT NOT FOUND</span><h1>Wrong turn<span class="accent-dot">.</span></h1><p>That project is not here.</p>${internalLink('/projects', '← All projects', 'button button-navy')}</div></main>`;
  }

  const study = project.caseStudy;
  const related = notes.filter((note) => study.relatedNotes.includes(note.slug));
  const previous = sortedProjects[index - 1];
  const next = sortedProjects[index + 1];

  return `<main class="project-article">
    <header class="case-hero">
      <div class="shell">
        <div class="case-breadcrumb">${internalLink('/projects', '← All projects')}<span> / ${escapeHtml(project.title)}</span></div>
        <div class="case-hero-grid">
          <div class="case-hero-copy reveal">
            <span class="case-kicker">PROJECT ${String(index + 1).padStart(2, '0')} / ${String(sortedProjects.length).padStart(2, '0')}</span>
            <h1>${escapeHtml(project.title)}<span class="accent-dot">.</span></h1>
            <p class="case-summary">${escapeHtml(project.summary)}</p>
          <dl class="case-meta"><div><dt>${project.endDate ? 'Started' : 'Date'}</dt><dd><time datetime="${project.date}">${formatDate(project.date)}</time></dd></div>${project.endDate ? `<div><dt>Completed</dt><dd><time datetime="${project.endDate}">${formatDate(project.endDate)}</time></dd></div>` : ''}<div><dt>Status</dt><dd>${escapeHtml(project.status)}</dd></div></dl>
            <ul class="tag-list case-tags" aria-label="Topics">${project.tags.map((tag) => `<li>${escapeHtml(tag)}</li>`).join('')}</ul>
          </div>
          <div class="case-hero-image reveal"><img src="${project.image}" alt="${escapeHtml(project.imageAlt)}" /></div>
        </div>
      </div>
    </header>
    <section class="case-section case-overview" id="overview" aria-labelledby="overview-title">
      <div class="shell case-section-grid">
        <div class="case-section-heading"><span class="case-section-number">01 / CONTEXT</span><h2 id="overview-title">Overview<span class="accent-dot">.</span></h2></div>
        <div class="case-section-copy"><p>${escapeHtml(study.overview)}</p><h3>Why I built it</h3><p>${escapeHtml(study.motivation)}</p></div>
      </div>
    </section>
    ${project.slug === 'windows-server-ad-lab' ? WindowsArchitecture() : ProjectArchitecture(project)}
    <section class="case-section case-work" id="work" aria-labelledby="work-title">
      <div class="shell case-section-grid">
        <div class="case-section-heading"><span class="case-section-number">03 / THE WORK</span><h2 id="work-title">What I worked on<span class="accent-dot">.</span></h2></div>
        <div class="case-work-list">${study.implementation.map((item, itemIndex) => `<div class="case-work-item"><span>${String(itemIndex + 1).padStart(2, '0')}</span><div><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.description)}</p></div></div>`).join('')}</div>
      </div>
    </section>
    ${study.challenges.length ? `<section class="case-section" id="challenges" aria-labelledby="challenges-title"><div class="shell case-section-grid"><div class="case-section-heading"><span class="case-section-number">04 / TROUBLESHOOTING</span><h2 id="challenges-title">Challenges<span class="accent-dot">.</span></h2></div><div class="case-work-list">${study.challenges.map((item) => `<div class="case-challenge"><h3>${escapeHtml(item.title)}</h3><dl><div><dt>Diagnosis</dt><dd>${escapeHtml(item.diagnosis)}</dd></div><div><dt>Resolution</dt><dd>${escapeHtml(item.resolution)}</dd></div></dl></div>`).join('')}</div></div></section>` : ''}
    ${study.lessons.length ? `<section class="case-section" id="lessons" aria-labelledby="lessons-title"><div class="shell case-section-grid"><div class="case-section-heading"><span class="case-section-number">05 / REFLECTION</span><h2 id="lessons-title">What I learned<span class="accent-dot">.</span></h2></div><ul class="case-lessons">${study.lessons.map((lesson) => `<li>${escapeHtml(lesson)}</li>`).join('')}</ul></div></section>` : ''}
    ${study.media.length ? `<section class="case-section" id="media" aria-labelledby="media-title"><div class="shell"><div class="case-section-heading"><span class="case-section-number">06 / DETAILS</span><h2 id="media-title">Screenshots &amp; media<span class="accent-dot">.</span></h2></div><div class="case-media-grid${project.slug === 'windows-server-ad-lab' ? ' windows-media' : ''}">${study.media.map((item) => `<figure>${item.src ? `<img src="${escapeHtml(item.src)}" alt="${escapeHtml(item.alt)}" loading="lazy" />` : `<div class="case-media-placeholder" role="img" aria-label="${escapeHtml(item.alt)}"><span>Screenshot coming soon</span></div>`}<figcaption>${escapeHtml(item.caption)}</figcaption></figure>`).join('')}</div></div></section>` : ''}
    ${related.length ? `<section class="case-section" id="related-notes" aria-labelledby="related-notes-title"><div class="shell case-section-grid"><div class="case-section-heading"><span class="case-section-number">07 / FIELD NOTES</span><h2 id="related-notes-title">Related notes<span class="accent-dot">.</span></h2></div><div class="case-related">${related.map((note) => internalLink(`/notes/${note.slug}`, `${escapeHtml(note.title)} ${arrow}`)).join('')}</div></div></section>` : ''}
    <nav class="case-pagination shell" aria-label="Project navigation">
      <div>${previous ? internalLink(`/projects/${previous.slug}`, `<span>Previous project</span><strong>← ${escapeHtml(previous.title)}</strong>`) : ''}</div>
      <div>${next ? internalLink(`/projects/${next.slug}`, `<span>Next project</span><strong>${escapeHtml(next.title)} →</strong>`) : ''}</div>
    </nav>
  </main>`;
}
