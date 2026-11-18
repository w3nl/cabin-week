// Hulpjes om het spel te spelen in de tests.
const { expect } = require('@playwright/test');

const KEY = 'cabin-week';

/** Start with a clean browser, optionally with unlocked days, a chosen character, a language (en by default) and a region. */
async function seed(page, { unlocked = 1, char = 0, lang = 'en', region = 'ardennes' } = {}) {
  await page.goto('/?lang=' + lang);
  await page.evaluate(([KEY, unlocked, char, lang, region]) => {
    localStorage.clear();
    localStorage.setItem('cabin-week-lang', lang);
    const save = { unlocked, char, best: {} };
    if (region !== 'ardennes') Object.assign(save, { unlocked: 1, region, regions: { [region]: { unlocked, best: {} } } });
    localStorage.setItem(KEY, JSON.stringify(save));
  }, [KEY, unlocked, char, lang, region]);
  await page.reload();
  await expect(page.locator('html')).toHaveClass(/ready/);
}

/** Kies een dag op het titelscherm en begin (de knop op het introscherm). */
async function startDay(page, i) {
  await page.locator('#levels button').nth(i).click();
  await expect(page.locator('#cardWrap')).toBeVisible();
  await page.locator('#card .btn').first().click();
  await expect(page.locator('#hud')).toBeVisible();
}

/** Zet het poppetje (zonder te botsen) op een plek: x en y in pixels, voeten op y. */
async function put(page, x, feetY) {
  await page.evaluate(([x, feetY]) => { P.x = x; P.y = feetY - P.h; P.vx = 0; P.vy = 0; }, [x, feetY]);
  await page.waitForTimeout(60);
}

/** Klik door het gesprek tot het dicht is. */
async function skip(page, max = 12) {
  for (let i = 0; i < max && await page.locator('#dialog').isVisible(); i++) { await page.keyboard.press('Space'); await page.waitForTimeout(40); }
  await expect(page.locator('#dialog')).toBeHidden();
}

/** Speel de dag die nu open is uit: pak alles op, doe de opdracht, kraak de code, loop naar de uitgang. */
async function playDay(page) {
  const info = await page.evaluate(() => ({
    items: L.items.filter(i => i.type === 'key' || i.type === 'quest').map(i => ({ type: i.type, x: i.x, y: i.y })),
    npc: L.npcs.find(n => n.quest || n.task) ? { x: L.npcs.find(n => n.quest || n.task).x, y: L.npcs.find(n => n.quest || n.task).y } : null,
    task: L.d.task ? L.d.task.kind : L.d.quest ? 'quest' : null,
    switches: L.switches.map(s => ({ x: s.x, y: s.y })), bell: L.bell, animal: L.animal && { x: L.animal.x, y: L.animal.y }, gate: L.d.gate,
    pad: L.pad, code: L.d.code && [...L.d.code.answer], exit: L.exit, need: L.need
  }));
  for (const it of info.items) {
    await put(page, it.x + 5, it.y + 34);
    if (it.type === 'key') await expect.poll(() => page.evaluate(([x, y]) => L.items.find(i => i.x === x && i.y === y).taken, [it.x, it.y])).toBe(true);
  }
  await expect.poll(() => page.evaluate(() => L.keys)).toBe(info.need);
  // The gate halfway, whatever kind it is.
  const talk = async () => { await put(page, info.npc.x, info.npc.y + 32); await page.keyboard.press('e'); await expect(page.locator('#dialog')).toBeVisible(); await skip(page); };
  if (info.task === 'quest') {
    expect(await page.evaluate(() => L.hasQuest)).toBe(true);
    await talk();
  } else if (info.task === 'levers' || info.task === 'lights') {
    for (const s of info.switches) { await put(page, s.x + 5, s.y + 32); await page.keyboard.press('e'); await page.waitForTimeout(80); await skip(page); }
  } else if (info.task === 'timer') {
    await put(page, info.bell.x + 5, info.bell.y + 32); await page.keyboard.press('e');
    await expect.poll(() => page.evaluate(() => L.gateOpen)).toBe(true);
    await put(page, (info.gate[0] + 2) * 32 + 5, info.gate[2] * 32 + 32);
    await expect.poll(() => page.evaluate(() => L.questDone)).toBe(true);
  } else if (info.task === 'follow') {
    await put(page, info.animal.x + 5, info.animal.y + 32); await page.keyboard.press('e');
    await expect.poll(() => page.evaluate(() => L.animal.follow)).toBe(true);
    await put(page, info.npc.x - 20, info.npc.y + 32);
    await page.waitForTimeout(700);
    await talk();
  }
  if (info.task) await expect.poll(() => page.evaluate(() => L.gateOpen && L.questDone)).toBe(true);
  if (info.pad) {
    await put(page, info.pad.x + 5, info.pad.y + 32);
    await page.keyboard.press('e');
    await expect(page.locator('#padWrap')).toBeVisible();
    for (const k of info.code) await page.evaluate(k => padPress(k), k);
    await expect(page.locator('#padWrap')).toBeHidden();
    expect(await page.evaluate(() => L.codeOpen)).toBe(true);
  }
  await put(page, info.exit.x + 5, info.exit.y + info.exit.h);
  await expect(page.locator('#cardWrap')).toBeVisible();
}

module.exports = { KEY, seed, startDay, put, skip, playDay };
