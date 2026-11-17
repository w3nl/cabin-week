const { test, expect } = require('@playwright/test');
const { seed, startDay } = require('./helpers');

// Deze tests laten de spellus zelf rekenen (step() in één keer, zonder tijd), zodat ze niet afhangen van de snelheid van de computer.
async function simulate(page, fn) { return page.evaluate(fn); }

test('lopen en springen met het toetsenbord', async ({ page }) => {
  await seed(page);
  await startDay(page, 0);
  const x0 = await page.evaluate(() => P.x);
  await page.keyboard.down('ArrowRight');
  await page.waitForTimeout(400);
  await page.keyboard.up('ArrowRight');
  expect(await page.evaluate(() => P.x)).toBeGreaterThan(x0 + 30);
  await page.keyboard.down('Space');
  await expect.poll(() => page.evaluate(() => P.vy < 0 || !P.onGround)).toBe(true);
  await page.keyboard.up('Space');
  await expect.poll(() => page.evaluate(() => P.onGround)).toBe(true);
});

test('het poppetje springt hoog en ver genoeg voor de levels (minstens 3 tegels hoog en 4 breed)', async ({ page }) => {
  await seed(page);
  await startDay(page, 0);
  const r = await simulate(page, () => {
    P.x = 2 * TS + 5; P.y = 12 * TS - P.h; P.vx = 0; P.vy = 0; P.onGround = true;
    held.right = true; held.jump = true;
    for (let i = 0; i < 30; i++) step();          // aanloop
    const startX = P.x, feet = P.y + P.h; edges.push('jump');
    let top = feet, landX = null;
    for (let i = 0; i < 120; i++) { step(); top = Math.min(top, P.y + P.h); if (i > 5 && P.onGround) { landX = P.x; break; } }
    held.right = held.jump = false;
    return { up: feet - top, far: landX - startX };
  });
  expect(r.up).toBeGreaterThanOrEqual(3 * 32 + 8);
  expect(r.far).toBeGreaterThanOrEqual(4 * 32);
});

test('op een platform springen en blijven staan', async ({ page }) => {
  await seed(page);
  await startDay(page, 0);
  // Dag 1 heeft een plank op rij 9 van kolom 10 tot en met 13.
  const r = await simulate(page, () => {
    P.x = 8 * TS; P.y = 12 * TS - P.h; P.vx = 0; P.vy = 0; P.onGround = true;
    L.enemies = [];
    held.right = true; held.jump = true; edges.push('jump');
    for (let i = 0; i < 26; i++) step();
    held.right = false;
    for (let i = 0; i < 60; i++) step();
    held.jump = false;
    return { feet: P.y + P.h, onGround: P.onGround };
  });
  expect(r).toEqual({ feet: 9 * 32, onGround: true });
});

test('op een wild zwijn springen haalt het weg; ertegenaan lopen kost een hartje', async ({ page }) => {
  await seed(page);
  await startDay(page, 0);
  const r = await simulate(page, () => {
    const e = L.enemies[0]; e.vx = 0;
    P.x = e.x + 4; P.y = e.y - P.h - 20; P.vx = 0; P.vy = 4; P.inv = 0;
    for (let i = 0; i < 10; i++) step();
    const stomped = e.dead > 0, hearts1 = P.hearts;
    const e2 = L.enemies.find(x => !x.dead); e2.vx = 0;
    P.x = e2.x - 10; P.y = e2.y + e2.h - P.h; P.vy = 0; P.inv = 0;
    step();
    return { stomped, hearts1, hearts2: P.hearts };
  });
  expect(r).toEqual({ stomped: true, hearts1: 3, hearts2: 2 });
});

test('in een kuil vallen kost een hartje en zet je terug bij de laatste vlag', async ({ page }) => {
  await seed(page);
  await startDay(page, 0);
  const r = await simulate(page, () => {
    P.x = 26 * TS; P.y = 12 * TS; P.vy = 0; P.inv = 0;
    for (let i = 0; i < 80; i++) step();
    return { hearts: P.hearts, x: P.x };
  });
  expect(r.hearts).toBe(2);
  expect(r.x).toBeLessThan(5 * 32);
});

test('vloeiend tekenen tussen twee stappen verandert niets aan de echte plek van het poppetje', async ({ page }) => {
  await seed(page);
  await startDay(page, 0);
  const r = await page.evaluate(() => {
    snapshot(); P.x += 4; cam += 2;
    const x = P.x, c = cam;
    renderSmooth(.5);
    return { same: P.x === x && cam === c };
  });
  expect(r.same).toBe(true);
});

test('een tikje telt precies zo lang als hij duurde, ook als het spel hem pas later verwerkt', async ({ page }) => {
  await seed(page);
  await startDay(page, 0);
  const steps = await page.evaluate(() => {
    // 50 ms rechts, maar het spel komt er pas 300 ms later aan toe (een drukke tv)
    holdQ.length = 0; held.right = false;
    queueHold(held, 'right', true, 1000); queueHold(held, 'right', false, 1050);
    let n = 0;
    for (let i = 0; i < 30; i++) { applyHolds(1300 + i * 1000 / 60); if (held.right) n++; }
    return n;
  });
  expect(steps).toBe(3); // 50 ms = 3 stappen van 1/60 s, niet meer
});

test('een heel kort tikje telt toch voor één stap', async ({ page }) => {
  await seed(page);
  await startDay(page, 0);
  const steps = await page.evaluate(() => {
    holdQ.length = 0; held.right = false;
    queueHold(held, 'right', true, 1000); queueHold(held, 'right', false, 1003);
    let n = 0;
    for (let i = 0; i < 10; i++) { applyHolds(1010 + i * 1000 / 60); if (held.right) n++; }
    return n;
  });
  expect(steps).toBe(1);
});

// Zoek een vlak stuk grond zonder iemand of iets in de buurt (anders leest ↓ een bordje voor). Neerzetten en glijden
// gebeurt daarna in één page.evaluate, anders remt het poppetje tussendoor al af (de spellus draait gewoon door).
async function freeSpot(page) {
  return page.evaluate(() => {
    const far = x => [...L.npcs, ...L.signs, ...(L.lantern ? [L.lantern] : []), ...(L.pad ? [L.pad] : [])].every(o => Math.abs(o.x - x) > 120);
    for (let tx = 6; tx < L.w - 10; tx++)
      if (L.grid[12][tx] === '#' && L.grid[12][tx + 1] === '#' && L.grid[12][tx + 2] === '#' && L.grid[11][tx] === ' ' && L.grid[11][tx + 1] === ' ' && far(tx * 32)) return tx;
    return -1;
  });
}
const PLACE = tx => { P.x = tx * 32 + 5; P.y = 12 * 32 - P.h; P.vy = 0; P.onGround = true; P.vx = 4; P.slide = 0; L.enemies.length = 0; state = 'play'; dialog = null; };

test('lopen + ↓: op je buik glijden, in de sneeuw verder dan in het bos', async ({ page }) => {
  await seed(page, { unlocked: 8 });
  const far = {};
  for (const [day, name] of [[0, 'bos'], [4, 'sneeuw']]) {
    await page.evaluate(() => toTitle());
    await startDay(page, day);
    const tx = await freeSpot(page);
    far[name] = await page.evaluate(([spot, place]) => {
      eval(place)(spot); const x0 = P.x;
      edges.push('act'); step();
      const started = P.slide > 0 && Math.abs(P.vx) > 4.4;
      for (let i = 0; i < 120 && P.slide; i++) step();
      return started ? P.x - x0 : -1;
    }, [tx, PLACE.toString()]);
  }
  expect(far.bos).toBeGreaterThan(64);
  expect(far.sneeuw).toBeGreaterThan(far.bos);
});

test('glijdend gaan beesten omver, maar stekels doen nog steeds pijn', async ({ page }) => {
  await seed(page);
  await startDay(page, 0);
  const tx = await freeSpot(page);
  const r = await page.evaluate(([spot, place]) => {
    eval(place)(spot);
    edges.push('act'); step();
    const e = { kind: 'zwijn', x: P.x + 10, y: P.y + P.h - 22, w: 30, h: 22, vx: -1, dead: 0 };
    L.enemies.push(e); step();
    const beest = { dead: e.dead > 0, hearts: P.hearts };
    // nu een stekel onder het poppetje
    const tx = Math.floor((P.x + P.w / 2) / 32), ty = Math.floor((P.y + P.h - 2) / 32);
    L.grid[ty][tx] = '^'; P.y = ty * 32 + 32 - P.h; P.inv = 0;
    step();
    return { ...beest, naStekel: P.hearts };
  }, [tx, PLACE.toString()]);
  expect(r.dead).toBe(true);
  expect(r.hearts).toBe(3);
  expect(r.naStekel).toBe(2);
});

test('rustig optrekken: een tikje zet een klein stapje, vasthouden loopt steeds sneller tot de volle snelheid', async ({ page }) => {
  await seed(page);
  await startDay(page, 0);
  const r = await simulate(page, () => {
    const begin = () => { held.left = held.right = held.jump = false; P.x = 3 * TS + 5; P.y = 12 * TS - P.h; P.vx = 0; P.vy = 0; P.onGround = true; P.run = 0; P.runDir = 0; L.enemies.length = 0; state = 'play'; dialog = null; };
    const walk = (n, dir = 'right') => { held[dir] = true; for (let i = 0; i < n; i++) step(); held[dir] = false; for (let i = 0; i < 40; i++) step(); };
    begin(); let x0 = P.x; walk(1); const tik = P.x - x0;
    begin(); x0 = P.x; walk(6); const kort = P.x - x0;
    begin(); held.right = true; const v = []; for (let i = 0; i < 30; i++) { step(); v.push(P.vx); } held.right = false;
    // omdraaien op volle snelheid: binnen een paar stappen loop je de andere kant op
    held.left = true; let turn = 0; while (P.vx > 0 && turn < 20) { step(); turn++; } held.left = false;
    return { tik, kort, v3: v[2], v10: v[9], v20: v[19], turn };
  });
  expect(r.tik).toBeGreaterThan(0);
  expect(r.tik).toBeLessThan(3);        // één tikje: een paar pixels
  expect(r.kort).toBeLessThan(16);      // een tikje van 0,1 s: minder dan een halve tegel
  expect(r.v3).toBeLessThan(r.v10);     // steeds sneller...
  expect(r.v20).toBeCloseTo(4.4, 1);    // ...tot de volle snelheid, na ongeveer een kwart seconde
  expect(r.turn).toBeLessThanOrEqual(5);
});

test('rennen met Shift (of L1/R1 op een controller): sneller dan lopen, loslaten zakt soepel terug', async ({ page }) => {
  await seed(page);
  await startDay(page, 0);
  const r = await simulate(page, () => {
    held.left = held.right = held.jump = held.run = false;
    P.x = 3 * TS + 5; P.y = 12 * TS - P.h; P.vx = 0; P.vy = 0; P.onGround = true; P.run = 0; P.runDir = 0; L.enemies.length = 0; state = 'play'; dialog = null;
    held.right = true;
    for (let i = 0; i < 30; i++) step();
    const loop = P.vx;
    held.run = true; for (let i = 0; i < 20; i++) step();
    const ren = P.vx;
    held.run = false; step();
    const net = P.vx;
    for (let i = 0; i < 30; i++) step();
    const terug = P.vx;
    held.right = false;
    return { loop, ren, net, terug };
  });
  expect(r.loop).toBeCloseTo(4.4, 1);
  expect(r.ren).toBeGreaterThan(6);
  expect(r.net).toBeGreaterThan(5);        // geen ruk terug...
  expect(r.terug).toBeCloseTo(4.4, 1);     // ...maar soepel naar loopsnelheid
});

test('dubbeltikken en vasthouden is ook rennen (voor afstandsbediening en touchscreen)', async ({ page }) => {
  await seed(page);
  await startDay(page, 0);
  const r = await simulate(page, () => {
    const begin = () => { held.left = held.right = held.jump = held.run = false; P.x = 3 * TS + 5; P.y = 12 * TS - P.h; P.vx = 0; P.vy = 0; P.onGround = true; P.run = 0; P.runDir = 0; P.dash = false; P.lastAx = 0; P.relTime = -99; L.enemies.length = 0; state = 'play'; dialog = null; };
    begin(); held.right = true; for (let i = 0; i < 40; i++) step(); const gewoon = P.vx;
    begin(); held.right = true; for (let i = 0; i < 4; i++) step(); held.right = false; for (let i = 0; i < 6; i++) step();
    held.right = true; for (let i = 0; i < 40; i++) step(); const dubbel = P.vx;
    begin(); held.right = true; for (let i = 0; i < 4; i++) step(); held.right = false; for (let i = 0; i < 40; i++) step();
    held.right = true; for (let i = 0; i < 40; i++) step(); const telaat = P.vx;
    held.right = false;
    return { gewoon, dubbel, telaat };
  });
  expect(r.gewoon).toBeCloseTo(4.4, 1);
  expect(r.dubbel).toBeGreaterThan(6);
  expect(r.telaat).toBeCloseTo(4.4, 1);   // twee losse tikken met een pauze: gewoon lopen
});
