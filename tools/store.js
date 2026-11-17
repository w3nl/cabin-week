// Maakt de plaatjes voor de winkelvermelding in Google Play (docs/play-store/). Draai: npm run store
// - feature-graphic.png (1024×500): de grote afbeelding bovenaan de vermelding
// - social-preview.png (1280×640): de social preview van de repository op GitHub (Settings → General → Social preview)
// - tv-banner.png (1280×720): de banner voor Android TV (uit android-tv/banner.svg)
// - screenshot-*.png (1920×1080): voor telefoon, tablet en tv
const { chromium } = require('@playwright/test');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..'), out = path.join(root, 'docs', 'play-store');
const port = 4187, base = `http://127.0.0.1:${port}/`;
const KEY = 'cabin-week';

async function open(browser, { width, height, scale = 1, char = 0, lang = 'en' }) {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: scale });
  await page.goto(base + '?lang=' + lang);
  await page.evaluate(([KEY, char]) => localStorage.setItem(KEY, JSON.stringify({ unlocked: 8, char, best: {} })), [KEY, char]);
  await page.reload();
  await page.waitForFunction(() => document.documentElement.classList.contains('ready'));
  await page.evaluate(() => document.fonts.ready);
  return page;
}

/** Begin dag i, sluit het gesprek en loop een stukje naar rechts. */
async function play(page, i, walk) {
  await page.locator('#levels button').nth(i).click();
  await page.locator('#card .btn').first().click();
  await page.waitForSelector('#hud:not([hidden])');
  for (let n = 0; n < 12 && await page.locator('#dialog').isVisible(); n++) { await page.keyboard.press('Space'); await page.waitForTimeout(60); }
  await page.evaluate(() => { window.hurt = () => {}; }); // geen botsingen met vijanden op de foto
  if (walk) { await page.keyboard.down('ArrowRight'); await page.waitForTimeout(walk); await page.keyboard.up('ArrowRight'); }
  await page.waitForTimeout(700);
}

(async () => {
  fs.mkdirSync(out, { recursive: true });
  const server = spawn(process.execPath, [path.join(root, 'tests', 'serve.js')], { env: { ...process.env, PORT: String(port) }, stdio: 'ignore' });
  await new Promise(r => setTimeout(r, 800));
  const browser = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {});
  try {
    // Schermafbeeldingen: 1280×720 op anderhalve scherpte = 1920×1080
    const shots = [
      ['screenshot-1-titel.png', null, 0, 0],
      ['screenshot-2-aankomst.png', 0, 3, 1500],
      ['screenshot-3-verjaardag.png', 3, 0, 1200],
      ['screenshot-4-kerst.png', 4, 8, 1800],
      ['screenshot-5-glijden.png', 5, 6, 900, true],
    ];
    for (const [name, day, char, walk, slide] of shots) {
      const page = await open(browser, { width: 1280, height: 720, scale: 1.5, char });
      if (day !== null) await play(page, day, walk);
      if (slide) {
        // Buikglijden door de sneeuw: op een vlak stuk zonder blokken, bordjes of mensen in de buurt.
        await page.evaluate(() => {
          const far = x => [...L.npcs, ...L.signs].every(o => Math.abs(o.x - x) > 160);
          for (let tx = 8; tx < L.w - 14; tx++) {
            let ok = far(tx * 32);
            for (let k = 0; k < 9 && ok; k++) ok = L.grid[12][tx + k] === '#' && L.grid[11][tx + k] === ' ' && L.grid[10][tx + k] === ' ';
            if (ok) { P.x = tx * 32 + 5; P.y = 12 * 32 - P.h; P.vy = 0; P.onGround = true; P.vx = 4; P.face = 1; cam = Math.max(0, P.x - viewW * .3); L.enemies.length = 0; edges.push('act'); return; }
          }
        });
        await page.waitForTimeout(260);
      }
      else await page.evaluate(() => { document.activeElement.blur(); document.querySelectorAll('*').forEach(el => { el.scrollTop = 0; }); });
      await page.screenshot({ path: path.join(out, name) });
      await page.close();
    }

    // Feature graphic (Google Play, 1024×500) and social preview (GitHub, 1280×640): Christmas Day with the name on top.
    for (const [file, width, height, pad, big, small] of [['feature-graphic.png', 1024, 500, 56, 64, 24], ['social-preview.png', 1280, 640, 72, 92, 32]]) {
      const page = await open(browser, { width, height, char: 3 });
      await play(page, 4, 1400);
      await page.evaluate(([pad, big, small]) => {
        for (const id of ['hud', 'touch', 'dialog']) { const el = document.getElementById(id); if (el) el.style.visibility = 'hidden'; }
        const d = document.createElement('div');
        d.style.cssText = `position:fixed;inset:0;display:flex;flex-direction:column;justify-content:center;padding-left:${pad}px;` +
          'background:linear-gradient(90deg,rgba(11,22,49,.88),rgba(11,22,49,.55) 48%,transparent 75%);color:#fff;font-family:Fredoka,sans-serif;z-index:99';
        d.innerHTML = `<div style="font-size:${big}px;font-weight:700;line-height:1;text-shadow:0 4px 0 rgba(0,0,0,.35)">Cabin<br>Week</div>` +
          `<div style="font-size:${small}px;font-weight:600;margin-top:16px;color:#ffd25e">A level a day in a Christmas week</div>`;
        document.body.appendChild(d);
      }, [pad, big, small]);
      await page.waitForTimeout(300);
      await page.screenshot({ path: path.join(out, file) });
      await page.close();
    }

    // Banner voor Android TV, groot
    const banner = fs.readFileSync(path.join(root, 'android-tv', 'banner.svg'), 'utf8');
    const bp = await browser.newPage({ viewport: { width: 1280, height: 720 } });
    await bp.setContent(`<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fredoka:wght@700&display=swap"><style>html,body{margin:0}svg{display:block;width:1280px;height:720px}</style>${banner}`);
    await bp.waitForTimeout(800);
    await bp.screenshot({ path: path.join(out, 'tv-banner.png') });
    await bp.close();
    console.log('Images are in docs/play-store/');
  } finally {
    await browser.close();
    server.kill();
  }
})();
