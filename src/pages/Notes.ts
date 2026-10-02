import { notes, renderMarkdown } from '../notes';
import { arrow, escapeHtml, internalLink } from '../utils';

export function NotesIndex(): string {
  return `<main class="subpage notes-page"><div class="shell"><div class="page-intro reveal"><span class="page-kicker">02 / FIELD NOTES <span lang="ja">ノート</span></span><h1>Notes<span class="accent-dot">.</span></h1><p>Things I’m learning, fixing, wondering about, and trying to remember for next time.</p></div>
    <div class="notes-index-list">${notes.map((note) => internalLink(`/notes/${note.slug}`, `<time datetime="${note.date}">${escapeHtml(note.shortDate)}</time><span class="note-index-title">${escapeHtml(note.title)}<small>${escapeHtml(note.excerpt)}</small></span>${arrow}`, 'note-row reveal')).join('')}</div>
  </div></main>`;
}

export function NoteArticle(slug: string): string {
  const note = notes.find((entry) => entry.slug === slug);
  if (!note) return `<main class="subpage missing-page"><div class="shell"><span class="page-kicker">404 / NOT FOUND</span><h1>That note isn’t here<span class="accent-dot">.</span></h1><p>The page may have moved, or the address has a typo.</p>${internalLink('/notes', `Back to notes ${arrow}`, 'button button-navy')}</div></main>`;
  return `<main class="subpage article-page"><article class="shell article-shell"><div class="article-heading"><span class="page-kicker">FIELD NOTES / <time datetime="${note.date}">${escapeHtml(note.shortDate)}</time></span><h1>${escapeHtml(note.title)}<span class="accent-dot">.</span></h1><p>${escapeHtml(note.excerpt)}</p></div><div class="article-body">${renderMarkdown(note.body)}</div><div class="article-back">${internalLink('/notes', '← All notes', 'text-link dark-link')}</div></article></main>`;
}
