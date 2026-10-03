import { site } from '../content';
import { escapeHtml, internalLink } from '../utils';

export function Hero(): string {
  return (
    // Main hero section.
    // aria-labelledby connects this section to the main heading below.
    '<section class="hero" aria-labelledby="hero-title">' +

      // Decorative hero artwork/background.
      // aria-hidden prevents screen readers from treating it as meaningful content.
      '<div class="hero-art" aria-hidden="true"></div>' +

      // Decorative overlay placed over the hero artwork.
      '<div class="hero-overlay" aria-hidden="true"></div>' +

      // Main hero layout container.
      '<div class="shell hero-grid">' +

        // Left side of the hero: text, buttons, and social links.
        '<div class="hero-copy">' +

          // Main page heading.
          // \u2019 = curly apostrophe.
          '<h1 id="hero-title" class="reveal">' +
            'Hi! I\u2019m Jared' +

            // Colored/styled period after Jared.
            '<span class="accent-dot">.</span>' +
          '</h1>' +

          // Short introduction under the heading.
          '<p class="hero-intro reveal">' +
            'I\u2019m an Information Technology major @ UCF!' +
          '</p>' +

          // Hero action links/buttons.
          '<div class="hero-actions reveal">' +

            // Internal link to the Projects page.
            internalLink(
              '/projects',
              '<span aria-hidden="true">\u2192</span> View my projects',
              'button button-cream'
            ) +

            ' ' +

            // Scrolls to the "interests" section on the same page.
            '<a href="#interests" class="text-link">' +
              'A little about me ' +

              // \u2192 = right arrow.
              '<span aria-hidden="true">\u2192</span>' +
            '</a>' +

          '</div>' +

          // Social/profile links.
          '<div class="hero-social reveal">' +

            // Only show GitHub if a GitHub URL exists in site.github.
            (
              site.github
                ? '<a href="' +
                    escapeHtml(site.github) +
                    '" target="_blank" rel="noopener noreferrer">' +
                    'GitHub \u2197' +
                  '</a>'
                : ''
            ) +

            // LinkedIn is always displayed.
            '<a href="' +
              escapeHtml(site.linkedin) +
              '" target="_blank" rel="noopener noreferrer">' +
              'LinkedIn \u2197' +
            '</a>' +

            // Only show Resume if a resume URL exists.
            (
              site.resume
                ? '<a href="' +
                    escapeHtml(site.resume) +
                    '">' +
                    'Resume \u2197' +
                  '</a>'
                : ''
            ) +

          '</div>' +

        '</div>' +

        // Right side of the hero: portrait image.
        '<div class="portrait-wrap reveal">' +

          // Frame around the portrait.
          '<div class="portrait-frame">' +

            // Main hero portrait image.
            '<img ' +
              'class="portrait-image" ' +
              'src="/images/hero/portrait.webp" ' +
              'alt="Jared Del Mundo" ' +

              // Tells the browser this image is important and should load early.
              'fetchpriority="high" ' +
            '/>' +

          '</div>' +

        '</div>' +

      '</div>' +

      // Bottom part of the hero section.
      '<div class="hero-bottom shell">' +

        // Scroll hint shown near the bottom of the page.
        '<span class="hero-scroll">' +
          'SCROLL TO EXPLORE ' +

          // \u2193 = down arrow.
          '<span aria-hidden="true">\u2193</span>' +

        '</span>' +

      '</div>' +

    '</section>'
  );
}