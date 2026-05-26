const express  = require('express');
const fs        = require('fs');
const path      = require('path');

const app  = express();
const PORT = process.env.PORT || 3001;
const isProd = process.env.NODE_ENV === 'production';

const DATA_DIR    = path.join(__dirname, 'data');
const JOURNAL_PATH = path.join(DATA_DIR, 'journal.json');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

app.use(express.json());

// ── Static (production) ───────────────────────────────────────────────────────

if (isProd) {
  app.use(express.static(path.join(__dirname, 'dist', 'renderer')));
}

// ── Journal ───────────────────────────────────────────────────────────────────

function readJournal() {
  try { return JSON.parse(fs.readFileSync(JOURNAL_PATH, 'utf8')); }
  catch { return { readings: [] }; }
}

function writeJournal(j) {
  fs.writeFileSync(JOURNAL_PATH, JSON.stringify(j, null, 2), 'utf8');
}

app.get('/api/journal', (_, res) => {
  res.json(readJournal());
});

app.post('/api/journal', (req, res) => {
  const j = readJournal();
  j.readings.unshift(req.body);
  writeJournal(j);
  res.json({ ok: true });
});

app.put('/api/journal/:id/notes', (req, res) => {
  const j = readJournal();
  const e = j.readings.find(r => r.id === req.params.id);
  if (e) { e.notes = req.body.notes; writeJournal(j); }
  res.json({ ok: true });
});

app.put('/api/journal/:id/hidden', (req, res) => {
  const j = readJournal();
  const e = j.readings.find(r => r.id === req.params.id);
  if (e) { e.hidden = !e.hidden; writeJournal(j); }
  res.json({ ok: true });
});

// ── LLM streaming via SSE ─────────────────────────────────────────────────────

app.post('/api/llm/stream', async (req, res) => {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'ANTHROPIC_API_KEY environment variable is not set.' });
    return;
  }

  const { systemPrompt, messages, model } = req.body;
  const ALLOWED_MODELS = ['claude-sonnet-4-6', 'claude-opus-4-7'];
  const resolvedModel = ALLOWED_MODELS.includes(model) ? model : 'claude-sonnet-4-6';

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const send = (event, data) =>
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);

  try {
    const { default: Anthropic } = await import('@anthropic-ai/sdk');
    const client = new Anthropic({ apiKey });

    const stream = client.messages.stream({
      model:      resolvedModel,
      max_tokens: 1024,
      system:     systemPrompt,
      messages,
    });

    for await (const chunk of stream) {
      if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
        send('chunk', { text: chunk.delta.text });
      }
    }

    send('done', {});
  } catch (err) {
    send('error', { message: err.message });
  } finally {
    res.end();
  }
});

// ── SPA fallback (production) ─────────────────────────────────────────────────

if (isProd) {
  app.get('*', (_, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'renderer', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Zhēn Yì  http://localhost:${PORT}`);
  if (!isProd) console.log('  API proxied from Vite dev server on :5173');
});
