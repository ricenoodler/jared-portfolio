import assert from 'node:assert/strict';
import { chromium } from 'playwright-core';

/* global document, HTMLCanvasElement, getComputedStyle, console */
const browser = await chromium.launch({ executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', headless: true });
const base = 'http://127.0.0.1:4173';
const errors = [];
const node = (page, id) => page.locator(`[data-scene-node="${id}"]`);
const tab = (page, id) => page.locator(`[data-explorer-view="${id}"]`);
const camera = (page) => page.locator('.architecture-scene').evaluate((el) => ({ distance: Number(el.dataset.cameraDistance), position: el.dataset.cameraPosition, target: el.dataset.cameraTarget }));
async function labelsInFrame(page) {
  return page.locator('.architecture-scene').evaluate((scene) => {
    const frame = scene.getBoundingClientRect();
    return [...scene.querySelectorAll('.architecture-node-label')].every((label) => {
      const rect = label.getBoundingClientRect();
      return rect.left >= frame.left - 2 && rect.right <= frame.right + 2 && rect.top >= frame.top - 2 && rect.bottom <= frame.bottom + 2;
    });
  });
}

async function open(path, width = 1440, fallback = false, reducedMotion = 'reduce') {
  const page = await browser.newPage({ viewport: { width, height: 900 }, isMobile: width < 760, hasTouch: width < 760, reducedMotion });
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  if (fallback) {
    await page.addInitScript(() => {
      const original = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (kind, ...args) {
        if (kind === 'webgl' || kind === 'webgl2' || kind === 'experimental-webgl') return null;
        return original.call(this, kind, ...args);
      };
    });
  }
  await page.goto(base + path, { waitUntil: 'networkidle' });
  return page;
}

try {
  const p = await open('/projects/proxmox-homelab');
  assert.equal(await p.locator('.architecture-explorer').evaluate((el) => el.classList.contains('has-webgl')), true);
  assert.equal(await node(p, 'host').count(), 1);
  assert.equal(await node(p, 'debian').count(), 1);
  assert.equal(await node(p, 'immich_server').count(), 0);
  const initialCamera = await camera(p);
  assert.equal(await labelsInFrame(p), true);
  await p.locator('[data-scene-zoom-in]').click();
  assert.ok((await camera(p)).distance < initialCamera.distance * 0.85);
  await p.locator('[data-scene-zoom-out]').click();
  await p.waitForFunction((distance) => Math.abs(Number(document.querySelector('.architecture-scene').dataset.cameraDistance) - distance) < 0.1, initialCamera.distance);
  assert.ok(Math.abs((await camera(p)).distance - initialCamera.distance) < 0.1);
  const canvasBox = await p.locator('.architecture-scene-canvas').boundingBox();
  await p.mouse.move(canvasBox.x + 20, canvasBox.y + canvasBox.height / 2);
  await p.mouse.wheel(0, -240);
  await p.waitForFunction((before) => Number(document.querySelector('.architecture-scene').dataset.cameraDistance) < before, initialCamera.distance);
  assert.ok((await camera(p)).distance < initialCamera.distance);
  await p.locator('[data-scene-fit]').click();
  assert.equal(await labelsInFrame(p), true);
  const beforeTrackpad = await camera(p);
  await p.mouse.move(canvasBox.x + 20, canvasBox.y + canvasBox.height / 2);
  await p.mouse.wheel(0, -35);
  await p.waitForFunction((before) => Number(document.querySelector('.architecture-scene').dataset.cameraDistance) < before, beforeTrackpad.distance);
  await p.locator('[data-scene-fit]').click();
  for (let i = 0; i < 18; i++) await p.locator('[data-scene-zoom-in]').click();
  assert.ok((await camera(p)).distance >= 4.49 && (await camera(p)).distance <= 4.51);
  for (let i = 0; i < 20; i++) await p.locator('[data-scene-zoom-out]').click();
  assert.ok((await camera(p)).distance >= 119.9 && (await camera(p)).distance <= 120.01);
  await p.locator('[data-scene-reset]').click();
  assert.equal((await camera(p)).target, initialCamera.target);
  assert.ok(Math.abs((await camera(p)).distance - initialCamera.distance) < 0.1);
  await p.locator('[data-scene-zoom-in]').focus();
  await p.keyboard.press('Enter');
  await p.waitForFunction((distance) => Number(document.querySelector('.architecture-scene').dataset.cameraDistance) < distance, initialCamera.distance);
  await p.locator('[data-scene-fit]').focus();
  await p.keyboard.press('Enter');
  assert.equal(await labelsInFrame(p), true);
  await node(p, 'debian').click();
  assert.equal(await node(p, 'docker').count(), 1);
  assert.match(await p.locator('[data-explorer-detail]').innerText(), /DebianDelMundo/);
  await p.locator('[data-scene-fit]').click();
  assert.equal(await labelsInFrame(p), true);
  await node(p, 'docker').click();
  assert.equal(await node(p, 'immich').count(), 1);
  assert.equal(await node(p, 'immich_server').count(), 0);
  await p.locator('[data-scene-fit]').click();
  assert.equal(await labelsInFrame(p), true);
  assert.equal(await node(p, 'inactive-lab').count(), 0);
  await p.locator('.explorer-inactive-toggle').click();
  assert.equal(await node(p, 'inactive-lab').count(), 1);
  await p.locator('[data-scene-fit]').click();
  assert.equal(await labelsInFrame(p), true);
  await p.locator('.explorer-inactive-toggle').click();
  assert.equal(await node(p, 'inactive-lab').count(), 0);
  await node(p, 'immich').click();
  assert.equal(await node(p, 'immich_server').count(), 1);
  assert.equal(await node(p, 'immich_postgres').count(), 1);
  await p.locator('[data-scene-fit]').click();
  assert.equal(await labelsInFrame(p), true);
  await p.locator('[data-scene-back]').click();
  assert.equal(await node(p, 'immich_server').count(), 0);
  await node(p, 'nextcloud-aio').click();
  await p.locator('[data-scene-fit]').click();
  assert.equal(await labelsInFrame(p), true);
  await p.locator('[data-scene-back]').click();
  await tab(p, 'storage').click();
  assert.equal(await node(p, 'zfs').count(), 1);
  assert.equal(await node(p, 'zpool1').count(), 1);
  await tab(p, 'monitoring').click();
  assert.equal(await node(p, 'exporters').count(), 1);
  assert.equal(await node(p, 'prometheus').count(), 1);
  assert.equal(await node(p, 'grafana').count(), 1);
  await p.locator('.architecture-scene').screenshot({ path: '.qa/architecture-proxmox-3d.png' });
  await p.close();

  const u = await open('/projects/unifi-network-segmentation');
  assert.equal(await node(u, 'udr7').count(), 1);
  assert.equal(await node(u, 'internet').count(), 1);
  await tab(u, 'vlans').click();
  for (const id of ['trusted', 'family', 'iot']) assert.equal(await node(u, id).count(), 1);
  await tab(u, 'firewall').click();
  for (const type of ['allowed', 'blocked', 'exception']) assert.ok(await u.locator(`.architecture-connection-label--${type}`).count() > 0);
  await u.locator('[data-scene-fit]').click();
  assert.equal(await labelsInFrame(u), true);
  await tab(u, 'dns').click();
  for (const id of ['dns-clients', 'pi-hole', 'cloudflared', 'doh-upstream']) assert.equal(await node(u, id).count(), 1);
  await tab(u, 'remote').click();
  for (const id of ['wireguard', 'tailscale']) assert.equal(await node(u, id).count(), 1);
  await node(u, 'wireguard').focus();
  await u.keyboard.press('Enter');
  assert.match(await u.locator('[data-explorer-detail]').innerText(), /WireGuard/);
  await u.keyboard.press('Escape');
  assert.equal(await node(u, 'remote').getAttribute('aria-current'), 'location');
  await u.locator('.architecture-scene').screenshot({ path: '.qa/architecture-unifi-3d.png' });
  await u.close();

  for (const path of ['/projects/proxmox-homelab', '/projects/unifi-network-segmentation']) {
    const mobile = await open(path, 390);
    const dimensions = await mobile.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
    assert.equal(dimensions[0], dimensions[1], `${path} has horizontal overflow`);
    assert.equal(await mobile.locator('.architecture-scene').isVisible(), true);
    assert.equal(await mobile.locator('.architecture-scene-canvas').evaluate((el) => getComputedStyle(el).touchAction), 'pan-y');
    for (const control of ['zoom-in', 'zoom-out', 'fit', 'reset']) {
      const box = await mobile.locator(`[data-scene-${control}]`).boundingBox();
      assert.ok(box.width >= 44 && box.height >= 44, `${control} touch target is too small`);
    }
    if (path.includes('proxmox')) {
      await mobile.locator('.architecture-scene-canvas').scrollIntoViewIfNeeded();
      const box = await mobile.locator('.architecture-scene-canvas').boundingBox();
      const client = await mobile.context().newCDPSession(mobile);
      const touch = (id, x, y) => ({ id, x, y, radiusX: 2, radiusY: 2, force: 1 });
      const beforeOrbit = await camera(mobile);
      await client.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [touch(1, box.x + 35, box.y + 450)] });
      await client.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [touch(1, box.x + 90, box.y + 450)] });
      await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      await mobile.waitForFunction((position) => document.querySelector('.architecture-scene').dataset.cameraPosition !== position, beforeOrbit.position, { timeout: 2000 });
      assert.notEqual((await camera(mobile)).position, beforeOrbit.position);
      const beforePinch = await camera(mobile);
      await client.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [touch(2, box.x + 35, box.y + 500), touch(3, box.x + 85, box.y + 500)] });
      await client.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [touch(2, box.x + 20, box.y + 500), touch(3, box.x + 110, box.y + 500)] });
      await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      await mobile.waitForFunction((distance) => Number(document.querySelector('.architecture-scene').dataset.cameraDistance) < distance, beforePinch.distance, { timeout: 2000 });
      assert.ok((await camera(mobile)).distance < beforePinch.distance);
      const beforeTouchPan = await camera(mobile);
      await client.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [touch(4, box.x + 35, box.y + 500), touch(5, box.x + 85, box.y + 500)] });
      await client.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [touch(4, box.x + 65, box.y + 500), touch(5, box.x + 115, box.y + 500)] });
      await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      await mobile.waitForFunction((target) => document.querySelector('.architecture-scene').dataset.cameraTarget !== target, beforeTouchPan.target, { timeout: 2000 });
      const beforeScroll = await mobile.evaluate(() => globalThis.scrollY);
      await client.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [touch(6, box.x + 35, box.y + 400)] });
      for (const y of [350, 300, 250, 200]) await client.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [touch(6, box.x + 35, box.y + y)] });
      await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      await mobile.waitForFunction((scroll) => globalThis.scrollY > scroll, beforeScroll, { timeout: 2000 });
      await client.detach();
      await mobile.locator('[data-scene-fit]').click();
      assert.equal(await labelsInFrame(mobile), true);
    }
    await mobile.locator('.architecture-scene').screenshot({ path: `.qa/architecture-${path.includes('proxmox') ? 'proxmox' : 'unifi'}-mobile.png` });
    await mobile.close();
  }

  const fallback = await open('/projects/proxmox-homelab', 1440, true);
  assert.equal(await fallback.locator('.architecture-explorer').evaluate((el) => el.classList.contains('has-webgl')), false);
  assert.equal(await fallback.locator('[data-explorer-stage]').isVisible(), true);
  await fallback.locator('[data-explorer-node="debian"]').click();
  assert.match(await fallback.locator('[data-explorer-detail]').innerText(), /DebianDelMundo/);
  await fallback.close();
  const animated = await open('/projects/proxmox-homelab', 1440, false, 'no-preference');
  await animated.locator('.architecture-scene-canvas').scrollIntoViewIfNeeded();
  await animated.waitForTimeout(700);
  const beforeDrag = await camera(animated);
  const dragBox = await animated.locator('.architecture-scene-canvas').boundingBox();
  await animated.mouse.move(dragBox.x + 80, dragBox.y + 300);
  await animated.mouse.down();
  await animated.mouse.move(dragBox.x + 160, dragBox.y + 340, { steps: 8 });
  await animated.mouse.up();
  assert.notEqual((await camera(animated)).position, beforeDrag.position);
  const beforePan = await camera(animated);
  await animated.mouse.move(dragBox.x + 80, dragBox.y + 300);
  await animated.mouse.down({ button: 'right' });
  await animated.mouse.move(dragBox.x + 145, dragBox.y + 300, { steps: 8 });
  await animated.mouse.up({ button: 'right' });
  assert.notEqual((await camera(animated)).target, beforePan.target);
  await animated.locator('[data-scene-reset]').click();
  await animated.waitForFunction((target) => {
    const actual = document.querySelector('.architecture-scene').dataset.cameraTarget.split(',').map(Number);
    return Math.hypot(...actual.map((value, index) => value - target[index])) < 0.05;
  }, beforeDrag.target.split(',').map(Number));
  await node(animated, 'debian').hover();
  assert.equal(await node(animated, 'debian').evaluate((el) => el.classList.contains('is-hovered')), true);
  await node(animated, 'debian').click();
  assert.match(await animated.locator('[data-explorer-detail]').innerText(), /DebianDelMundo/);
  await animated.locator('.architecture-scene-canvas').click({ position: { x: 20, y: 300 } });
  assert.equal(await animated.locator('[data-explorer-detail]').isVisible(), false);
  await animated.close();
  assert.deepEqual(errors, []);
  console.log('Architecture scene: camera controls, mouse and touch gestures, fit, limits, drill-down, keyboard, mobile, reduced motion, and WebGL fallback passed.');
} finally {
  await browser.close();
}
