// Maakt één los HTML-bestand van het spel (alle CSS en JS erin), bijvoorbeeld om als Claude-artifact te delen.
// Zonder manifest en service worker: dat deel hoort bij de echte site. Draai: npm run bundle → dist/cabin-week.html
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
let html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
html = html.replace(/<link rel="stylesheet" href="css\/([^"]+)">/g, (_, f) => `<style>\n${fs.readFileSync(path.join(root, 'css', f), 'utf8')}</style>`);
html = html.replace(/<script src="js\/([^"]+)"><\/script>\n?/g, (_, f) => `<script>\n${fs.readFileSync(path.join(root, 'js', f), 'utf8')}</script>\n`);
html = html.replace(/<link rel="(manifest|icon|apple-touch-icon)"[^>]*>\n/g, '');
fs.mkdirSync(path.join(root, 'dist'), { recursive: true });
fs.writeFileSync(path.join(root, 'dist', 'cabin-week.html'), html);
console.log('Gebundeld: dist/cabin-week.html');
