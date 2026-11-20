// Renders the TripScouts artwork (tools/art.js) in the running game, so it uses the game's own drawing code.
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const root = path.join(__dirname, '..');

/** Start the local server and open the game in a page with the artwork loaded. Returns { page, close }. */
async function openArt(browser, port = 4189) {
  const server = spawn(process.execPath, [path.join(root, 'tests', 'serve.js')], { env: { ...process.env, PORT: String(port) }, stdio: 'ignore' });
  await new Promise(r => setTimeout(r, 800));
  const page = await browser.newPage({ viewport: { width: 800, height: 450 } });
  await page.goto(`http://127.0.0.1:${port}/`);
  await page.waitForFunction(() => document.documentElement.classList.contains('ready'));
  await page.evaluate(() => document.fonts.load('700 40px Fredoka').then(() => document.fonts.load('600 20px Fredoka')));
  await page.addScriptTag({ content: fs.readFileSync(path.join(__dirname, 'art.js'), 'utf8') });
  return { page, close: async () => { await page.close(); server.kill(); } };
}

/** Draw the artwork at W×H with the given options and save it as a PNG. imgs: { winter, summer } as PNG buffers
    (screenshots of real levels, the same size): they fill the two halves instead of the drawn scenes. */
async function saveArt(page, file, W, H, opts = {}, imgs = {}) {
  const urls = Object.fromEntries(Object.entries(imgs).map(([k, b]) => [k, 'data:image/png;base64,' + b.toString('base64')]));
  const url = await page.evaluate(async ([W, H, opts, urls]) => {
    const load = src => new Promise(r => { const i = new Image(); i.onload = () => r(i); i.src = src; });
    if (urls.winter) opts.winterImg = await load(urls.winter);
    if (urls.summer) opts.summerImg = await load(urls.summer);
    const c = document.createElement('canvas'); c.width = W; c.height = H;
    drawTripScene(c.getContext('2d'), W, H, opts);
    return c.toDataURL('image/png');
  }, [W, H, opts, urls]);
  fs.writeFileSync(file, Buffer.from(url.split(',')[1], 'base64'));
}

/** The layouts: the square icon, and the wide images with the name on the winter side. */
const ICON = {};
const wide = (W, H, sub) => {
  const w = W / (H / 512); // the width in design units (512 high)
  const split = w * .64, x = w * .05;
  // the name fits on the winter side, left of the split line (it is about 4.9 times its size wide)
  const size = Math.min(120, (split - 150 - x) / 4.9);
  return { split, paulX: split, moonX: split - 60, moonY: 70, title: { x, y: 150 + size * .5, size, sub } };
};

module.exports = { openArt, saveArt, ICON, wide };
