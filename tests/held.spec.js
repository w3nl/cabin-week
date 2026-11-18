// Your own hero: the creator, saving it, and playing with it.
const { test, expect } = require('@playwright/test');
const { KEY, seed, startDay } = require('./helpers');

test('create your own hero: name, looks, saved, and you play with it', async ({ page }) => {
  await seed(page);
  await expect(page.locator('#chars button')).toHaveCount(10);
  await page.locator('#ownHero').click();
  await expect(page.locator('#heroWrap')).toBeVisible();
  await page.locator('#heroName').fill('Noor');
  await page.locator('.hero-row button[data-key="size"]', { hasText: 'Adult' }).click();
  await page.locator('.hero-row button[data-key="hair"]', { hasText: 'Curly' }).click();
  await page.locator('.hero-row button[data-key="glasses"]', { hasText: 'Round' }).click();
  await page.locator('.hero-row button[data-key="skin"]').nth(5).click();
  await expect(page.locator('.hero-row button[data-key="hair"]', { hasText: 'Curly' })).toHaveAttribute('aria-pressed', 'true');
  await page.locator('#heroDone').click();
  await expect(page.locator('#title')).toBeVisible();
  await expect(page.locator('#ownHero')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#ownHero .nm')).toHaveText('Noor');
  const s = await page.evaluate(KEY => JSON.parse(localStorage.getItem(KEY)), KEY);
  expect(s.char).toBe('me');
  expect(s.hero).toMatchObject({ name: 'Noor', size: 'adult', hair: 'curly', glasses: 'round', skin: '#6e4428' });
  await page.reload();
  await expect(page.locator('#ownHero .nm')).toHaveText('Noor');
  await startDay(page, 0);
  const me = await page.evaluate(() => ({ name: heroChar().name, h: P.h, own: heroChar().own }));
  expect(me).toEqual({ name: 'Noor', h: 40, own: true });
});

test('press your hero again to change it; Back keeps the old hero; you can switch back to Paul', async ({ page }) => {
  await seed(page);
  await page.evaluate(KEY => { const s = JSON.parse(localStorage.getItem(KEY)); s.hero = { name: 'Sam', hair: 'bob' }; s.char = 'me'; localStorage.setItem(KEY, JSON.stringify(s)); }, KEY);
  await page.reload();
  await expect(page.locator('#ownHero .fm')).toContainText('change');
  await page.locator('#ownHero').click();
  await expect(page.locator('#heroName')).toHaveValue('Sam');
  await page.locator('#heroName').fill('Kim');
  await page.locator('#heroCancel').click();
  await expect(page.locator('#ownHero .nm')).toHaveText('Sam');
  await page.locator('#chars button', { hasText: 'Paul' }).click();
  await expect(page.locator('#ownHero')).toHaveAttribute('aria-pressed', 'false');
  expect(await page.evaluate(() => heroChar().name)).toBe('Paul');
  await page.locator('#ownHero').click();
  await expect(page.locator('#ownHero')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#title')).toBeVisible();
});

test('typing a name does not move the menu or start the game; Enter saves, and an empty name becomes "Me"', async ({ page }) => {
  await seed(page);
  await page.locator('#ownHero').click();
  await page.locator('#heroName').focus();
  await page.keyboard.type('Jo');
  await page.keyboard.press('ArrowLeft');
  await page.keyboard.type('a');
  await expect(page.locator('#heroName')).toBeFocused();
  await expect(page.locator('#heroName')).toHaveValue('Jao');
  await page.locator('#heroName').fill('');
  await page.keyboard.press('Enter');
  await expect(page.locator('#title')).toBeVisible();
  await expect(page.locator('#ownHero .nm')).toHaveText('Me');
});

test('Surprise me picks new looks; Escape goes back', async ({ page }) => {
  await seed(page);
  await page.locator('#ownHero').click();
  const before = await page.evaluate(() => JSON.stringify(heroDraft));
  let changed = false;
  for (let i = 0; i < 5 && !changed; i++) { await page.locator('#heroRandom').click(); changed = await page.evaluate(b => JSON.stringify(heroDraft) !== b, before); }
  expect(changed).toBe(true);
  await page.locator('#heroRandom').focus();
  await page.keyboard.press('Escape');
  await expect(page.locator('#title')).toBeVisible();
  expect(await page.evaluate(KEY => JSON.parse(localStorage.getItem(KEY)).hero, KEY)).toBeUndefined();
});

test('Dutch: the creator is translated', async ({ page }) => {
  await seed(page, { lang: 'nl' });
  await expect(page.locator('#ownHero .nm')).toHaveText('Jouw held');
  await page.locator('#ownHero').click();
  await expect(page.locator('#heroDone')).toHaveText('Klaar');
  await expect(page.locator('.hero-row .hl').first()).toHaveText('Lengte');
  await expect(page.locator('#heroName')).toHaveAttribute('placeholder', 'Ik');
});

for (const [w, h, what] of [[960, 540, 'tv'], [740, 360, 'phone turned'], [412, 839, 'phone upright']]) {
  test(`the creator fits without scrolling (${what})`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: h });
    await seed(page, { lang: 'nl' });
    await page.locator('#ownHero').click();
    expect(await page.evaluate(() => document.getElementById('heroWrap').scrollHeight <= innerHeight + 1 && document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await expect(page.locator('#heroDone')).toBeInViewport({ ratio: .99 });
    await expect(page.locator('.hero-row').last()).toBeInViewport({ ratio: .99 });
  });
}

test('more choices: a skirt or dress, shorts, a bun, bow or hairband, and really no scarf', async ({ page }) => {
  await seed(page);
  await page.locator('#ownHero').click();
  const pick = (key, text) => page.locator(`.hero-row button[data-key="${key}"]`, { hasText: text }).click();
  await pick('legs', 'Dress');
  await pick('extra', 'Bun');
  await page.locator('.hero-row button[data-key="scarf"]').first().click(); // ✕: no scarf
  await page.locator('#heroDone').click();
  let c = await page.evaluate(() => heroChar());
  expect(c).toMatchObject({ bun: '#b67ad9', bareSummer: true, noScarf: true });
  expect(c.dress).toBeTruthy();
  expect(c.scarf).toBeUndefined();
  await page.locator('#ownHero').click();
  await pick('legs', 'Shorts');
  await pick('extra', 'Bow');
  await page.locator('#heroDone').click();
  c = await page.evaluate(() => heroChar());
  expect(c).toMatchObject({ shorts: true, bow: '#b67ad9' });
  expect(c.dress).toBeUndefined();
  expect(c.bun).toBeUndefined();
});
