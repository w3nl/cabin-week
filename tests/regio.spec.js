// Regions: the map of Europe, choosing a region, and separate progress per region.
const { test, expect } = require('@playwright/test');
const { KEY, seed, startDay, playDay } = require('./helpers');

test('the map shows the regions; choosing one switches the days, and the choice is remembered', async ({ page }) => {
  await seed(page);
  await expect(page.locator('#regionName')).toHaveText('Ardennes');
  await expect(page.locator('#levels .t').first()).toHaveText('Arrival in Pinebrook');
  await page.locator('#regionBtn').click();
  await expect(page.locator('#mapWrap')).toBeVisible();
  await expect(page.locator('#mapBox .pin')).toHaveCount(4);
  await expect(page.locator('#mapBox .pin.here')).toHaveAttribute('data-region', 'ardennes');
  await expect(page.locator('#mapSoon')).toContainText('Iceland');
  await page.locator('#mapBox .pin[data-region="tirol"]').click();
  await expect(page.locator('#title')).toBeVisible();
  await expect(page.locator('#regionName')).toHaveText('Tirol');
  await expect(page.locator('#eyebrow')).toContainText('Tirol');
  await expect(page.locator('#levels .t').first()).toHaveText('Arrival in Lindenalm');
  await expect(page.locator('#week li').nth(2)).toContainText('Cable car');
  await page.reload();
  await expect(page.locator('#regionName')).toHaveText('Tirol');
  expect(await page.evaluate(KEY => JSON.parse(localStorage.getItem(KEY)).region, KEY)).toBe('tirol');
});

test('every region starts at day 1: you do not have to finish the Ardennes first', async ({ page }) => {
  await seed(page);
  for (const id of ['pole', 'tirol', 'norway']) {
    await page.evaluate(id => { setRegion(id, true); toTitle(); }, id);
    await expect(page.locator('#levels button').first()).toBeEnabled();
    await expect(page.locator('#levels button').nth(1)).toBeDisabled();
  }
});

test('progress is kept per region, and an old save still counts for the Ardennes', async ({ page }) => {
  await seed(page, { unlocked: 3 });
  await page.evaluate(() => { setRegion('norway', true); toTitle(); });
  await expect(page.locator('#levels button').nth(1)).toBeDisabled();
  await startDay(page, 0);
  await playDay(page);
  await expect(page.locator('#card')).toContainText('Next day: Tuesday');
  await page.reload();
  await expect(page.locator('#levels button').nth(1)).toBeEnabled();
  await expect(page.locator('#cdNum')).toHaveText('1/8');
  const s = await page.evaluate(KEY => JSON.parse(localStorage.getItem(KEY)), KEY);
  expect(s.unlocked).toBe(3);
  expect(s.regions.norway.unlocked).toBe(2);
  await page.locator('#regionBtn').click();
  await expect(page.locator('#mapBox .pin[data-region="norway"] small')).toHaveText('1/8');
  await page.locator('#mapBox .pin[data-region="ardennes"]').click();
  await expect(page.locator('#levels button').nth(2)).toBeEnabled();
  await expect(page.locator('#levels button').nth(3)).toBeDisabled();
});

test('the map works with the keyboard and the remote: arrows, Enter, and Escape goes back', async ({ page }) => {
  await seed(page);
  await page.locator('#regionBtn').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#mapWrap')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('#title')).toBeVisible();
  await page.locator('#regionBtn').click();
  await page.locator('#mapBox .pin.here').focus();
  await page.keyboard.press('ArrowUp');
  await expect(page.locator('#mapBox .pin[data-region="norway"]')).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#regionName')).toHaveText('Norway');
});

test('the new regions have their own scenery, enemies and checkpoint flags', async ({ page }) => {
  await seed(page, { unlocked: 8 });
  const info = await page.evaluate(() => REGIONS.map(r => ({ id: r.id, n: r.levels.length, scenes: [...new Set(r.levels.map(l => l.scene || l.theme))], enemies: [...new Set(r.levels.filter(l => l.enemies !== false).map(l => l.enemy))] })));
  expect(info.map(r => r.n)).toEqual([8, 8, 8, 8]);
  expect(info.find(r => r.id === 'pole').scenes).toContain('pole');
  expect(info.find(r => r.id === 'tirol').enemies).toContain('geit');
  expect(info.find(r => r.id === 'norway').enemies).toContain('troll');
  expect(info.find(r => r.id === 'pole').enemies).toContain('pinguin');
  const codes = await page.evaluate(() => REGIONS.flatMap(r => r.levels.map(l => l.code && l.code.answer)));
  expect(new Set(codes).size).toBe(32);
});

test('Dutch: the map and the region names are translated', async ({ page }) => {
  await seed(page, { lang: 'nl' });
  await page.locator('#regionBtn').click();
  await expect(page.locator('#mapWrap h2')).toHaveText('Waar gaan we heen?');
  await expect(page.locator('#mapBox .pin[data-region="norway"] b')).toHaveText('Noorwegen');
  await page.locator('#mapBox .pin[data-region="pole"]').click();
  await expect(page.locator('#levels .t').first()).toHaveText('Landen op de Noordpool');
});

for (const [w, h, what] of [[960, 540, 'tv'], [740, 360, 'phone turned'], [412, 839, 'phone upright']]) {
  test(`the map fits without scrolling (${what})`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: h });
    await seed(page, { lang: 'nl' });
    await page.locator('#regionBtn').click();
    expect(await page.evaluate(() => document.getElementById('mapWrap').scrollHeight <= innerHeight + 1 && document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    for (const id of ['ardennes', 'pole', 'tirol', 'norway']) await expect(page.locator(`#mapBox .pin[data-region="${id}"]`)).toBeInViewport({ ratio: .99 });
    await expect(page.locator('#mapClose')).toBeInViewport({ ratio: .99 });
  });
}
