import { site } from '../content';
import { escapeHtml, internalLink } from '../utils';

export function Header(): string {
  return (
    // Main site header.
    '<header class="site-header" id="site-header">' +

      // Keeps the header content aligned with the rest of the site.
      '<div class="shell header-inner">' +

        // Site brand/logo.
        // Uses data-link so your site's client-side navigation can handle it.
        '<a ' +
          'href="/" ' +
          'data-link ' +
          'class="brand wordmark" ' +
          'aria-label="Jared Del Mundo home"' +
        '>' +

          // Full version of the name.
          '<span class="brand-full">' +
            'Jared Del Mundo' +
          '</span>' +

          // Shorter version, likely used on smaller screens.
          '<span class="brand-short">' +
            'Del Mundo' +
          '</span>' +

        '</a>' +

        // Mobile navigation toggle button.
        '<button ' +
          'class="menu-toggle" ' +
          'type="button" ' +
          'aria-label="Open navigation" ' +
          'aria-controls="primary-navigation" ' +
          'aria-expanded="false"' +
        '>' +

          // These empty spans are typically styled as the hamburger icon lines.
          '<span></span>' +
          '<span></span>' +

        '</button>' +

        // Primary site navigation.
        '<nav ' +
          'class="primary-nav" ' +
          'id="primary-navigation" ' +
          'aria-label="Main navigation"' +
        '>' +

          // Internal navigation links.
          internalLink('/projects', 'Projects') +
          internalLink('/notes', 'Notes') +
          internalLink('/resume', 'Resume') +

          // LinkedIn link.
          // Opens in a new tab.
          '<a ' +
            'class="nav-social" ' +
            'href="' + escapeHtml(site.linkedin) + '" ' +
            'target="_blank" ' +
            'rel="noopener noreferrer" ' +
            'aria-label="LinkedIn"' +
          '>' +
            'in' +
          '</a>' +

          // Decorative dot in the navigation.
          '<span class="nav-dot" aria-hidden="true"></span>' +

        '</nav>' +

      '</div>' +

    '</header>'
  );
}