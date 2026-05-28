const { app, BrowserWindow } = require('electron');
const path = require('path');

// process.defaultApp is set when Electron is launched as `electron .`
const isDev = !!process.defaultApp || process.env.NODE_ENV === 'development';

// ── Window ────────────────────────────────────────────────────────────────────

function createWindow() {
  const win = new BrowserWindow({
    width:    1280,
    height:   820,
    minWidth: 900,
    minHeight: 620,
    backgroundColor: '#14120f',
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (isDev) {
    win.loadURL('http://localhost:5173');
  } else {
    win.loadFile(path.join(__dirname, '../dist/renderer/index.html'));
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
