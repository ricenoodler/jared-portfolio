import { notes } from '../notes';
import { arrow, escapeHtml, internalLink, sectionLabel } from '../utils';

export function LatestNotes(): string {
  // Take only the first three notes and turn each one into a linked row.
  const rows = notes
    .slice(0, 3)
    .map((note) =>
      internalLink(
        '/notes/' + note.slug,

        // Build the visible contents of each note row.
        '<time datetime="' + note.date + '">' +
          escapeHtml(note.shortDate) +
        '</time>' +

        '<span>' +
          escapeHtml(note.title) +
        '</span>' +

        arrow,

        // CSS classes applied to the generated link.
        'note-row reveal'
      )
    )
    .join('');

  return (
    // Main latest-notes section.
    '<section ' +
      'class="latest-notes section-light" ' +
      'id="latest-notes" ' +
      'aria-labelledby="latest-title"' +
    '>' +

      // Keeps the section aligned with the rest of the site.
      '<div class="shell">' +

        // Small section label shown above the heading.
        sectionLabel('最近のノート', '05') +

        // Section heading and short description.
        '<div class="section-heading reveal">' +

          '<h2 id="latest-title">' +
            'Latest from notes' +
            '<span class="accent-dot">.</span>' +
          '</h2>' +

          '<p>' +
            'Things lately.' +
          '</p>' +

        '</div>' +

        // List of the three most recent notes.
        '<div class="notes-list">' +

          // If there are no notes, show an empty-state message instead.
          (
            rows ||
            '<p class="empty-state">' +
              'No published notes yet.' +
            '</p>'
          ) +

        '</div>' +

        // Link to the full notes page.
        '<div class="notes-more reveal">' +

          internalLink(
            '/notes',
            'All notes',
            'text-link dark-link'
          ) +

        '</div>' +

      '</div>' +

    '</section>'
  );
}