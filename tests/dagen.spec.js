const { test, expect } = require('@playwright/test');
const { seed, startDay, playDay } = require('./helpers');

const DAYS = ['Day 1 · Monday', 'Day 2 · Tuesday', 'Day 3 · Wednesday', 'Day 4 · Thursday', 'Day 5 · Friday', 'Day 6 · Saturday', 'Day 7 · Sunday', 'Day 8 · Monday'];

test('er is voor elke dag van de week een level, op volgorde', async ({ page }) => {
  await seed(page, { unlocked: 8 });
  const labels = await page.locator('#levels .n').allTextContents();
  expect(labels.map(l => l.split(' · ').slice(0, 2).join(' · '))).toEqual(DAYS);
});

for (const region of ['ardennes', 'pole', 'tirol', 'norway', 'netherlands']) DAYS.forEach((day, i) => {
  test(`${region}, ${day}: alles is bereikbaar en de dag is uit te spelen`, async ({ page }) => {
    await seed(page, { unlocked: 8, region });
    await startDay(page, i);
    await expect(page.locator('#hLvl')).toContainText(day);
    // Elke sleutel, het opdrachtvoorwerp en de uitgang zijn te bereiken met de sprongen die het poppetje echt kan maken.
    const bad = await page.evaluate(() => {
      const solid = (x, y, open) => { if (x < 0 || x >= L.w) return true; if (y < 0 || y >= ROWS) return false; const c = L.grid[y][x]; return c === '#' || c === 'S' || (!open && (c === 'G' || c === 'H')); };
      // A mover (ice floe, gondola, boat) carries you across a gap: you can stand anywhere along its track.
      const ride = new Set();
      for (const m of L.movers) for (let px = m.x0; px <= m.x1 + m.w - TS; px += TS / 2) ride.add(Math.floor(px / TS) + ',' + (m.y / TS - 1));
      const stand = (x, y, open) => y >= 1 && y < ROWS - 1 && !solid(x, y, open) && !solid(x, y - 1, open) && (solid(x, y + 1, open) || L.grid[y + 1][x] === '=' || ride.has(x + ',' + y)) && L.grid[y][x] !== '^';
      const wall = (a, b) => { const s = Math.sign(b - a); for (let x = a + s; x !== b + s && a !== b; x += s) if ('GH'.includes(L.grid[2][x])) return true; return false; };
      const reach = open => {
        const seen = new Set(['2,11']), q = [[2, 11]];
        while (q.length) {
          const [x, y] = q.pop();
          for (let dx = -4; dx <= 4; dx++) for (let y2 = Math.max(1, y - 3); y2 < ROWS - 1; y2++) {
            const x2 = x + dx, k = x2 + ',' + y2;
            if (!stand(x2, y2, open) || seen.has(k) || (!open && wall(x, x2))) continue;
            seen.add(k); q.push([x2, y2]);
          }
        }
        return [...seen].map(k => k.split(',').map(Number));
      };
      const can = (set, x, y) => set.some(([sx, sy]) => Math.abs(sx - x) <= 1 && sy >= y && sy - y <= 3);
      const closed = reach(false), all = reach(true), out = [];
      L.items.filter(i => i.type === 'key' || i.type === 'quest').forEach(i => { if (!can(i.type === 'quest' ? closed : all, i.x / TS, i.y / TS)) out.push(`${i.type} op ${i.x / TS},${i.y / TS}`); });
      if (L.npcs.some(n => n.quest) && !can(closed, L.npcs.find(n => n.quest).x / TS, L.npcs.find(n => n.quest).y / TS)) out.push('opdrachtgever');
      if (!can(all, L.exit.x / TS, L.exit.y / TS + 1)) out.push('uitgang');
      return out;
    });
    expect(bad).toEqual([]);
    await playDay(page);
    await expect(page.locator('#card')).toContainText(i === DAYS.length - 1 ? 'All 8 days done' : DAYS[i + 1].split(' · ')[1]);
  });
});

test('day 3: a quiet day at the Christmas market in Luxembourg, without enemies or obstacles, with a candle in the church', async ({ page }) => {
  await seed(page, { unlocked: 8 });
  await startDay(page, 2);
  await expect(page.locator('#hLvl')).toContainText('Christmas Market in Luxembourg');
  const lv = await page.evaluate(() => ({ theme: L.d.theme, enemies: L.enemies.length, spikes: L.grid.flat().filter(c => c === '^').length, pits: L.grid[ROWS - 1].filter(c => c !== '#').length, lantern: !!L.lantern, church: L.d.deco.some(d => d[0] === 'church') }));
  expect(lv).toEqual({ theme: 'stad', enemies: 0, spikes: 0, pits: 0, lantern: true, church: true });
  // The candle is subtle: just "You light a candle.", without a name (titel.spec.js checks the names for the whole game).
  const spot = await page.evaluate(() => L.lantern);
  await page.evaluate(l => { P.x = l.x + 5; P.y = l.y + 32 - P.h; }, spot);
  await page.keyboard.press('e');
  await expect(page.locator('#dialog')).toHaveClass(/calm/);
  await expect(page.locator('#dName')).toHaveText('In the church');
  await page.keyboard.press('Space');
  await expect(page.locator('#dText')).toHaveText('You light a candle. 🕯️');
  await page.keyboard.press('Space');
  await expect(page.locator('#dialog')).toBeHidden();
  expect(await page.evaluate(() => L.lantern.lit)).toBe(true);
  await playDay(page);
  await expect(page.locator('#card')).toContainText("Tomorrow is Paul's birthday");
  await expect(page.locator('#card')).not.toContainText('🎉');
  expect(await page.evaluate(() => confettiBits.length)).toBe(0);
});
