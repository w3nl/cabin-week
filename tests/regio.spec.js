// Regions: the map of Europe, choosing a region, and separate progress per region.
const { test, expect } = require('@playwright/test');
const { KEY, seed, startDay, playDay, skip } = require('./helpers');

test('the map shows the regions; choosing one switches the days, and the choice is remembered', async ({ page }) => {
  await seed(page);
  await expect(page.locator('#regionName')).toHaveText('Ardennes');
  await expect(page.locator('#levels .t').first()).toHaveText('Arrival in Pinebrook');
  await page.locator('#regionBtn').click();
  await expect(page.locator('#mapWrap')).toBeVisible();
  await expect(page.locator('#mapBox .pin')).toHaveCount(7);
  await expect(page.locator('#mapBox .pin.here')).toHaveAttribute('data-region', 'ardennes');
  await expect(page.locator('#mapSoon')).toContainText('Iceland');
  await expect(page.locator('#mapSoon')).toContainText('Greece');
  await expect(page.locator('#mapSoon')).toContainText('Iceland');
  await expect(page.locator('#mapSoon')).not.toContainText('Småland'); // Småland is playable now
  await expect(page.locator('#mapBox .soon-dot')).toHaveCount(7);
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
  expect(info.map(r => r.n)).toEqual([8, 8, 8, 8, 8, 8, 8]);
  expect(info.find(r => r.id === 'pole').scenes).toContain('pole');
  expect(info.find(r => r.id === 'tirol').enemies).toContain('geit');
  expect(info.find(r => r.id === 'norway').enemies).toContain('troll');
  expect(info.find(r => r.id === 'pole').enemies).toEqual(expect.arrayContaining(['poolvos', 'lemming']));
  const codes = await page.evaluate(() => REGIONS.flatMap(r => r.levels.map(l => l.code && l.code.answer)));
  expect(new Set(codes).size).toBe(56);
  expect(info.find(r => r.id === 'netherlands').enemies).toEqual(expect.arrayContaining(['gans', 'meeuw', 'zwijn']));
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
    for (const id of ['ardennes', 'pole', 'tirol', 'norway', 'netherlands', 'dalmatia', 'smaland']) await expect(page.locator(`#mapBox .pin[data-region="${id}"]`)).toBeInViewport({ ratio: .99 });
    await expect(page.locator('#mapClose')).toBeInViewport({ ratio: .99 });
  });
}

test('every region plays differently: hills, movers, ice, water and darkness where they belong', async ({ page }) => {
  await seed(page);
  const f = await page.evaluate(() => Object.fromEntries(REGIONS.map(r => [r.id, {
    hills: r.levels.filter(l => l.hills && new Set(l.ground.map(g => g[2])).size > 1).length,
    movers: r.levels.filter(l => l.ents.some(e => e[0] === 'mover')).length,
    ice: r.levels.filter(l => l.ice).length, dark: r.levels.filter(l => l.dark).length,
    water: r.levels.filter(l => l.water).length, interior: r.levels.filter(l => l.interior).length, wind: r.levels.filter(l => l.wind).length }])));
  // the Ardennes stay as they were: flat ground, nothing that moves, no ice or darkness
  expect(f.ardennes).toEqual({ hills: 0, movers: 0, ice: 0, dark: 0, water: 0, interior: 0, wind: 0 });
  expect(f.pole.ice).toBeGreaterThanOrEqual(5); expect(f.pole.movers).toBeGreaterThanOrEqual(2); expect(f.pole.dark).toBe(1); expect(f.pole.interior).toBe(2);
  expect(f.tirol.hills).toBeGreaterThanOrEqual(4); expect(f.tirol.movers).toBeGreaterThanOrEqual(2); expect(f.tirol.interior).toBe(2);
  expect(f.netherlands.wind).toBeGreaterThanOrEqual(3); expect(f.netherlands.ice).toBe(1); expect(f.netherlands.movers).toBe(2); expect(f.netherlands.dark).toBe(1);
  expect(f.norway.movers).toBeGreaterThanOrEqual(2); expect(f.norway.dark).toBe(1); expect(f.norway.water).toBeGreaterThanOrEqual(6);
});

test('a mover carries you across a gap that is too wide to jump', async ({ page }) => {
  await seed(page, { region: 'tirol', unlocked: 8 });
  await startDay(page, 2);
  await page.locator('#card .btn').first().isVisible().then(v => v && page.locator('#card .btn').first().click());
  for (let n = 0; n < 12 && await page.locator('#dialog').isVisible(); n++) { await page.keyboard.press('Space'); await page.waitForTimeout(40); }
  const m = await page.evaluate(() => { window.hurt = () => {}; const m = L.movers[0]; m.x = m.x0; m.dir = 1; m.wait = 30; P.x = m.x + 10; P.y = m.y - P.h; P.vx = P.vy = 0; return { x0: m.x0, x1: m.x1 }; });
  await expect.poll(() => page.evaluate(() => P.x), { timeout: 15000 }).toBeGreaterThan(m.x1 - 20);
  expect(await page.evaluate(() => ({ ground: P.onGround, riding: !!P.mover, hearts: P.hearts }))).toEqual({ ground: true, riding: true, hearts: 3 });
});

test('on ice you keep sliding when you let go', async ({ page }) => {
  const slide = async region => {
    await seed(page, { region, unlocked: 8 });
    await startDay(page, 0);
    for (let n = 0; n < 12 && await page.locator('#dialog').isVisible(); n++) { await page.keyboard.press('Space'); await page.waitForTimeout(40); }
    return page.evaluate(() => { window.hurt = () => {}; L.enemies.length = 0; P.x = 3 * 32; P.y = 12 * 32 - P.h; P.vx = 4.4; P.vy = 0; P.onGround = true;
      const x0 = P.x; held.left = held.right = false; for (let i = 0; i < 30; i++) step(); return P.x - x0; });
  };
  const ardennes = await slide('ardennes'), pole = await slide('pole');
  expect(pole).toBeGreaterThan(ardennes * 2);
});

test('in the dark troll forest you see more for every torch you light', async ({ page }) => {
  await seed(page, { region: 'norway', unlocked: 8 });
  await startDay(page, 5);
  const r = await page.evaluate(() => { const a = darkRadius(); L.switches.forEach(s => s.on = true); return [a, darkRadius()]; });
  expect(r[1]).toBeGreaterThan(r[0] + 100);
});

test('every region mixes its gates and locks, and keeps its own animals', async ({ page }) => {
  await seed(page, { unlocked: 8 });
  const info = await page.evaluate(() => REGIONS.map(r => ({ id: r.id,
    gates: r.levels.map(l => l.task ? l.task.kind : l.quest ? 'quest' : 'none'),
    locks: r.levels.map(l => l.code ? l.code.kind || 'symbols' : 'none'),
    enemies: r.levels.filter(l => l.enemies !== false).map(l => l.enemy),
    garland: r.levels.some(l => (l.deco || []).some(d => d[0] === 'garland') && !l.birthday) })));
  for (const r of info) {
    if (r.id === 'ardennes') { expect(new Set(r.locks)).toEqual(new Set(['symbols'])); continue; }
    const count = (list, k) => list.filter(x => x === k).length;
    // at least six kinds of lock and four kinds of gate, nothing more than twice, at most two "bring something"
    expect(new Set(r.locks).size).toBeGreaterThanOrEqual(6);
    for (const k of new Set(r.locks)) expect(count(r.locks, k)).toBeLessThanOrEqual(2);
    expect(new Set(r.gates).size).toBeGreaterThanOrEqual(4);
    expect(count(r.gates, 'quest')).toBeLessThanOrEqual(2);
    // the robot vacuum and Lego belong to the Ardennes cabin
    expect(r.enemies).not.toContain('robot');
  }
  // penguins live at the South Pole: only one lost penguin, on the first day
  const pole = info.find(r => r.id === 'pole');
  expect(pole.enemies.filter(e => e === 'pinguin')).toHaveLength(1);
  expect(pole.enemies[0]).toBe('pinguin');
});

test('the bell opens the gate for a few seconds; too slow and it closes again', async ({ page }) => {
  await seed(page, { region: 'tirol', unlocked: 8 });
  await startDay(page, 1);
  await skip(page);
  const b = await page.evaluate(() => { window.hurt = () => {}; return L.bell; });
  await page.evaluate(b => { P.x = b.x + 5; P.y = b.y + 32 - P.h; }, b);
  await page.keyboard.press('e');
  await expect.poll(() => page.evaluate(() => L.gateOpen)).toBe(true);
  await expect(page.locator('#hQuest')).toContainText('s');
  await expect.poll(() => page.evaluate(() => L.gateOpen), { timeout: 12000 }).toBe(false);
  expect(await page.evaluate(() => L.questDone)).toBe(false);
});

test('a lost animal follows you back to the gate', async ({ page }) => {
  await seed(page, { region: 'pole', unlocked: 8 });
  await startDay(page, 1);
  await skip(page);
  const a = await page.evaluate(() => { window.hurt = () => {}; return { x: L.animal.x, y: L.animal.y }; });
  await page.evaluate(a => { P.x = a.x + 5; P.y = a.y + 32 - P.h; }, a);
  await page.keyboard.press('e');
  await expect(page.locator('#hQuest')).toContainText('follows you');
  // walk right for a while: the calf comes along
  await page.keyboard.down('ArrowRight'); await page.waitForTimeout(1500); await page.keyboard.up('ArrowRight');
  const d = await page.evaluate(() => Math.abs(L.animal.x - P.x));
  expect(d).toBeLessThan(170); // about half a second behind you
});

test('a melody lock: play the notes with the keys 1 to 5', async ({ page }) => {
  await seed(page, { region: 'dalmatia', unlocked: 8 });
  await startDay(page, 5);
  await skip(page);
  const pad = await page.evaluate(() => { window.hurt = () => {}; return L.pad; });
  await page.evaluate(p => { P.x = p.x + 5; P.y = p.y + 32 - P.h; }, pad);
  await page.keyboard.press('e');
  await expect(page.locator('#padWrap')).toBeVisible();
  await expect(page.locator('#keys button.tok')).toHaveCount(5);
  await page.keyboard.type('3521');
  await expect(page.locator('#padWrap')).toBeHidden();
  expect(await page.evaluate(() => L.codeOpen)).toBe(true);
});

test('the Netherlands: the wind pushes you, sometimes against you and sometimes from behind', async ({ page }) => {
  await seed(page, { region: 'netherlands', unlocked: 8 });
  await startDay(page, 1);
  const w = await page.evaluate(() => { const out = []; for (let t = 0; t < 900; t += 30) { L.time = t; out.push(windNow()); } return { min: Math.min(...out), max: Math.max(...out) }; });
  expect(w.min).toBeLessThan(-.3);
  expect(w.max).toBeGreaterThan(.1);
});

test('Dalmatia is summer: no snow, summer clothes, and in the warm sea you swim instead of falling', async ({ page }) => {
  await seed(page, { region: 'dalmatia', unlocked: 8 });
  const d = await page.evaluate(() => REGIONS.find(r => r.id === 'dalmatia').levels.map(l => ({ theme: l.theme, summer: l.summer, scene: l.scene })));
  expect(d.every(l => l.theme === 'kust' && l.summer)).toBe(true);
  expect(new Set(d.map(l => l.scene))).toEqual(new Set(['adriatic', 'falls', 'oldtown']));
  await startDay(page, 0);
  for (let n = 0; n < 12 && await page.locator('#dialog').isVisible(); n++) { await page.keyboard.press('Space'); await page.waitForTimeout(40); }
  const r = await page.evaluate(() => {
    window.hurt = () => {}; L.enemies.length = 0;
    const col = L.grid[ROWS - 1].findIndex((c, x) => x > 5 && c !== '#');
    P.x = col * 32 + 4; P.y = 8 * 32; P.vy = 0; P.vx = 0;
    for (let i = 0; i < 90; i++) step();
    const swimming = P.swim, hearts = P.hearts;
    edges.push('jump'); step(); const up = P.vy < 0;
    return { swimming, hearts, up };
  });
  expect(r).toEqual({ swimming: true, hearts: 3, up: true });
});

test('a summer region says "summer days" on the title screen', async ({ page }) => {
  await seed(page, { region: 'dalmatia' });
  await expect(page.locator('#cdWord')).toHaveText('summer days to play');
  await seed(page);
  await expect(page.locator('#cdWord')).toHaveText('winter days to play');
});

test('Tirol: the cable car goes up the mountain on a slanted cable, and takes you along', async ({ page }) => {
  await seed(page, { unlocked: 8, region: 'tirol' });
  await startDay(page, 2);
  await skip(page);
  const m0 = await page.evaluate(() => { const m = L.movers[0]; return { y0: m.y0, y1: m.y1 }; });
  expect(m0.y1).toBeLessThan(m0.y0); // the first gondola goes up
  // Stand in the gondola while it waits at the bottom station, and ride along to the top.
  await page.evaluate(() => {
    window.hurt = () => {}; L.enemies.length = 0;
    const m = L.movers[0]; m.x = m.x0; m.y = m.y0; m.dir = 1; m.wait = 30;
    P.x = m.x + m.w / 2 - P.w / 2; P.y = m.y - P.h; P.vx = P.vy = 0;
  });
  await page.waitForFunction(() => L.movers[0].x === L.movers[0].x1, null, { timeout: 15000 });
  const end = await page.evaluate(() => ({ feet: P.y + P.h, top: L.movers[0].y1, on: P.mover === L.movers[0] }));
  expect(end.on).toBe(true);
  expect(Math.abs(end.feet - end.top)).toBeLessThan(2);
});

test('every text balloon is a list of sentences, never one letter at a time', async ({ page }) => {
  for (const lang of ['en', 'nl']) {
    await seed(page, { unlocked: 8, lang });
    const bad = await page.evaluate(() => {
      const out = [], chk = (w, v) => { if (v != null && !(Array.isArray(v) && v.every(x => typeof x === 'string' && x.length > 1))) out.push(w); };
      REGIONS.forEach(r => r.levels.forEach((l, i) => {
        const w = `${r.id} ${i + 1}`;
        chk(w + ' intro', l.intro);
        (l.ents || []).forEach(e => {
          if (e[0] === 'sign') chk(w + ' sign', e[3]);
          if (e[0] === 'npc' && e[3]) { chk(w + ' npc', e[3].lines); for (const t of [e[3].quest, e[3].task]) if (t) ['need', 'done', 'after'].forEach(k => chk(`${w} ${k}`, t[k])); }
        });
      }));
      return out;
    });
    expect(bad).toEqual([]);
  }
});

test('never two checkpoint flags next to each other', async ({ page }) => {
  await seed(page, { unlocked: 8 });
  const close = await page.evaluate(() => REGIONS.flatMap(r => r.levels.map((l, i) => {
    const xs = l.ents.filter(e => e[0] === 'check').map(e => e[1]).sort((a, b) => a - b);
    return xs.some((x, j) => j && x - xs[j - 1] < 10) ? `${r.id} ${i + 1}: ${xs.join(',')}` : null;
  })).filter(Boolean));
  expect(close).toEqual([]);
});
