import type { AboutPhoto } from '../content';
import { escapeHtml } from '../utils';

export function PhotoCarousel(photos: AboutPhoto[], label: string): string {
  if (!photos.length) return '';

  return `<div class="photo-carousel" data-photo-carousel aria-roledescription="carousel" aria-label="${escapeHtml(label)}" tabindex="0">
    <div class="photo-carousel-frame">
      ${photos.map((photo, index) => `<figure class="photo-slide" data-photo-slide ${index ? 'hidden' : ''}>
        ${photo.image
          ? `<img src="${escapeHtml(photo.image)}" alt="${escapeHtml(photo.alt)}" loading="${index ? 'lazy' : 'eager'}" />`
          : `<div class="photo-slide-placeholder" role="img" aria-label="${escapeHtml(photo.alt)}"><span>Photo coming soon</span></div>`}
      </figure>`).join('')}
      <span class="photo-carousel-count" data-carousel-count aria-hidden="true">01 / ${String(photos.length).padStart(2, '0')}</span>
    </div>
    <div class="photo-carousel-bottom">
      <p class="photo-carousel-caption" data-carousel-caption aria-live="polite">${escapeHtml(photos[0].caption)}</p>
      <div class="photo-carousel-arrows">
        <button type="button" data-carousel-prev aria-label="Previous photo">←</button>
        <button type="button" data-carousel-next aria-label="Next photo">→</button>
      </div>
    </div>
    <div class="photo-carousel-dots" aria-label="Choose a photo">
      ${photos.map((photo, index) => `<button type="button" data-carousel-dot="${index}" data-carousel-caption="${escapeHtml(photo.caption)}" aria-label="Show photo ${index + 1}: ${escapeHtml(photo.caption)}" aria-pressed="${index === 0}"></button>`).join('')}
    </div>
  </div>`;
}

const cleanupCarousels: Array<() => void> = [];

export function initPhotoCarousels(): void {
  cleanupCarousels.splice(0).forEach((cleanup) => cleanup());

  document.querySelectorAll<HTMLElement>('[data-photo-carousel]').forEach((carousel) => {
    const slides = [...carousel.querySelectorAll<HTMLElement>('[data-photo-slide]')];
    const dots = [...carousel.querySelectorAll<HTMLButtonElement>('[data-carousel-dot]')];
    const caption = carousel.querySelector<HTMLElement>('[data-carousel-caption]');
    const count = carousel.querySelector<HTMLElement>('[data-carousel-count]');
    if (!slides.length || !caption || !count) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let index = 0;
    let hovered = false;
    let focused = false;
    let timer: number | undefined;
    let touchStart: { x: number; y: number } | undefined;

    const pauseAutoplay = () => reducedMotion.matches || hovered || focused || document.hidden;
    const schedule = () => {
      window.clearTimeout(timer);
      if (!pauseAutoplay() && slides.length > 1) timer = window.setTimeout(() => show(index + 1), 6000);
    };
    const show = (next: number) => {
      index = (next + slides.length) % slides.length;
      slides.forEach((slide, slideIndex) => { slide.hidden = slideIndex !== index; });
      dots.forEach((dot, dotIndex) => { dot.setAttribute('aria-pressed', String(dotIndex === index)); });
      caption.textContent = dots[index]?.dataset.carouselCaption ?? '';
      count.textContent = `${String(index + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
      schedule();
    };
    const onClick = (event: MouseEvent) => {
      const target = event.target as Element;
      if (target.closest('[data-carousel-prev]')) show(index - 1);
      if (target.closest('[data-carousel-next]')) show(index + 1);
      const dot = target.closest<HTMLButtonElement>('[data-carousel-dot]');
      if (dot) show(Number(dot.dataset.carouselDot));
    };
    const onKeydown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') { event.preventDefault(); show(index - 1); }
      if (event.key === 'ArrowRight') { event.preventDefault(); show(index + 1); }
    };
    const onPointerEnter = () => { hovered = true; schedule(); };
    const onPointerLeave = () => { hovered = false; schedule(); };
    const onFocusIn = () => { focused = true; schedule(); };
    const onFocusOut = () => { focused = carousel.contains(document.activeElement); schedule(); };
    const onPointerDown = (event: PointerEvent) => {
      if (event.pointerType === 'touch') touchStart = { x: event.clientX, y: event.clientY };
    };
    const onPointerUp = (event: PointerEvent) => {
      if (!touchStart || event.pointerType !== 'touch') return;
      const dx = event.clientX - touchStart.x;
      const dy = event.clientY - touchStart.y;
      touchStart = undefined;
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) show(index + (dx < 0 ? 1 : -1));
    };

    carousel.addEventListener('click', onClick);
    carousel.addEventListener('keydown', onKeydown);
    carousel.addEventListener('pointerenter', onPointerEnter);
    carousel.addEventListener('pointerleave', onPointerLeave);
    carousel.addEventListener('focusin', onFocusIn);
    carousel.addEventListener('focusout', onFocusOut);
    carousel.addEventListener('pointerdown', onPointerDown);
    carousel.addEventListener('pointerup', onPointerUp);
    document.addEventListener('visibilitychange', schedule);
    reducedMotion.addEventListener('change', schedule);
    schedule();

    cleanupCarousels.push(() => {
      window.clearTimeout(timer);
      document.removeEventListener('visibilitychange', schedule);
      reducedMotion.removeEventListener('change', schedule);
    });
  });
}
