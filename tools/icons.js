// Maakt de PNG-iconen van de app uit icons/icon.svg (de bron). Draai: npm run icons
const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

(async () => {
  const svg = fs.readFileSync(path.join(__dirname, '..', 'icons', 'icon.svg'), 'utf8');
  const browser = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {});
  for (const [name, size] of [['icon-192.png', 192], ['icon-512.png', 512], ['apple-touch-icon.png', 180]]) {
    const page = await browser.newPage({ viewport: { width: size, height: size } });
    await page.setContent(`<style>html,body{margin:0}svg{display:block;width:${size}px;height:${size}px}</style>${svg}`);
    await page.screenshot({ path: path.join(__dirname, '..', 'icons', name) });
    await page.close();
  }
  // De Google TV-app: launcher-icoon en de banner op het startscherm
  const res = path.join(__dirname, '..', 'android-tv', 'app', 'src', 'main', 'res');
  for (const [dir, size] of [['mipmap-xhdpi', 96], ['mipmap-xxxhdpi', 192]]) {
    const page = await browser.newPage({ viewport: { width: size, height: size } });
    await page.setContent(`<style>html,body{margin:0}svg{display:block;width:${size}px;height:${size}px}</style>${svg}`);
    await page.screenshot({ path: path.join(res, dir, 'ic_launcher.png') });
    await page.close();
  }
  const banner = fs.readFileSync(path.join(__dirname, '..', 'android-tv', 'banner.svg'), 'utf8');
  const page = await browser.newPage({ viewport: { width: 320, height: 180 } });
  await page.setContent(`<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fredoka:wght@700&display=swap"><style>html,body{margin:0}svg{display:block;width:320px;height:180px}</style>${banner}`);
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(res, 'drawable-xhdpi', 'banner.png') });
  await page.close();
  await browser.close();
})();
