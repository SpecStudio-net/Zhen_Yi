// ── SSE parser ────────────────────────────────────────────────────────────────
// Yields { event, data } objects from a streaming fetch response body.

async function* parseSSE(response) {
  const reader  = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer    = '';
  let curEvent  = null;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let nl;
    while ((nl = buffer.indexOf('\n')) !== -1) {
      const line = buffer.slice(0, nl).trimEnd();
      buffer = buffer.slice(nl + 1);

      if (line === '') { curEvent = null; continue; }
      if (line.startsWith('event: ')) { curEvent = line.slice(7); continue; }
      if (line.startsWith('data: ')) {
        yield { event: curEvent, data: JSON.parse(line.slice(6)) };
      }
    }
  }
}

// ── Mock (server unreachable) ─────────────────────────────────────────────────

const MOCK_RESPONSE = `The hexagram speaks directly to your situation.

The judgment's emphasis on perseverance points toward sustained engagement rather than a single decisive act. This is not a moment for forcing resolution — the image of water finding its course suggests working with what is already moving rather than against it.

The changing lines are the most specific address to your question. The position you're in now (the primary hexagram) is the ground condition; where you're moving (the relating hexagram) is the horizon. The question to sit with is whether the movement described feels like something being lost or something being clarified.

What draws your attention most — the judgment itself, or one of the specific lines?`;

async function* mockStream() {
  await new Promise(r => setTimeout(r, 600));
  for (const token of MOCK_RESPONSE.split(/(?<=\s)/)) {
    yield token;
    await new Promise(r => setTimeout(r, 35 + Math.random() * 28));
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function* streamCompletion(systemPrompt, messages, model) {
  let response;
  try {
    response = await fetch('/api/llm/stream', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ systemPrompt, messages, model }),
    });
  } catch {
    // Server not running — use mock so the UI still works
    yield* mockStream();
    return;
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || `Server error ${response.status}`);
  }

  for await (const { event, data } of parseSSE(response)) {
    if (event === 'chunk') yield data.text;
    if (event === 'error') throw new Error(data.message);
    if (event === 'done')  return;
  }
}
