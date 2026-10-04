import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';
import { URL } from 'node:url';
import assert from 'node:assert/strict';
/* global innerWidth, document, window, console, getComputedStyle */

const browser = await chromium.launch({ executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', headless: true });
mkdirSync('.qa', { recursive: true });
const errors = [];
const base = 'http://127.0.0.1:4173';

async function check(path, width, height, screenshot) {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1, isMobile: width < 760, hasTouch: width < 760, reducedMotion: 'reduce' });
  page.setDefaultTimeout(5000);
  page.on('pageerror', (error) => errors.push(`${path}: ${error.message}`));
  page.on('console', (message) => { if (message.type() === 'error') errors.push(`${path}: ${message.text()}`); });
  const response = await page.goto(`${base}${path}`, { waitUntil: 'networkidle' });
  await page.screenshot({ path: `.qa/${screenshot}`, fullPage: true, animations: 'disabled' });
  const metrics = await page.evaluate(() => ({
    width: innerWidth,
    documentWidth: document.documentElement.scrollWidth,
    height: document.documentElement.scrollHeight,
    title: document.title,
    h1: document.querySelector('h1')?.textContent,
  }));
  if (path === '/') {
    const step = width < 760 ? 1250 : 1400;
    for (let y = 0, index = 0; y < metrics.height; y += step, index++) {
      await page.evaluate((scrollY) => window.scrollTo(0, scrollY), y);
      await page.screenshot({ path: `.qa/${width < 760 ? 'mobile' : 'desktop'}-${index}.png`, animations: 'disabled' });
    }
  }
  return { page, metrics: { status: response?.status(), ...metrics } };
}

try {
  const results = {};
  const desktop = await check('/', 1440, 900, 'check-desktop.png'); results.desktop = desktop.metrics;
  results.homeSections = await desktop.page.locator('main > section').evaluateAll((sections) => sections.map((section) => section.id || 'hero'));
  results.homeCounts = await desktop.page.evaluate(() => ({ projects: document.querySelectorAll('.project-card').length, interests: document.querySelectorAll('.interest-row').length, values: document.querySelectorAll('.value-item').length, trivia: document.querySelectorAll('.trivia-list li').length, moments: document.querySelectorAll('.moment-tile').length, notes: document.querySelectorAll('.latest-notes .note-row').length }));
  results.homeFeaturedLinks = await desktop.page.locator('.project-card .project-image').evaluateAll((links) => links.map((link) => link.getAttribute('href')));
  await desktop.page.locator('.project-image').first().click();
  results.projectNavigation = { path: new URL(desktop.page.url()).pathname, hash: new URL(desktop.page.url()).hash };
  await desktop.page.close();
  const mobile = await check('/', 390, 844, 'check-mobile.png'); results.mobile = mobile.metrics;
  await mobile.page.evaluate(() => document.querySelector('.menu-toggle')?.click());
  results.menu = { expanded: await mobile.page.locator('.menu-toggle').getAttribute('aria-expanded'), visible: await mobile.page.locator('.primary-nav').isVisible() };
  await mobile.page.keyboard.press('Escape');
  results.menuEscape = await mobile.page.locator('.menu-toggle').getAttribute('aria-expanded');
  await mobile.page.evaluate(() => document.querySelector('[data-moment="0"]')?.click());
  results.moment = await mobile.page.locator('.moment-dialog').evaluate((dialog) => dialog.open);
  await mobile.page.keyboard.press('Escape');
  results.momentEscape = await mobile.page.locator('.moment-dialog').evaluate((dialog) => dialog.open);
  await mobile.page.close();
  for (const [name, path] of Object.entries({ projects: '/projects', proxmox: '/projects/proxmox-homelab', unifi: '/projects/unifi-network-segmentation', windows: '/projects/windows-server-ad-lab', missingProject: '/projects/not-a-project', notes: '/notes', article: '/notes/building-my-portfolio', resume: '/resume', unknown: '/unknown' })) {
    const checked = await check(path, 1440, 900, `check-${name}.png`);
    results[name] = checked.metrics;
    if (name === 'projects') results.projectLinks = await checked.page.locator('.project-detail-image').evaluateAll((links) => links.map((link) => link.getAttribute('href')));
    await checked.page.close();
  }
  results.mobileRoutes = {};
  for (const path of ['/projects', '/projects/proxmox-homelab', '/projects/unifi-network-segmentation', '/projects/windows-server-ad-lab', '/notes', '/notes/building-my-portfolio', '/resume']) {
    const page = await browser.newPage({ viewport: { width: 320, height: 760 }, isMobile: true, reducedMotion: 'reduce' });
    const response = await page.goto(`${base}${path}`, { waitUntil: 'networkidle' });
    results.mobileRoutes[path] = await page.evaluate(() => ({ viewport: innerWidth, documentWidth: document.documentElement.scrollWidth, h1: document.querySelector('h1')?.textContent }));
    results.mobileRoutes[path].status = response?.status();
    if (path === '/projects' || path === '/projects/proxmox-homelab' || path === '/projects/windows-server-ad-lab' || path === '/notes/building-my-portfolio') await page.screenshot({ path: `.qa/check-mobile-${path.replaceAll('/', '-').slice(1)}.png`, fullPage: true, animations: 'disabled' });
    await page.close();
  }
  results.breakpoints = {};
  for (const width of [320, 360, 768, 1024, 1280]) {
    const page = await browser.newPage({ viewport: { width, height: 900 }, deviceScaleFactor: 1, isMobile: width < 760, reducedMotion: 'reduce' });
    await page.goto(base, { waitUntil: 'networkidle' });
    results.breakpoints[width] = await page.evaluate(() => {
      const brand = document.querySelector('.brand')?.getBoundingClientRect();
      const toggle = document.querySelector('.menu-toggle')?.getBoundingClientRect();
      const footerBrand = document.querySelector('.footer-identity .wordmark')?.getBoundingClientRect();
      return { viewport: innerWidth, documentWidth: document.documentElement.scrollWidth, brandRight: Math.round(brand?.right ?? 0), footerBrandRight: Math.round(footerBrand?.right ?? 0), menuLeft: Math.round(toggle?.left ?? 0), menuVisible: getComputedStyle(document.querySelector('.menu-toggle')).display !== 'none' };
    });
    if (width === 320 || width === 768) await page.screenshot({ path: `.qa/check-${width}.png` });
    await page.close();
  }
  const motionPage = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'no-preference' });
  await motionPage.goto(base, { waitUntil: 'networkidle' });
  await motionPage.locator('#interests').scrollIntoViewIfNeeded();
  await motionPage.waitForTimeout(850);
  results.motion = await motionPage.locator('#interests .section-heading').evaluate((heading) => ({ visible: heading.classList.contains('is-visible'), opacity: getComputedStyle(heading).opacity }));
  await motionPage.close();
  results.errors = errors;
  assert.deepEqual(results.homeSections, ['hero', 'featured', 'interests', 'values', 'trivia', 'moments', 'latest-notes']);
  assert.deepEqual(results.homeCounts, { projects: 3, interests: 4, values: 4, trivia: 6, moments: 6, notes: 0 });
  assert.deepEqual(results.homeFeaturedLinks, ['/projects/proxmox-homelab', '/projects/unifi-network-segmentation', '/projects/windows-server-ad-lab']);
  assert.deepEqual(results.projectLinks, ['/projects/windows-server-ad-lab', '/projects/unifi-network-segmentation', '/projects/proxmox-homelab']);
  assert.equal(results.projectNavigation.path, '/projects/proxmox-homelab');
  assert.equal(results.projectNavigation.hash, '');
  assert.equal(results.proxmox.h1, 'Proxmox Homelab.');
  assert.equal(results.unifi.h1, 'UniFi Network Segmentation.');
  assert.equal(results.windows.h1, 'Windows Server & Active Directory Lab.');
  assert.match(results.missingProject.h1, /Wrong turn/);
  assert.equal(results.menu.expanded, 'true');
  assert.equal(results.menu.visible, true);
  assert.equal(results.menuEscape, 'false');
  assert.equal(results.moment, true);
  assert.equal(results.momentEscape, false);
  assert.equal(results.motion.visible, true);
  assert.ok(results.breakpoints[320].footerBrandRight <= 320);
  for (const checked of [results.desktop, results.mobile, results.projects, results.proxmox, results.unifi, results.windows, results.notes, results.article, results.resume, ...Object.values(results.mobileRoutes), ...Object.values(results.breakpoints)]) {
    assert.equal(checked.documentWidth, checked.width ?? checked.viewport);
    if ('status' in checked) assert.equal(checked.status, 200);
  }
  assert.deepEqual(results.errors, []);
  console.log(JSON.stringify(results, null, 2));
} finally {
  await browser.close();
}
