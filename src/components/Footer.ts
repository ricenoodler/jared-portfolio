import { site } from '../content';
import { escapeHtml, internalLink } from '../utils';
export function Footer(): string {
 return '<footer class="site-footer"><div class="footer-skyline" aria-hidden="true"></div><div class="shell footer-inner"><div class="footer-identity"><a href="/" data-link class="wordmark">Jared Del Mundo</a></div>' +
 '<nav class="footer-nav" aria-label="Footer navigation">'+internalLink('/projects','Projects')+internalLink('/notes','Notes')+internalLink('/resume','Resume')+
 (site.github?'<a href="'+escapeHtml(site.github)+'" target="_blank" rel="noopener noreferrer">GitHub</a>':'')+
 '<a href="'+escapeHtml(site.linkedin)+'" target="_blank" rel="noopener noreferrer">LinkedIn</a>'+(site.email?'<a href="mailto:'+escapeHtml(site.email)+'">Email</a>':'')+'</nav>'+
 '<div class="footer-thanks">Thanks for<br />stopping by<span class="accent-dot">!</span></div><div class="footer-bottom"><span>© '+new Date().getFullYear()+' Jared Del Mundo</span><a href="#top">Back to top ↑</a></div></div></footer>';
}
