import {
  notes,
  renderMarkdown,
} from '../notes';

import {
  arrow,
  escapeHtml,
  internalLink,
} from '../utils';


/* ============================================================
   Notes Index
   ============================================================ */

/**
 * Render the main Notes page containing a list of all notes.
 */
export function NotesIndex(): string {
  /**
   * Build one linked row for every note.
   */
  const rows = notes
    .map((note) =>
      internalLink(
        '/notes/' + note.slug,

        // Contents of each note row.
        '<time datetime="' + note.date + '">' +
          escapeHtml(note.shortDate) +
        '</time>' +

        '<span class="note-index-title">' +
          escapeHtml(note.title) +

          '<small>' +
            escapeHtml(note.excerpt) +
          '</small>' +
        '</span>' +

        arrow,

        // CSS classes applied to the generated link.
        'note-row reveal'
      )
    )
    .join('');


  return (
    // Main notes index page.
    '<main class="subpage notes-page">' +

      '<div class="shell">' +

        // Page introduction.
        '<div class="page-intro reveal">' +

          '<span class="page-kicker">' +
            '02 / FIELD NOTES' +
          '</span>' +

          '<h1>' +
            'Notes' +
            '<span class="accent-dot">.</span>' +
          '</h1>' +

          '<p>' +
            'Things I’m learning, fixing, wondering about, trying remember next time.' +
          '</p>' +

        '</div>' +

        // Notes list.
        '<div class="notes-index-list">' +

          // Show an empty-state message if there are no notes.
          (
            rows ||
            '<p class="empty-state">' +
              'No published notes yet.' +
            '</p>'
          ) +

        '</div>' +

      '</div>' +

    '</main>'
  );
}


/* ============================================================
   Individual Note Article
   ============================================================ */

/**
 * Render a single note based on its URL slug.
 */
export function NoteArticle(
  slug: string
): string {
  // Find the note matching the requested slug.
  const note = notes.find(
    (item) =>
      item.slug === slug
  );


  /* ----------------------------------------------------------
     Note Not Found
     ---------------------------------------------------------- */

  // Return a 404-style page if no matching note exists.
  if (!note) {
    return (
      '<main class="subpage missing-page">' +

        '<div class="shell">' +

          '<span class="page-kicker">' +
            '404 / NOT FOUND' +
          '</span>' +

          '<h1>' +
            'That note isn’t here' +
            '<span class="accent-dot">.</span>' +
          '</h1>' +

          '<p>' +
            'The note may have moved, or the address may contain a typo.' +
          '</p>' +

          // Link back to the Notes page.
          internalLink(
            '/notes',
            'Back to notes ' + arrow,
            'button button-navy'
          ) +

        '</div>' +

      '</main>'
    );
  }


  /* ----------------------------------------------------------
     Note Article
     ---------------------------------------------------------- */

  return (
    '<main class="subpage article-page">' +

      '<article class="shell article-shell">' +

        // Article heading and metadata.
        '<div class="article-heading">' +

          '<span class="page-kicker">' +

            'FIELD NOTES / ' +

            '<time datetime="' + note.date + '">' +
              escapeHtml(note.shortDate) +
            '</time>' +

          '</span>' +

          // Note title.
          '<h1>' +
            escapeHtml(note.title) +
            '<span class="accent-dot">.</span>' +
          '</h1>' +

          // Short summary/excerpt.
          '<p>' +
            escapeHtml(note.excerpt) +
          '</p>' +

          // Note tags.
          '<ul ' +
            'class="tag-list note-tags" ' +
            'aria-label="Tags"' +
          '>' +

            note.tags
              .map(
                (tag) =>
                  '<li>' +
                    escapeHtml(tag) +
                  '</li>'
              )
              .join('') +

          '</ul>' +

        '</div>' +

        // Main article content.
        // renderMarkdown converts the note body into HTML.
        '<div class="article-body">' +
          renderMarkdown(note.body) +
        '</div>' +

        // Link back to the full Notes page.
        '<div class="article-back">' +

          internalLink(
            '/notes',
            '← All notes',
            'text-link dark-link'
          ) +

        '</div>' +

      '</article>' +

    '</main>'
  );
}