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

// With a remote, a controller or the keyboard you move through the creator row by row. "In your hair", "Coat",
// "Bottoms" and "Glasses" come right after a row of colours; "the nearest button" used to jump over them.
for (const [w, h] of [[960, 540], [740, 360], [412, 915]]) test(`arrows reach every row and every option, and Enter chooses (${w}×${h})`, async ({ page }) => {
  await page.setViewportSize({ width: w, height: h });
  await seed(page);
  await page.keyboard.press('ArrowRight'); // the keyboard is in use: focus goes on a button, as with a remote
  await page.locator('#ownHero').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#heroWrap')).toBeVisible();
  await expect(page.locator('#heroDone')).toBeFocused();
  const rows = await page.evaluate(() => HERO_ROWS.map(([k]) => k));
  // the name field: ↑ from Done; OK/Enter without typing does not save but shows the letters; Escape closes them (back on Done)
  await page.keyboard.press('ArrowUp');
  await expect(page.locator('#heroName')).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await expect(page.locator('#heroDone')).toBeFocused();
  await page.keyboard.press('ArrowUp');
  await page.keyboard.press('Enter');
  await expect(page.locator('#heroWrap')).toBeVisible();
  await expect(page.locator('#heroKeys')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('#heroKeys')).toBeHidden();
  await expect(page.locator('#heroDone')).toBeFocused();
  // into the rows: → (past Surprise me and Back) on a wide screen, ↓ on an upright phone (the rows are below the buttons there)
  const rowOf = () => page.evaluate(() => document.activeElement.dataset.key);
  for (let i = 0; i < 4 && !await rowOf(); i++) await page.keyboard.press(w > h ? 'ArrowRight' : 'ArrowDown');
  // go to the top row, then visit every row going down
  for (let i = 0; i < 15 && await rowOf() !== rows[0]; i++) await page.keyboard.press('ArrowUp');
  for (const [i, key] of rows.entries()) {
    if (i) await page.keyboard.press('ArrowDown');
    expect(await rowOf()).toBe(key);
  }
  // change the four rows that used to be skipped: go to the row, pick the last option with → and Enter
  for (const key of ['glasses', 'legs', 'coat', 'extra']) {
    for (let i = 0; i < 15 && await rowOf() !== key; i++) await page.keyboard.press('ArrowUp');
    expect(await rowOf()).toBe(key);
    for (let i = 0; i < 8; i++) await page.keyboard.press('ArrowRight');
    await page.keyboard.press('Enter');
    const last = page.locator(`.hero-row button[data-key="${key}"]`).last();
    await expect(last).toBeFocused();
    await expect(last).toHaveAttribute('aria-pressed', 'true');
  }
  expect(await page.evaluate(() => [heroDraft.extra, heroDraft.coat, heroDraft.legs, heroDraft.glasses])).toEqual(['headband', 'jacket', 'dress', 'thick']);
  // ← from the first option leads back to the buttons (wide screens), ↑ from the top row (upright phone); then save
  const onDone = () => page.evaluate(() => document.activeElement === $('heroDone'));
  for (let i = 0; i < 16 && !await onDone(); i++) await page.keyboard.press(w > h ? 'ArrowLeft' : 'ArrowUp');
  await expect(page.locator('#heroDone')).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#title')).toBeVisible();
  expect(await page.evaluate(KEY => JSON.parse(localStorage.getItem(KEY)).hero.glasses, KEY)).toBe('thick');
});

test('the letters on screen: Enter on the name without typing shows them; a capital first; ⌫, Space; Escape closes them', async ({ page }) => {
  await seed(page);
  await page.locator('#ownHero').click();
  await page.locator('#heroName').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#heroKeys')).toBeVisible();
  await expect(page.locator('#heroWrap')).toBeVisible();
  const key = ch => page.locator('#heroKeys .key', { hasText: new RegExp('^' + ch + '$') }).click();
  for (const ch of ['J', 'O', 'Space', 'B', 'O', 'O']) await key(ch);
  await expect(page.locator('#heroName')).toHaveValue('Jo Boo');
  await page.locator('#heroKeys .key[aria-label="Delete a letter"]').click();
  await expect(page.locator('#heroName')).toHaveValue('Jo Bo');
  // Escape closes the letters, not the creator; the name stays
  await page.keyboard.press('Escape');
  await expect(page.locator('#heroKeys')).toBeHidden();
  await expect(page.locator('#heroRows')).toBeVisible();
  await expect(page.locator('#heroWrap')).toBeVisible();
  await expect(page.locator('#heroName')).toHaveValue('Jo Bo');
  // at most 12 letters
  await page.locator('#heroName').focus(); await page.keyboard.press('Enter');
  for (let i = 0; i < 10; i++) await key('Z');
  await expect(page.locator('#heroName')).toHaveValue('Jo Bozzzzzzz');
  await key('OK');
  await expect(page.locator('#heroKeys')).toBeHidden();
  await expect(page.locator('#heroDone')).toBeFocused();
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
