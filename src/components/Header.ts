import { site } from '../content';
import { escapeHtml, internalLink } from '../utils';
export function Header(): string {
 return '<header class="site-header" id="site-header"><div class="shell header-inner"><a href="/" data-link class="brand wordmark" aria-label="Jared Del Mundo home"><span class="brand-full">Jared Del Mundo</span><span class="brand-short">Del Mundo</span></a>' +
 '<button class="menu-toggle" type="button" aria-label="Open navigation" aria-controls="primary-navigation" aria-expanded="false"><span></span><span></span></button><nav class="primary-nav" id="primary-navigation" aria-label="Main navigation">' +
 internalLink('/projects','Projects')+internalLink('/notes','Notes')+internalLink('/resume','Resume')+'<a class="nav-social" href="'+escapeHtml(site.linkedin)+'" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">in</a><span class="nav-dot" aria-hidden="true"></span></nav></div></header>';
}
