import { notes, renderMarkdown } from '../notes';
import { arrow, escapeHtml, internalLink } from '../utils';
export function NotesIndex(): string {
 const rows=notes.map(n=>internalLink('/notes/'+n.slug,'<time datetime="'+n.date+'">'+escapeHtml(n.shortDate)+'</time><span class="note-index-title">'+escapeHtml(n.title)+'<small>'+escapeHtml(n.excerpt)+'</small></span>'+arrow,'note-row reveal')).join('');
 return '<main class="subpage notes-page"><div class="shell"><div class="page-intro reveal"><span class="page-kicker">02 / FIELD NOTES</span><h1>Notes<span class="accent-dot">.</span></h1><p>Things I’m learning, fixing, wondering about, trying remember next time.</p></div><div class="notes-index-list">'+(rows||'<p class="empty-state">No published notes yet.</p>')+'</div></div></main>';
}
export function NoteArticle(slug:string): string {
 const n=notes.find(x=>x.slug===slug);
 if(!n)return '<main class="subpage missing-page"><div class="shell"><span class="page-kicker">404 / NOT FOUND</span><h1>That note isn’t here<span class="accent-dot">.</span></h1><p>The note may have moved, or the address may contain a typo.</p>'+internalLink('/notes','Back to notes '+arrow,'button button-navy')+'</div></main>';
 return '<main class="subpage article-page"><article class="shell article-shell"><div class="article-heading"><span class="page-kicker">FIELD NOTES / <time datetime="'+n.date+'">'+escapeHtml(n.shortDate)+'</time></span><h1>'+escapeHtml(n.title)+'<span class="accent-dot">.</span></h1><p>'+escapeHtml(n.excerpt)+'</p><ul class="tag-list note-tags" aria-label="Tags">'+n.tags.map(t=>'<li>'+escapeHtml(t)+'</li>').join('')+'</ul></div><div class="article-body">'+renderMarkdown(n.body)+'</div><div class="article-back">'+internalLink('/notes','← All notes','text-link dark-link')+'</div></article></main>';
}
