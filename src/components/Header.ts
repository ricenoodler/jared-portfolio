import { site } from '../content';
import { escapeHtml, internalLink } from '../utils';

type IconName = 'instagram' | 'github' | 'linkedin' | 'resume';

const iconPaths: Record<IconName, string> = {
  instagram: '<rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="18" cy="6" r="1" fill="currentColor" stroke="none"/>',
  github: '<path d="M9 19c-4.3 1.3-4.3-2.5-6-3m12 6v-3.9a3.4 3.4 0 0 0-.9-2.6c3-.3 6.1-1.5 6.1-6.8a5.3 5.3 0 0 0-1.4-3.7 4.9 4.9 0 0 0-.1-3.7S17.6 1 15 3a13.3 13.3 0 0 0-6 0C6.4 1 5.3 1.3 5.3 1.3a4.9 4.9 0 0 0-.1 3.7 5.3 5.3 0 0 0-1.4 3.7c0 5.3 3.1 6.5 6.1 6.8a3.4 3.4 0 0 0-.9 2.6V22"/>',
  linkedin: '<rect x="2" y="2" width="20" height="20" rx="2"/><path d="M7 10v7m0-10v.01M11 17v-7m0 3a3 3 0 0 1 6 0v4"/>',
  resume: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h8"/>',
};

function icon(name: IconName): string {
  return `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${iconPaths[name]}</svg>`;
}

function profileLinks(): string {
  const profiles: { name: IconName; label: string; url: string }[] = [
    { name: 'instagram', label: 'Instagram', url: site.instagram },
    { name: 'github', label: 'GitHub', url: site.github },
    { name: 'linkedin', label: 'LinkedIn', url: site.linkedin },
    { name: 'resume', label: 'View resume', url: site.resume },
  ];

  return profiles.map(({ name, label, url }) => url
    ? `<a class="header-icon" href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer" aria-label="${label}" title="${label}">${icon(name)}</a>`
    : `<span class="header-icon is-pending" role="img" aria-label="${label}" title="${label} link coming soon">${icon(name)}</span>`
  ).join('');
}

export function Header(): string {
  return `<header class="site-header" id="site-header">
    <div class="shell header-inner">
      <a href="/" data-link class="brand wordmark" aria-label="Jared Del Mundo home">Jared Del Mundo</a>
      <nav class="desktop-nav" aria-label="Site navigation">${internalLink('/projects', 'Projects')}${internalLink('/notes', 'Notes')}</nav>
      <nav class="header-profiles" aria-label="Profile links">${profileLinks()}</nav>
      <button class="menu-toggle" type="button" aria-label="Open navigation" aria-controls="mobile-navigation" aria-expanded="false"><span></span><span></span><span></span></button>
    </div>
    <dialog class="mobile-nav-dialog" id="mobile-navigation" aria-label="Mobile navigation">
      <div class="mobile-nav-inner">
        <div class="mobile-nav-top"><span class="mobile-nav-label">Navigate</span><button class="mobile-nav-close" type="button" aria-label="Close navigation">×</button></div>
        <nav class="mobile-nav-links" aria-label="Site navigation">${internalLink('/projects', 'Projects')}${internalLink('/notes', 'Notes')}</nav>
        <nav class="mobile-nav-profiles" aria-label="Profile links"><span class="mobile-nav-label">Elsewhere</span><div class="mobile-profile-icons">${profileLinks()}</div></nav>
      </div>
    </dialog>
  </header>`;
}
