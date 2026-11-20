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

/* ---------- Taking your progress or your own hero along (js/transfer.js) ---------- */
const HERO = { name: 'Zoë', size: 'teen', skin: '#c68a5c', hair: 'curly', hairCol: '#2a1d16', coat: 'long', coatCol: '#8a4ab0', legs: 'skirt', pants: '#7a2236',
  extra: 'bow', extraCol: '#e07aa0', glasses: 'round', beanie: null, scarf: '#e8b44a', voice: 'f' };
const DAYS = { unlocked: 5, best: { 0: 3, 1: 2, 2: 1, 3: 4 }, region: 'tirol',
  regions: { tirol: { unlocked: 3, best: { 0: 2, 1: 1 } }, norway: { unlocked: 8, best: { 0: 1, 1: 1, 2: 1, 3: 1, 4: 1, 5: 1, 6: 1, 7: 1 } } } };
const OTHER = { name: 'Bram', size: 'adult', skin: '#f6d3b8', hair: 'short', hairCol: '#a87c4c', coat: 'jacket', coatCol: '#2e5a9a', legs: 'trousers', pants: '#2c2f36',
  extra: null, extraCol: '#b67ad9', glasses: null, beanie: '#c43a3a', scarf: null, voice: 'm' };
async function device(page, save) {
  await seed(page);
  await page.evaluate(([KEY, save]) => localStorage.setItem(KEY, JSON.stringify(save)), [KEY, save]);
  await page.reload();
  await expect(page.locator('html')).toHaveClass(/ready/);
}
const stored = page => page.evaluate(KEY => JSON.parse(localStorage.getItem(KEY)), KEY);

test('de dagen gaan met een voortgangscode van de kaart mee, zonder de held', async ({ page, context }) => {
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await device(page, { ...DAYS, char: 'me', hero: HERO });
  await page.locator('#regionBtn').click();
  await page.locator('#mapSave').click();
  await expect(page.locator('#saveWrap')).toBeVisible();
  await expect(page.locator('#saveMine')).toContainText('14 days scouted');
  await expect(page.locator('#saveMine')).toContainText('1 of 10 trips scouted');
  const code = await page.locator('#saveCode').inputValue();
  expect(code).toMatch(/^TS1\.[A-Za-z0-9_-]+$/);
  await page.locator('#saveClose').click();
  await expect(page.locator('#mapWrap')).toBeVisible();   // Back goes back to the map

  // another device, with its own hero and a day of its own: only the days are replaced
  const other = await context.browser().newPage();
  other.on('pageerror', e => errors.push(e.message));
  await device(other, { unlocked: 2, best: { 0: 1 }, char: 'me', hero: OTHER });
  await other.locator('#regionBtn').click();
  await other.locator('#mapSave').click();
  await other.locator('#saveIn').fill('nonsense');
  await expect(other.locator('#saveFb')).toContainText("isn't a TripScouts code");
  await other.locator('#saveIn').fill(code);
  await expect(other.locator('#saveFb')).toContainText('14 days scouted');
  await other.locator('#saveImport').click();
  await expect(other.locator('html')).toHaveClass(/ready/);
  await expect(other.locator('#title')).toBeVisible();
  const s = await stored(other);
  expect({ unlocked: s.unlocked, best: s.best, region: s.region, regions: s.regions }).toEqual(DAYS);
  expect(s.hero).toEqual(OTHER);
  expect(s.char).toBe('me');
  expect(errors).toEqual([]);
  await other.close();
});

test('je eigen held gaat met een heldcode uit het maken van je held mee, zonder de dagen', async ({ page, context }) => {
  await device(page, { ...DAYS, char: 'me', hero: HERO });
  await page.locator('#chars button.own').click();   // chosen: opens the creator
  await expect(page.locator('#heroWrap')).toBeVisible();
  await page.locator('#heroShare').click();
  await expect(page.locator('#saveMine')).toContainText('Hero Zoë, a teen');
  const code = await page.locator('#saveCode').inputValue();
  await page.locator('#saveClose').click();
  await expect(page.locator('#heroWrap')).toBeVisible();   // Back goes back to the creator

  const other = await context.browser().newPage();
  await device(other, { unlocked: 2, best: { 0: 1 }, char: 3 });
  await other.locator('#chars button.own').click();   // no hero yet: opens the creator
  await other.locator('#heroShare').click();
  // a progress code doesn't belong here
  await other.evaluate(() => { saveKind = 'hero'; });
  const progressCode = await other.evaluate(() => exportCode('progress'));
  await other.locator('#saveIn').fill(progressCode);
  await expect(other.locator('#saveFb')).toContainText('That is a progress code');
  await other.locator('#saveIn').fill(code);
  await expect(other.locator('#saveFb')).toContainText('Hero Zoë');
  await other.locator('#saveImport').click();
  await expect(other.locator('#heroWrap')).toBeVisible();   // the creator shows the hero you brought
  await expect(other.locator('#heroName')).toHaveValue('Zoë');
  const s = await stored(other);
  expect(s.hero).toEqual(HERO);
  expect(s.char).toBe('me');
  expect(s.unlocked).toBe(2);
  expect(s.best).toEqual({ 0: 1 });
  await other.locator('#heroCancel').click();
  await expect(other.locator('#chars button.own')).toContainText('Zoë');
  await other.close();
});

test('een link met #save= opent het goede scherm met de code, en vervangt pas iets na Overnemen', async ({ page }) => {
  await device(page, { ...DAYS, char: 'me', hero: HERO });
  const [hero, days] = await page.evaluate(() => [exportCode('hero'), exportCode('progress')]);

  await seed(page);   // a device that has only just started
  await page.goto('/?lang=en#save=' + hero);
  await expect(page.locator('#saveWrap')).toBeVisible();
  await expect(page.locator('#saveTitle')).toHaveText('Take your hero along');
  await expect(page.locator('#saveIn')).toHaveValue(hero);
  await expect(page.locator('#saveFb')).toContainText('Hero Zoë');
  expect(page.url()).not.toContain('#save=');
  expect((await stored(page)).hero).toBeUndefined();
  await page.keyboard.press('Escape');   // Back keeps your own things
  await expect(page.locator('#title')).toBeVisible();
  expect((await stored(page)).hero).toBeUndefined();

  // a new #save= in the same tab (no reload): the progress screen
  await page.evaluate(code => { location.hash = 'save=' + code; }, days);
  await expect(page.locator('#saveTitle')).toHaveText('Take your days along');
  await expect(page.locator('#saveFb')).toContainText('14 days scouted');
  expect((await stored(page)).unlocked).toBe(1);
});

test('een vreemde code wordt nagekeken en kan het spel niet breken', async ({ page }) => {
  await seed(page);
  const enc = data => page.evaluate(d => 'TS1.' + btoa(JSON.stringify(d)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''), data);
  const days = await enc({ kind: 'progress', progress: { unlocked: 99, char: 42, best: { 0: 3, 9: 5, x: 1, 2: -4 }, region: 'atlantis', regions: { tirol: { unlocked: 'veel', best: null }, mars: { unlocked: 8 } } } });
  await page.locator('#regionBtn').click();
  await page.locator('#mapSave').click();
  await page.locator('#saveIn').fill(days);
  await page.locator('#saveImport').click();
  await expect(page.locator('html')).toHaveClass(/ready/);
  let s = await stored(page);
  expect(s.unlocked).toBe(8);
  expect(s.char).toBe(0);
  expect(s.best).toEqual({ 0: 3 });
  expect(s.region).toBeUndefined();
  expect(s.regions).toEqual({});

  const hero = await enc({ kind: 'hero', hero: { name: 'Een heel erg lange naam', size: 'giant', hair: 'curly', coatCol: 'red', voice: 'm', evil: '<script>' } });
  await page.locator('#chars button.own').click();
  await page.locator('#heroShare').click();
  await page.locator('#saveIn').fill(hero);
  await page.locator('#saveImport').click();
  s = await stored(page);
  expect(s.hero.name).toBe('Een heel erg');
  expect(s.hero.size).toBe('kid');
  expect(s.hero.hair).toBe('curly');
  expect(s.hero.voice).toBe('m');
  expect(s.hero.evil).toBeUndefined();
  await page.locator('#heroDone').click();
  await startDay(page, 0);
});

test('het code-scherm werkt met alleen pijltjes en Enter, en past op 960×540 en een telefoon', async ({ page }) => {
  for (const [w, h, lang] of [[960, 540, 'nl'], [740, 360, 'nl'], [412, 839, 'en']]) {
    await page.setViewportSize({ width: w, height: h });
    await seed(page, { lang });
    await page.locator('#regionBtn').click();
    await page.locator('#mapSave').focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('#saveWrap')).toBeVisible();
    const fit = await page.evaluate(() => { const r = document.querySelector('#saveWrap .sheet').getBoundingClientRect(); return { right: r.right, w: innerWidth }; });
    expect(fit.right).toBeLessThanOrEqual(fit.w + 1);
    for (const id of ['saveCopyLink', 'saveImport', 'saveClose']) await expect(page.locator('#' + id)).toBeInViewport();
    // the arrows reach Back, and Enter goes back to the map
    for (let i = 0; i < 8 && await page.evaluate(() => document.activeElement.id) !== 'saveClose'; i++) await page.keyboard.press(i < 4 ? 'ArrowDown' : 'ArrowRight');
    expect(await page.evaluate(() => document.activeElement.id)).toBe('saveClose');
    await page.keyboard.press('Enter');
    await expect(page.locator('#mapWrap')).toBeVisible();
    for (const id of ['mapSave', 'mapClose']) await expect(page.locator('#' + id)).toBeInViewport();
  }
});
