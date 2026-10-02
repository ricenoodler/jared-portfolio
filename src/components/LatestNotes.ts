import { notes } from '../notes';
import { arrow, escapeHtml, internalLink, sectionLabel } from '../utils';
export function LatestNotes(): string {
 const rows=notes.slice(0,3).map(n=>internalLink('/notes/'+n.slug,'<time datetime="'+n.date+'">'+escapeHtml(n.shortDate)+'</time><span>'+escapeHtml(n.title)+'</span>'+arrow,'note-row reveal')).join('');
 return '<section class="latest-notes section-light" id="latest-notes" aria-labelledby="latest-title"><div class="shell">'+sectionLabel('最近のノート','05')+
 '<div class="section-heading reveal"><h2 id="latest-title">Latest from notes<span class="accent-dot">.</span></h2><p>Things lately.</p></div><div class="notes-list">'+(rows||'<p class="empty-state">No published notes yet.</p>')+'</div>'+
 '<div class="notes-more reveal">'+internalLink('/notes','All notes','text-link dark-link')+'</div></div></section>';
}
