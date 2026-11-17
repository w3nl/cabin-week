const { test, expect } = require('@playwright/test');
const { KEY, seed, startDay, playDay } = require('./helpers');

test('een gehaalde dag zet de volgende dag open, ook na herladen', async ({ page }) => {
  await seed(page);
  await expect(page.locator('#levels button').nth(1)).toBeDisabled();
  await startDay(page, 0);
  await playDay(page);
  await expect(page.locator('#card')).toContainText('Next day: Tuesday');
  await page.reload();
  await expect(page.locator('#levels button').nth(1)).toBeEnabled();
  await expect(page.locator('#levels button').nth(2)).toBeDisabled();
  expect(await page.evaluate(KEY => JSON.parse(localStorage.getItem(KEY)).unlocked, KEY)).toBe(2);
});

test('het gekozen personage blijft bewaard', async ({ page }) => {
  await seed(page);
  await page.locator('#chars button', { hasText: 'Lily' }).click();
  await page.reload();
  await expect(page.locator('#chars button', { hasText: 'Lily' })).toHaveAttribute('aria-pressed', 'true');
});

test('zonder opslag (privévenster) werkt het spel gewoon', async ({ page }) => {
  await page.addInitScript(() => { Object.defineProperty(window, 'localStorage', { get() { throw new Error('geblokkeerd'); } }); });
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto('/');
  await expect(page.locator('html')).toHaveClass(/ready/);
  await page.locator('#levels button').first().click();
  await page.locator('#card .btn').first().click();
  await expect(page.locator('#hud')).toBeVisible();
  expect(errors).toEqual([]);
});

test('geen fouten in de console bij het spelen van elke dag', async ({ page }) => {
  const errors = []; page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await seed(page, { unlocked: 8 });
  for (let i = 0; i < 8; i++) {
    if (i) await page.locator('#hMenu').click();
    await startDay(page, i);
    await page.evaluate(() => { P.x = L.w * TS / 2; });
    await page.waitForTimeout(300);
  }
  expect(errors).toEqual([]);
});
