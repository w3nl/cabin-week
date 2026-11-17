const { test, expect } = require('@playwright/test');
const { seed, startDay, put } = require('./helpers');

test('een foute code geeft een grapje, na drie keer een tip, de goede code opent de deur', async ({ page }) => {
  await seed(page);
  await startDay(page, 0);
  const pad = await page.evaluate(() => L.pad);
  await put(page, pad.x + 5, pad.y + 32);
  await page.keyboard.press('e');
  await expect(page.locator('#padTitle')).toHaveText('Key safe of the cabin');
  await page.keyboard.type('1234');
  await expect(page.locator('#padFb')).toContainText('Wrong');
  await expect(page.locator('#digits span').first()).toHaveText('', { timeout: 3000 });
  await page.keyboard.type('1111');
  await page.waitForTimeout(700);
  await page.keyboard.type('2222');
  await expect(page.locator('#padFb')).toContainText('Tip: the code starts with 49');
  await page.waitForTimeout(700);
  // Met de knoppen op het scherm
  for (const d of '4944') await page.locator('#keys button', { hasText: new RegExp(`^${d}$`) }).click();
  await expect(page.locator('#padWrap')).toBeHidden();
  expect(await page.evaluate(() => L.codeOpen)).toBe(true);
  await expect(page.locator('#hCode')).toHaveText('🔓 code');
});

test('elke dag met een codeslot heeft bordjes met de cijfers of een raadsel', async ({ page }) => {
  await seed(page, { unlocked: 8 });
  const r = await page.evaluate(() => LEVELS.map(d => {
    if (!d.code) return null;
    const signs = d.ents.filter(e => e[0] === 'sign').map(e => e[3].join(' '));
    const syms = d.code.riddle.match(/Vier symbolen: (.*)\. /);
    return { answer: d.code.answer, digits: d.code.answer.length, clues: syms ? syms[1].split('  ').filter(s => signs.some(t => t.includes(s + ' = '))).length : 4 };
  }).filter(Boolean));
  for (const c of r) { expect(c.digits).toBe(4); expect(c.clues).toBe(4); }
});
