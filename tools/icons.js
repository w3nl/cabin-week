// Makes the app icons and the Google TV banner from the TripScouts artwork (tools/art.js, drawn with the game's own
// drawing code): winter and summer split on a diagonal, with Paul the scout in the middle. Run: npm run icons
const { chromium } = require('@playwright/test');
const path = require('path');
const { openArt, saveArt, ICON, wide } = require('./art-render');

(async () => {
  const root = path.join(__dirname, '..'), res = path.join(root, 'android-tv', 'app', 'src', 'main', 'res');
  const browser = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {});
  const { page, close } = await openArt(browser);
  try {
    // The web app (and the favicon)
    for (const [name, size] of [['icon-512.png', 512], ['icon-192.png', 192], ['apple-touch-icon.png', 180], ['favicon-32.png', 32]])
      await saveArt(page, path.join(root, 'icons', name), size, size, ICON);
    // The Android app: launcher icons, and the banner on the Google TV home screen
    for (const [dir, size] of [['mipmap-xhdpi', 96], ['mipmap-xxxhdpi', 192]]) await saveArt(page, path.join(res, dir, 'ic_launcher.png'), size, size, ICON);
    await saveArt(page, path.join(res, 'drawable-xhdpi', 'banner.png'), 320, 180, wide(320, 180));
    // The Chrome extension (the toolbar and chrome://extensions)
    for (const size of [16, 32, 48, 128]) await saveArt(page, path.join(root, 'chrome', 'chrome-icons', `icon-${size}.png`), size, size, ICON);
    console.log('Icons made: icons/, chrome/chrome-icons/ and android-tv/app/src/main/res/');
  } finally {
    await close();
    await browser.close();
  }
})();
