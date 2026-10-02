import { marked } from 'marked';

export interface Note {
  slug: string;
  title: string;
  date: string;
  shortDate: string;
  excerpt: string;
  body: string;
}

const files = import.meta.glob('../content/notes/*.md', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;

function parseNote(path: string, source: string): Note {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) throw new Error(`Missing frontmatter: ${path}`);
  const metadata = Object.fromEntries(match[1].split(/\r?\n/).map((line) => {
    const divider = line.indexOf(':');
    return [line.slice(0, divider).trim(), line.slice(divider + 1).trim()];
  }));
  return {
    slug: path.split('/').pop()?.replace(/\.md$/, '') ?? '',
    title: metadata.title,
    date: metadata.date,
    shortDate: metadata.shortDate,
    excerpt: metadata.excerpt,
    body: match[2],
  };
}

export const notes = Object.entries(files).map(([path, source]) => parseNote(path, source)).sort((a, b) => b.date.localeCompare(a.date));

marked.setOptions({ gfm: true, breaks: false });
export function renderMarkdown(source: string): string {
  return marked.parse(source, { async: false }) as string;
}
