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

/* ---------- Taking your progress and hero along (js/transfer.js) ---------- */
const OLD = { unlocked: 5, char: 'me', best: { 0: 3, 1: 2, 2: 1, 3: 4 }, region: 'tirol',
  regions: { tirol: { unlocked: 3, best: { 0: 2, 1: 1 } }, norway: { unlocked: 8, best: { 0: 1, 1: 1, 2: 1, 3: 1, 4: 1, 5: 1, 6: 1, 7: 1 } } },
  hero: { name: 'Zoë', size: 'teen', skin: '#c68a5c', hair: 'curly', hairCol: '#2a1d16', coat: 'long', coatCol: '#8a4ab0', legs: 'skirt', pants: '#7a2236',
    extra: 'bow', extraCol: '#e07aa0', glasses: 'round', beanie: null, scarf: '#e8b44a', voice: 'f' } };

test('voortgang en eigen held gaan met een bewaarcode mee naar een ander apparaat', async ({ page, context }) => {
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  // the old device: progress in several trips and an own hero, with Dutch and the voices on
  await seed(page);
  await page.evaluate(([KEY, OLD]) => { localStorage.setItem(KEY, JSON.stringify(OLD)); localStorage.setItem('cabin-week-voice', '1'); localStorage.setItem('cabin-week-lang', 'nl'); }, [KEY, OLD]);
  await page.goto('/');
  await expect(page.locator('html')).toHaveClass(/ready/);
  await page.locator('#saveBtn').click();
  await expect(page.locator('#saveWrap')).toBeVisible();
  await expect(page.locator('#saveMine')).toContainText('14 dagen gespeeld');
  await expect(page.locator('#saveMine')).toContainText('Zoë');
  const code = await page.locator('#saveCode').inputValue();
  expect(code).toMatch(/^TS1\.[A-Za-z0-9_-]+$/);

  // a new device (an empty browser): paste the code, check what it holds, import
  const fresh = await context.browser().newPage();
  await fresh.goto(new URL('/', page.url()).href);
  await expect(fresh.locator('html')).toHaveClass(/ready/);
  await fresh.locator('#saveBtn').click();
  await fresh.locator('#saveIn').fill('nonsense');
  await expect(fresh.locator('#saveFb')).toContainText("isn't a save code");
  await fresh.locator('#saveIn').fill(code);
  await expect(fresh.locator('#saveFb')).toContainText('14 days played');
  await fresh.locator('#saveImport').click();
  await expect(fresh.locator('html')).toHaveClass(/ready/);
  await expect(fresh.locator('#title')).toBeVisible();
  const got = await fresh.evaluate(KEY => ({ save: JSON.parse(localStorage.getItem(KEY)), lang: localStorage.getItem('cabin-week-lang'), voice: localStorage.getItem('cabin-week-voice') }), KEY);
  expect(got.save).toEqual(OLD);
  expect(got.lang).toBe('nl');
  expect(got.voice).toBe('1');
  await expect(fresh.locator('#chars button.own')).toContainText('Zoë');
  expect(errors).toEqual([]);
  await fresh.close();
});

test('een link met #save= opent het scherm met de code, en vervangt pas iets na Overnemen', async ({ page }) => {
  await seed(page);
  await page.evaluate(([KEY, OLD]) => localStorage.setItem(KEY, JSON.stringify(OLD)), [KEY, OLD]);
  await page.reload();
  await page.locator('#saveBtn').click();
  await page.locator('#saveCopyLink').click();
  const code = await page.locator('#saveCode').inputValue();

  await seed(page);   // a device that has only just started
  await page.goto('/?lang=en#save=' + code);
  await expect(page.locator('#saveWrap')).toBeVisible();
  await expect(page.locator('#saveIn')).toHaveValue(code);
  await expect(page.locator('#saveFb')).toContainText('playing as Zoë');
  expect(await page.evaluate(KEY => JSON.parse(localStorage.getItem(KEY)).unlocked, KEY)).toBe(1);
  expect(page.url()).not.toContain('#save=');
  // Back keeps your own progress
  await page.keyboard.press('Escape');
  await expect(page.locator('#title')).toBeVisible();
  expect(await page.evaluate(KEY => JSON.parse(localStorage.getItem(KEY)).unlocked, KEY)).toBe(1);
});

test('een vreemde bewaarcode wordt nagekeken en kan het spel niet breken', async ({ page }) => {
  await seed(page);
  const odd = { unlocked: 99, char: 42, best: { 0: 3, 9: 5, x: 1, 2: -4 }, region: 'atlantis', regions: { tirol: { unlocked: 'veel', best: null }, mars: { unlocked: 8 } },
    hero: { name: 'Een heel erg lange naam', size: 'giant', hair: 'curly', coatCol: 'red', voice: 'm', evil: '<script>' } };
  const code = await page.evaluate(odd => 'TS1.' + btoa(JSON.stringify({ save: odd })).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''), odd);
  await page.locator('#saveBtn').click();
  await page.locator('#saveIn').fill(code);
  await page.locator('#saveImport').click();
  await expect(page.locator('html')).toHaveClass(/ready/);
  const s = await page.evaluate(KEY => JSON.parse(localStorage.getItem(KEY)), KEY);
  expect(s.unlocked).toBe(8);
  expect(s.char).toBe(0);
  expect(s.best).toEqual({ 0: 3 });
  expect(s.region).toBeUndefined();
  expect(s.regions).toEqual({ tirol: { unlocked: 1, best: {} } });
  expect(s.hero.name).toBe('Een heel erg');
  expect(s.hero.size).toBe('kid');
  expect(s.hero.hair).toBe('curly');
  expect(s.hero.voice).toBe('m');
  expect(s.hero.evil).toBeUndefined();
  await startDay(page, 0);
});

test('het voortgangsscherm werkt met alleen pijltjes en Enter, en past op 960×540 en een telefoon', async ({ page }) => {
  for (const [w, h, lang] of [[960, 540, 'nl'], [740, 360, 'nl'], [412, 839, 'en']]) {
    await page.setViewportSize({ width: w, height: h });
    await seed(page, { lang });
    await page.locator('#saveBtn').focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('#saveWrap')).toBeVisible();
    const fit = await page.evaluate(() => { const r = document.querySelector('#saveWrap .sheet').getBoundingClientRect(); return { right: r.right, w: innerWidth }; });
    expect(fit.right).toBeLessThanOrEqual(fit.w + 1);
    for (const id of ['saveCopyLink', 'saveImport', 'saveClose']) await expect(page.locator('#' + id)).toBeInViewport();
    // the arrows reach Back, and Enter goes back to the title screen
    for (let i = 0; i < 8 && await page.evaluate(() => document.activeElement.id) !== 'saveClose'; i++) await page.keyboard.press(i < 4 ? 'ArrowDown' : 'ArrowRight');
    expect(await page.evaluate(() => document.activeElement.id)).toBe('saveClose');
    await page.keyboard.press('Enter');
    await expect(page.locator('#title')).toBeVisible();
  }
});
