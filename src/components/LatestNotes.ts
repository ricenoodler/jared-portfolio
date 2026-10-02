import { notes } from '../notes';
import { arrow, escapeHtml, internalLink, sectionLabel } from '../utils';

export function LatestNotes(): string {
  return `<section class="latest-notes section-light" id="latest-notes" aria-labelledby="latest-title"><div class="shell">
    ${sectionLabel('最近のノート', '05')}
    <div class="section-heading reveal"><h2 id="latest-title">Latest from my notes<span class="accent-dot">.</span></h2><p>Things I’ve been thinking about, learning, or writing down lately.</p></div>
    <div class="notes-list">${notes.slice(0, 3).map((note) => internalLink(`/notes/${note.slug}`, `<time datetime="${note.date}">${escapeHtml(note.shortDate)}</time><span>${escapeHtml(note.title)}</span>${arrow}`, 'note-row reveal')).join('')}</div>
    <div class="notes-more reveal">${internalLink('/notes', `View all notes ${arrow}`, 'text-link dark-link')}</div>
  </div></section>`;
}
