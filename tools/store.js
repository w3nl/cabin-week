// Maakt de plaatjes voor de winkelvermelding in Google Play (docs/play-store/). Draai: npm run store
// - feature-graphic.png (1024×500): de grote afbeelding bovenaan de vermelding (de TripScouts-tekening uit tools/art.js)
// - social-preview.png (1280×640): de social preview van de repository op GitHub (Settings → General → Social preview)
// - tv-banner.png (1280×720): de banner voor Android TV (de TripScouts-tekening uit tools/art.js)
// - snap-featured-banner.png (720×240): the featured banner for the Snap Store
// - screenshot-*.png (1920×1080): for phone, tablet and TV (Google Play takes up to 8): the title, the map, six regions and your own hero
// The Chrome Web Store (docs/chrome-store/): store-icon.png (128×128: 96×96 artwork with transparent padding) and five
// screenshot-*.jpg (1280×800, no alpha). Only these: npm run store:chrome
const chromeOnly = process.argv[2] === 'chrome';
const { chromium } = require('@playwright/test');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const { openArt, saveArt, wide } = require('./art-render');

const root = path.join(__dirname, '..'), out = path.join(root, 'docs', 'play-store'), chromeOut = path.join(root, 'docs', 'chrome-store');
const port = 4187, base = `http://127.0.0.1:${port}/`;
const KEY = 'cabin-week';

// Your own hero in the screenshots (a made-up kid with red curls).
const HERO = { name: 'Robin', size: 'kid', skin: '#c68a5c', hair: 'curly', hairCol: '#b5512a', coat: 'puffer', coatCol: '#e8a33a',
  pants: '#2f4870', glasses: 'round', beanie: '#2e5a9a', scarf: '#59c28a' };

async function open(browser, { width, height, scale = 1, char = 0, lang = 'en', region = 'ardennes' }) {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: scale });
  await page.goto(base + '?lang=' + lang);
  await page.evaluate(([KEY, char, region, HERO]) => {
    // Every region unlocked, a few days played here and there, so the map shows progress.
    const regions = { pole: { unlocked: 8, best: { 0: 3, 1: 3 } }, tirol: { unlocked: 8, best: { 0: 3 } }, norway: { unlocked: 8, best: { 0: 3, 1: 3, 2: 3 } },
      scotland: { unlocked: 8, best: { 0: 3, 1: 3 } },
      netherlands: { unlocked: 8, best: {} }, dalmatia: { unlocked: 8, best: { 0: 3 } } };
    localStorage.setItem(KEY, JSON.stringify({ unlocked: 8, char, best: { 0: 3, 1: 3, 2: 3, 3: 3 }, region, regions, hero: HERO }));
  }, [KEY, char, region, HERO]);
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

/** The store icon for the Chrome Web Store (128×128): as Google asks, the artwork is 96×96 in the middle, with rounded
    corners, and 16 px of transparent space around it. */
async function chromeStoreIcon(page, file) {
  const url = await page.evaluate(() => {
    const art = document.createElement('canvas'); art.width = art.height = 96;
    drawTripScene(art.getContext('2d'), 96, 96, {});
    const c = document.createElement('canvas'); c.width = c.height = 128;
    const x = c.getContext('2d');
    x.beginPath(); x.roundRect(16, 16, 96, 96, 18); x.clip();
    x.drawImage(art, 16, 16);
    return c.toDataURL('image/png');
  });
  fs.writeFileSync(file, Buffer.from(url.split(',')[1], 'base64'));
}

(async () => {
  fs.mkdirSync(out, { recursive: true });
  fs.mkdirSync(chromeOut, { recursive: true });
  const server = spawn(process.execPath, [path.join(root, 'tests', 'serve.js')], { env: { ...process.env, PORT: String(port) }, stdio: 'ignore' });
  await new Promise(r => setTimeout(r, 800));
  const browser = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {});
  try {
    // Screenshots: [file, region, day (null = a menu), character, walk ms, extra]
    const shots = [
      ['screenshot-1-title.png', 'norway', null, 'me', 0],
      ['screenshot-2-map.png', 'ardennes', null, 0, 0, 'map'],
      ['screenshot-3-dalmatia.png', 'dalmatia', 0, 3, 0, 'swim'],
      ['screenshot-4-tirol.png', 'tirol', 2, 6, 0, 'mover'],
      ['screenshot-5-netherlands.png', 'netherlands', 1, 2, 1600],
      ['screenshot-6-north-pole.png', 'pole', 0, 5, 0, 'mover'],
      ['screenshot-7-christmas.png', 'ardennes', 4, 8, 900, 'slide'],
      ['screenshot-8-hero.png', 'ardennes', null, 'me', 0, 'hero'],
    ];
    // Google Play: 1280×720 at 1.5× = 1920×1080, all eight. The Chrome Web Store: 1280×800, at most five, and no alpha,
    // so JPEG.
    const CHROME_SHOTS = ['screenshot-1-title.png', 'screenshot-2-map.png', 'screenshot-3-dalmatia.png', 'screenshot-4-tirol.png', 'screenshot-7-christmas.png'];
    const sets = [
      ...(chromeOnly ? [] : [{ dir: out, width: 1280, height: 720, scale: 1.5, list: shots }]),
      { dir: chromeOut, width: 1280, height: 800, scale: 1, list: shots.filter(s => CHROME_SHOTS.includes(s[0])), jpeg: true },
    ];
    for (const set of sets) for (const [file, region, day, char, walk, extra] of set.list) {
      const name = set.jpeg ? file.replace(/\.png$/, '.jpg') : file;
      const page = await open(browser, { width: set.width, height: set.height, scale: set.scale, char, region });
      if (day !== null) await play(page, day, walk);
      if (extra === 'map') {
        await page.locator('#regionBtn').click();
        await page.waitForSelector('#mapWrap:not([hidden])');
        await page.locator('#mapBox .pin[data-region="tirol"]').hover();
        await page.waitForTimeout(300);
      }
      if (extra === 'hero') {
        await page.locator('#ownHero').click(); // already chosen, so this opens the creator
        await page.waitForSelector('#heroWrap:not([hidden])');
        await page.mouse.move(0, 0);
        await page.waitForTimeout(900);
      }
      if (extra === 'mover') {
        // Ride the gondola or ice floe across the gap.
        await page.evaluate(() => {
          const m = L.movers[0]; L.enemies.length = 0;
          P.x = m.x + m.w / 2 - P.w / 2; P.y = m.y - P.h; P.vx = 0; P.vy = 0; P.face = 1;
        });
        await page.waitForTimeout(1500);
      }
      if (extra === 'swim') {
        // Swimming in the sea: the middle of the first gap with water.
        await page.evaluate(() => {
          for (let tx = 6; tx < L.w - 6; tx++) if (L.grid[12][tx] !== '#') {
            let n = 0; while (L.grid[12][tx + n] !== '#') n++;
            P.x = tx * 32 + n * 16 - P.w / 2; P.y = SWIM_Y - P.h; P.vx = 0; P.vy = 0; P.face = 1; return;
          }
        });
        await page.waitForTimeout(1400);
      }
      if (extra === 'slide') {
        // Belly-sliding through the snow: on flat ground without blocks, signs or people nearby.
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
      else if (day === null && !extra) await page.evaluate(() => { document.activeElement.blur(); document.querySelectorAll('*').forEach(el => { el.scrollTop = 0; }); });
      await page.screenshot(set.jpeg ? { path: path.join(set.dir, name), type: 'jpeg', quality: 92 } : { path: path.join(set.dir, name) });
      await page.close();
    }

    // The big images: the TripScouts artwork (tools/art.js) with the name, like the app icon. The feature graphic, the
    // social preview and the marquee show real levels: Christmas Day in the snow (Lily) and the warm sea of Dalmatia
    // (Max), split on the diagonal, with Paul and the name on top.
    const shot = async (width, height, region, day, char, walk) => {
      const page = await open(browser, { width, height, char, region });
      await play(page, day, walk);
      await page.evaluate(() => { for (const id of ['hud', 'touch', 'dialog', 'rotateHint']) { const el = document.getElementById(id); if (el) el.style.visibility = 'hidden'; } });
      await page.waitForTimeout(300);
      const b = await page.screenshot(); await page.close(); return b;
    };
    const levelShots = async (width, height) => ({ winter: await shot(width, height, 'ardennes', 4, 3, 1400), summer: await shot(width, height, 'dalmatia', 0, 8, 2200) });
    const art = await openArt(browser, port + 1);
    const sub = 'Ten trips to scout, all across Europe';
    // The Chrome Web Store: the store icon, the small promo tile (440×280) and the marquee (1400×560), JPEG for no alpha
    await chromeStoreIcon(art.page, path.join(chromeOut, 'store-icon.png'));
    await saveArt(art.page, path.join(chromeOut, 'small-promo-tile.jpg'), 440, 280, wide(440, 280));
    await saveArt(art.page, path.join(chromeOut, 'marquee-promo-tile.jpg'), 1400, 560, { ...wide(1400, 560, sub), paulS: 4.8 }, await levelShots(1400, 560));
    if (chromeOnly) { await art.close(); console.log('Images are in docs/chrome-store/'); return; }
    // Google Play: the feature graphic (1024×500) and the Android TV banner (1280×720); GitHub: the social preview
    // (1280×640); the Snap Store: the featured banner (720×240)
    for (const [file, width, height] of [['feature-graphic.png', 1024, 500], ['social-preview.png', 1280, 640]])
      await saveArt(art.page, path.join(out, file), width, height, { ...wide(width, height, sub), paulS: 4.8 }, await levelShots(width, height));
    await saveArt(art.page, path.join(out, 'tv-banner.png'), 1280, 720, wide(1280, 720));
    await saveArt(art.page, path.join(out, 'snap-featured-banner.png'), 720, 240, wide(720, 240, sub));
    await art.close();
    console.log('Images are in docs/play-store/ and docs/chrome-store/');
  } finally {
    await browser.close();
    server.kill();
  }
})();
