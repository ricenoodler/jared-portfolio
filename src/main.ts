import './style.css';
import './homepage.css';
import './project-pages.css';
import './navbar.css';
import { Footer } from './components/Footer';
import { initProjectArchitectures } from './components/ProjectArchitecture';
import { Header } from './components/Header';
import { moments, sortedProjects } from './content';
import { notes } from './notes';
import { Home } from './pages/Home';
import { NoteArticle, NotesIndex } from './pages/Notes';
import { Projects } from './pages/Projects';
import { ProjectArticle } from './pages/ProjectArticle';

const app = document.querySelector<HTMLDivElement>('#app');
if (!app) throw new Error('Missing #app root');

function currentPath(): string {
  const path = window.location.pathname.replace(/\/$/, '');
  return path || '/';
}

function pageContent(path: string): string {
  if (path === '/') return Home();
  if (path === '/projects') return Projects();
  if (path.startsWith('/projects/')) return ProjectArticle(path.slice('/projects/'.length));
  if (path === '/notes') return NotesIndex();
  if (path.startsWith('/notes/')) return NoteArticle(path.slice('/notes/'.length));
  return `<main class="subpage missing-page"><div class="shell"><span class="page-kicker">404 / NOT FOUND</span><h1>Wrong turn<span class="accent-dot">.</span></h1><p>There’s no page at this address.</p><a href="/" data-link class="button button-navy">Go home →</a></div></main>`;
}

function setPageTitle(path: string): void {
  const project = path.startsWith('/projects/') ? sortedProjects.find((entry) => entry.slug === path.slice('/projects/'.length)) : undefined;
  const note = path.startsWith('/notes/') ? notes.find((entry) => entry.slug === path.slice('/notes/'.length)) : undefined;
  const label = path === '/' ? 'IT, systems & everything in between' : path === '/projects' ? 'Projects' : path === '/notes' ? 'Notes' : project?.title ?? note?.title ?? 'Page not found';
  document.title = `${label} — Jared Del Mundo`;
  const description = path === '/' ? 'Jared Del Mundo is an Information Technology student exploring systems, networks, aviation, and the things that keep him curious.' : path === '/projects' ? 'Explore Jared Del Mundo’s hands on systems, networking, and infrastructure projects.' : path === '/notes' ? 'Notes from Jared Del Mundo on technology, troubleshooting, and the things he is learning.' : project?.summary ?? note?.excerpt ?? 'Jared Del Mundo’s personal portfolio.';
  document.querySelector('meta[name="description"]')?.setAttribute('content', description);
}

function render(): void {
  if (!app) return;
  const path = currentPath();
  document.body.classList.toggle('is-home', path === '/');
  const content = pageContent(path);
  const pageBody = path === '/' ? `<main id="main-content" tabindex="-1" class="home-page">${content}</main>` : `<div id="main-content" tabindex="-1">${content}</div>`;
  app.innerHTML = `<a class="skip-link" href="#main-content">Skip to content</a><div id="top"></div>${Header()}${pageBody}${Footer()}<dialog class="moment-dialog" aria-label="Moment details"><button type="button" class="dialog-close" aria-label="Close image">×</button><div class="dialog-content"></div></dialog><dialog class="case-media-dialog" aria-label="Project screenshot"><button type="button" class="case-media-close" aria-label="Close screenshot">×</button><img alt="" /><p class="case-media-dialog-caption"></p></dialog>`;
  const mobileMenuButton = document.querySelector<HTMLButtonElement>('.menu-toggle');
  document.querySelector<HTMLDialogElement>('.mobile-nav-dialog')?.addEventListener('close', () => {
    document.body.classList.remove('mobile-nav-open');
    mobileMenuButton?.setAttribute('aria-expanded', 'false');
    mobileMenuButton?.setAttribute('aria-label', 'Open navigation');
    if (mobileMenuButton?.isConnected) mobileMenuButton.focus();
  });
  setPageTitle(path);
  initProjectArchitectures();
  revealObserver.disconnect();
  document.querySelectorAll<HTMLElement>('.reveal').forEach((element) => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { element.classList.add('is-visible'); return; }
    revealObserver.observe(element);
  });
  updateHeader();
  if (window.location.hash) requestAnimationFrame(() => document.querySelector(window.location.hash)?.scrollIntoView());
}

const revealObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
  });
}, { threshold: 0.08, rootMargin: '0px 0px 40px 0px' });

function updateHeader(): void {
  document.querySelector('.site-header')?.classList.toggle('is-scrolled', window.scrollY > 36 || currentPath() !== '/');
}

window.addEventListener('scroll', updateHeader, { passive: true });
window.addEventListener('popstate', () => { render(); window.scrollTo(0, 0); });
document.addEventListener('click', (event) => {
  const target = event.target as HTMLElement;
  const menuButton = target.closest<HTMLButtonElement>('.menu-toggle');
  if (menuButton) {
    const dialog = document.querySelector<HTMLDialogElement>('.mobile-nav-dialog');
    if (dialog && !dialog.open) {
      dialog.showModal();
      document.body.classList.add('mobile-nav-open');
      menuButton.setAttribute('aria-expanded', 'true');
      menuButton.setAttribute('aria-label', 'Close navigation');
      dialog.querySelector<HTMLButtonElement>('.mobile-nav-close')?.focus();
    }
    return;
  }
  if (target.closest('.mobile-nav-close')) { document.querySelector<HTMLDialogElement>('.mobile-nav-dialog')?.close(); return; }
  const mobileNavLink = target.closest<HTMLAnchorElement>('.mobile-nav-dialog a');
  if (mobileNavLink) document.querySelector<HTMLDialogElement>('.mobile-nav-dialog')?.close();
  const momentButton = target.closest<HTMLButtonElement>('[data-moment]');
  if (momentButton) {
    const moment = moments[Number(momentButton.dataset.moment)];
    const dialog = document.querySelector<HTMLDialogElement>('.moment-dialog');
    if (moment && dialog) {
      const content = dialog.querySelector('.dialog-content');
      if (content) {
        const image = document.createElement('img'); image.src = moment.image; image.alt = moment.alt;
        const heading = document.createElement('h2'); heading.textContent = moment.title;
        const caption = document.createElement('p'); caption.textContent = moment.caption;
        content.replaceChildren(image, heading, caption);
      }
      dialog.showModal();
    }
    return;
  }
  const mediaButton = target.closest<HTMLButtonElement>('.case-media-trigger');
  if (mediaButton) {
    const dialog = document.querySelector<HTMLDialogElement>('.case-media-dialog');
    const image = dialog?.querySelector('img');
    const caption = dialog?.querySelector<HTMLElement>('.case-media-dialog-caption');
    if (dialog && image && caption && mediaButton.dataset.caseMediaSrc) {
      image.src = mediaButton.dataset.caseMediaSrc;
      image.alt = mediaButton.dataset.caseMediaAlt ?? '';
      caption.textContent = mediaButton.dataset.caseMediaCaption ?? '';
      dialog.showModal();
    }
    return;
  }
  if (target.closest('.case-media-close')) { document.querySelector<HTMLDialogElement>('.case-media-dialog')?.close(); return; }
  if (target.closest('.dialog-close')) { document.querySelector<HTMLDialogElement>('.moment-dialog')?.close(); return; }
  const link = target.closest<HTMLAnchorElement>('a[data-link]');
  if (link && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey) {
    const url = new URL(link.href);
    if (url.origin !== window.location.origin) return;
    event.preventDefault();
    if (url.pathname !== window.location.pathname || url.hash !== window.location.hash) history.pushState({}, '', url.pathname + url.hash);
    render();
    if (mobileNavLink) document.querySelector<HTMLElement>('#main-content')?.focus();
    if (!url.hash) window.scrollTo({ top: 0, behavior: 'instant' });
  }
});

render();
