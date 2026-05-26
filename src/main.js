const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs   = require('fs');

// process.defaultApp is set when Electron is launched as `electron .`
const isDev        = !!process.defaultApp || process.env.NODE_ENV === 'development';
const JOURNAL_PATH = path.join(app.getPath('userData'), 'journal.json');
const CONFIG_PATH  = path.join(app.getPath('userData'), 'config.json');

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
      preload: path.join(__dirname, 'preload.js'),
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

// ── Journal IPC ───────────────────────────────────────────────────────────────

function readJournal() {
  try {
    return JSON.parse(fs.readFileSync(JOURNAL_PATH, 'utf8'));
  } catch {
    return { readings: [] };
  }
}

function writeJournal(journal) {
  fs.writeFileSync(JOURNAL_PATH, JSON.stringify(journal, null, 2), 'utf8');
}

ipcMain.handle('journal:load', () => readJournal());

ipcMain.handle('journal:save', (_, entry) => {
  const j = readJournal();
  j.readings.unshift(entry);
  writeJournal(j);
});

ipcMain.handle('journal:update-notes', (_, id, notes) => {
  const j = readJournal();
  const entry = j.readings.find(r => r.id === id);
  if (entry) { entry.notes = notes; writeJournal(j); }
});

ipcMain.handle('journal:toggle-hidden', (_, id) => {
  const j = readJournal();
  const entry = j.readings.find(r => r.id === id);
  if (entry) { entry.hidden = !entry.hidden; writeJournal(j); }
});

// ── LLM streaming IPC ─────────────────────────────────────────────────────────

function getApiKey() {
  if (process.env.ANTHROPIC_API_KEY) return process.env.ANTHROPIC_API_KEY;
  try {
    const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
    return config.apiKey || null;
  } catch {
    return null;
  }
}

ipcMain.handle('completion:stream', async (event, { requestId, systemPrompt, messages }) => {
  const apiKey = getApiKey();
  if (!apiKey) {
    event.sender.send('completion:error', {
      requestId,
      message: 'API key not set. Add ANTHROPIC_API_KEY to your environment, or create ' +
               path.basename(CONFIG_PATH) + ' in app data with { "apiKey": "sk-ant-..." }.',
    });
    return;
  }

  let Anthropic;
  try {
    Anthropic = require('@anthropic-ai/sdk');
  } catch {
    event.sender.send('completion:error', { requestId, message: '@anthropic-ai/sdk not installed.' });
    return;
  }

  const client = new Anthropic({ apiKey });

  try {
    const stream = client.messages.stream({
      model:      'claude-opus-4-7',
      max_tokens: 1024,
      system:     systemPrompt,
      messages,
    });

    for await (const chunk of stream) {
      if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
        event.sender.send('completion:chunk', { requestId, chunk: chunk.delta.text });
      }
    }

    event.sender.send('completion:done', { requestId });
  } catch (err) {
    event.sender.send('completion:error', { requestId, message: err.message });
  }
});
