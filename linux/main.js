// TripScouts for Linux (a snap for the Snap Store and Ubuntu's App Center). One window with the game in it,
// like the Android app: the game itself is the same files as the website (copied into game/ by the workflow
// "Build the Linux app", see docs/linux.md). Served from app://tripscouts/, so saved progress has its own fixed place.
const { app, BrowserWindow, Menu, net, protocol, shell } = require('electron');
const path = require('path');
const { pathToFileURL } = require('url');

const GAME = path.join(__dirname, 'game');
protocol.registerSchemesAsPrivileged([{ scheme: 'app', privileges: { standard: true, secure: true, supportFetchAPI: true } }]);

// one window only: starting the app again brings the open one to the front
if (!app.requestSingleInstanceLock()) app.quit();

const external = url => { if (/^https?:\/\//.test(url)) shell.openExternal(url); };

function open() {
  const win = new BrowserWindow({
    width: 1280, height: 720, minWidth: 640, minHeight: 360,
    backgroundColor: '#0f1b2a', title: 'TripScouts', icon: path.join(GAME, 'icons', 'icon-512.png'),
    webPreferences: { contextIsolation: true, sandbox: true }
  });
  // links that open a new window (source code, licence) go to the normal browser
  win.webContents.setWindowOpenHandler(({ url }) => { external(url); return { action: 'deny' }; });
  win.webContents.on('will-navigate', (e, url) => { if (!url.startsWith('app://')) { e.preventDefault(); external(url); } });
  win.loadURL('app://tripscouts/index.html');
  app.on('second-instance', () => { if (win.isMinimized()) win.restore(); win.focus(); });
}

app.whenReady().then(() => {
  const nl = app.getLocale().startsWith('nl');
  Menu.setApplicationMenu(Menu.buildFromTemplate([{
    label: 'TripScouts',
    submenu: [
      { role: 'togglefullscreen', label: nl ? 'Volledig scherm' : 'Full screen', accelerator: 'F11' },
      { type: 'separator' },
      { role: 'quit', label: nl ? 'Afsluiten' : 'Quit', accelerator: 'Control+Q' }
    ]
  }]));
  // app://tripscouts/<file> serves the files of the game, and nothing outside game/
  protocol.handle('app', req => {
    let p = decodeURIComponent(new URL(req.url).pathname);
    if (p === '/' || p === '') p = '/index.html';
    const file = path.normalize(path.join(GAME, p));
    if (!file.startsWith(GAME + path.sep)) return new Response('Not found', { status: 404 });
    return net.fetch(pathToFileURL(file).toString());
  });
  open();
});
app.on('window-all-closed', () => app.quit());
