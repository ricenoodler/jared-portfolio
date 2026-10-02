export const escapeHtml = (value: string): string => value.replace(/[&<>"']/g, (char) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[char] ?? char);

export const internalLink = (href: string, label: string, className = '') =>
  `<a class="${className}" href="${href}" data-link>${label}</a>`;

export const sectionLabel = (japanese: string, number: string) =>
  `<div class="section-kicker"><span lang="ja">${japanese}</span><span class="section-number">${number} / 05</span></div>`;

export const arrow = '<span aria-hidden="true" class="arrow">↗</span>';
