import { site } from '../content';
import { escapeHtml, internalLink } from '../utils';

export function Footer(): string {
  return (
    // Main site footer.
    '<footer class="site-footer">' +

      // Decorative skyline/background element.
      '<div class="footer-skyline" aria-hidden="true"></div>' +

      // Main footer content container.
      '<div class="shell footer-inner">' +

        // Footer identity / site name.
        '<div class="footer-identity">' +

          // Link back to the homepage.
          '<a href="/" data-link class="wordmark">' +
            'Jared Del Mundo' +
          '</a>' +

        '</div>' +

        // Footer navigation links.
        '<nav class="footer-nav" aria-label="Footer navigation">' +

          // Internal site links.
          internalLink('/projects', 'Projects') +
          internalLink('/notes', 'Notes') +
      '<a href="' + escapeHtml(site.resume) + '" target="_blank" rel="noopener noreferrer">Resume</a>' +

          // Only show GitHub if a URL exists.
          (
            site.github
              ? '<a href="' +
                  escapeHtml(site.github) +
                  '" target="_blank" rel="noopener noreferrer">' +
                  'GitHub' +
                '</a>'
              : ''
          ) +

          // LinkedIn link.
          '<a href="' +
            escapeHtml(site.linkedin) +
            '" target="_blank" rel="noopener noreferrer">' +
            'LinkedIn' +
          '</a>' +

          // Only show Email if an email address exists.
          (
            site.email
              ? '<a href="mailto:' +
                  escapeHtml(site.email) +
                  '">' +
                  'Email' +
                '</a>'
              : ''
          ) +

        '</nav>' +

        // Short thank-you message.
        '<div class="footer-thanks">' +
          'Thanks for<br />' +
          'stopping by' +
          '<span class="accent-dot">!</span>' +
        '</div>' +

        // Bottom row with copyright and back-to-top link.
        '<div class="footer-bottom">' +

          // Copyright year updates automatically.
          '<span>' +
            '© ' +
            new Date().getFullYear() +
            ' Jared Del Mundo' +
          '</span>' +

          // Scroll back to the top of the page.
          '<a href="#top">' +
            'Back to top ↑' +
          '</a>' +

        '</div>' +

      '</div>' +

    '</footer>'
  );
}
