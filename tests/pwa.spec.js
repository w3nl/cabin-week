const { test, expect } = require('@playwright/test');
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');

test('het spel is een installeerbare app die offline werkt', async ({ page, context }) => {
  await page.goto('/');
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.waitForTimeout(500);
  const cdp = await context.newCDPSession(page);
  const { installabilityErrors } = await cdp.send('Page.getInstallabilityErrors');
  expect(installabilityErrors.filter(e => e.errorId !== 'in-incognito')).toEqual([]);
  const { errors } = await cdp.send('Page.getAppManifest');
  expect(errors).toEqual([]);
  await context.setOffline(true);
  await page.reload();
  await expect(page.locator('html')).toHaveClass(/ready/);
  await page.locator('#levels button').first().click();
  await page.locator('#card .btn').first().click();
  await expect(page.locator('#hud')).toBeVisible();
  await context.setOffline(false);
});

test('elk bestand in de offline-lijst bestaat, en elk spelbestand staat erin', async () => {
  const sw = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
  const core = [...sw.match(/const CORE = \[([\s\S]*?)\];/)[1].matchAll(/'\.\/([^']*)'/g)].map(m => m[1]).filter(Boolean);
  for (const f of core) expect(fs.existsSync(path.join(root, f)), f).toBe(true);
  for (const dir of ['js', 'css', 'icons'])
    for (const f of fs.readdirSync(path.join(root, dir))) expect(core, `${dir}/${f} staat niet in sw.js`).toContain(`${dir}/${f}`);
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  for (const f of fs.readdirSync(path.join(root, 'js'))) expect(html, `js/${f} wordt niet geladen in index.html`).toContain(`js/${f}`);
});

test('het titelscherm toont de versie, en een nieuwere versie biedt herladen aan', async ({ page }) => {
  const sw = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
  const cacheVersion = +sw.match(/const CACHE = 'cabinweek-v(\d+)'/)[1];
  await page.goto('/');
  await expect(page.locator('#version')).toHaveText('v' + cacheVersion);
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.waitForTimeout(500);
  await expect(page.locator('#update-bar')).toBeHidden();
  await page.evaluate(v => swVersion('cabinweek-v' + (v + 1)), cacheVersion);
  await expect(page.locator('#update-bar')).toBeVisible();
});

test('de service worker wist alleen zijn eigen oude caches', async () => {
  const sw = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
  expect(sw).toContain("k.startsWith('cabinweek-')");
});

test('de privacypagina (voor Google Play) bestaat, staat op de site en zegt dat er niets verzameld wordt', async ({ page }) => {
  const build = fs.readFileSync(path.join(root, 'tools', 'build-site.js'), 'utf8');
  expect(build).toContain("'privacy.html'");
  await page.goto('/privacy.html');
  await expect(page.locator('h1').first()).toHaveText('Privacy');
  await expect(page.locator('main')).toContainText('collects no personal data');
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
  expect(overflow).toBe(false);
});

test('iPhone en iPad: op het beginscherm op volledig scherm, geen tekstvergroting bij draaien', async ({ page }) => {
  await page.goto('/');
  for (const name of ['apple-mobile-web-app-capable', 'apple-mobile-web-app-title', 'apple-mobile-web-app-status-bar-style'])
    await expect(page.locator(`meta[name="${name}"]`)).toHaveCount(1);
  await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveCount(1);
  const adjust = await page.evaluate(() => getComputedStyle(document.documentElement).webkitTextSizeAdjust || getComputedStyle(document.documentElement).textSizeAdjust);
  expect(adjust).toBe('100%');
});
