// Proofread the bundled Wilhelm/Baynes hexagram texts using Claude.
// Output: proofread_report.md at repo root, organized by hexagram.
// Usage:  ANTHROPIC_API_KEY=sk-... node scripts/proofread.js

const fs   = require('fs');
const path = require('path');

const HEXAGRAMS_PATH = path.join(__dirname, '..', 'public', 'assets', 'hexagrams.json');
const REPORT_PATH    = path.join(__dirname, '..', 'proofread_report.md');
const MODEL          = 'claude-sonnet-4-6';
const MAX_TOKENS     = 4096;
const CONCURRENCY    = 5;

const SYSTEM_PROMPT = `You are proofreading a digitized copy of the Wilhelm/Baynes translation of the Yìjīng (I Ching). The source text was OCR'd from a printed edition and may contain typos, missing-space joins, transposed letters, or wrong-but-plausible word substitutions (e.g. "form" vs "from", "lighting" vs "lightning").

CRITICAL RULES:
1. The Wilhelm translation uses archaic, formal English. Do NOT flag archaisms like "thou", "speaketh", "verily", "naught", "hither". Do NOT modernize phrasing.
2. Pinyin Chinese terms appear throughout (e.g. Yìjīng, Zhèn, Kǎn, Qián, Kūn, Tài, Wén, Lao-tse) — these are correct as written, do NOT flag them.
3. Do NOT flag stylistic preferences, punctuation choices, capitalization of poetic lines, em dashes, or sentence-fragment verses.
4. ONLY flag what looks like genuine typographical errors: letter transpositions, joined-without-space words, missing/wrong letters, wrong word substitutions where a sound-alike or look-alike was clearly intended.

Output STRICT JSON only, no prose, in this shape:
{
  "findings": [
    {
      "quote": "the exact problematic substring as it appears in the text",
      "suggested": "the corrected substring",
      "confidence": "high" | "medium" | "low",
      "reason": "brief one-line reason"
    }
  ]
}

If no errors, return {"findings": []}.`;

function gatherHexagramText(hex) {
  const parts = [];
  parts.push(`# ${hex.number}. ${hex.pinyin} / ${hex.english}`);
  if (hex.introduction) parts.push(`## Introduction\n${hex.introduction}`);
  if (hex.judgment) {
    parts.push(`## Judgment\n${hex.judgment.verse}`);
    if (hex.judgment.commentary) parts.push(hex.judgment.commentary);
  }
  if (hex.image) {
    parts.push(`## Image\n${hex.image.verse}`);
    if (hex.image.commentary) parts.push(hex.image.commentary);
  }
  if (hex.lines) {
    for (const line of hex.lines) {
      parts.push(`## Line ${line.position}\n${line.verse}`);
      if (line.commentary) parts.push(line.commentary);
    }
  }
  if (hex.allNines) parts.push(`## All nines\n${hex.allNines}`);
  if (hex.allSixes) parts.push(`## All sixes\n${hex.allSixes}`);
  return parts.join('\n\n');
}

async function proofreadOne(client, hex) {
  const text = gatherHexagramText(hex);
  const response = await client.messages.create({
    model:      MODEL,
    max_tokens: MAX_TOKENS,
    system: [
      {
        type: 'text',
        text: SYSTEM_PROMPT,
        cache_control: { type: 'ephemeral' },
      },
    ],
    messages: [
      { role: 'user', content: `Proofread the following hexagram text. Return JSON only.\n\n${text}` },
    ],
  });

  const raw = response.content.find(b => b.type === 'text')?.text ?? '';
  const usage = response.usage;
  let findings = [];
  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    findings = JSON.parse(jsonMatch ? jsonMatch[0] : raw).findings || [];
  } catch (err) {
    findings = [{ quote: '[PARSE ERROR]', suggested: '', confidence: 'low', reason: `Could not parse model output: ${raw.slice(0, 200)}` }];
  }
  return { hex, findings, usage };
}

async function pool(items, n, worker) {
  const results = [];
  let i = 0;
  const runners = Array.from({ length: n }, async () => {
    while (i < items.length) {
      const idx = i++;
      results[idx] = await worker(items[idx], idx);
    }
  });
  await Promise.all(runners);
  return results;
}

(async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('Set ANTHROPIC_API_KEY in env.');
    process.exit(1);
  }

  const { default: Anthropic } = await import('@anthropic-ai/sdk');
  const client = new Anthropic();

  const all = JSON.parse(fs.readFileSync(HEXAGRAMS_PATH, 'utf8'));
  const hexagrams = Object.values(all).sort((a, b) => a.number - b.number);

  console.log(`Proofreading ${hexagrams.length} hexagrams with ${MODEL}, concurrency=${CONCURRENCY}...`);

  let totalInput = 0, totalOutput = 0, totalCacheRead = 0, totalCacheWrite = 0;
  const results = await pool(hexagrams, CONCURRENCY, async (hex, idx) => {
    process.stdout.write(`  [${idx + 1}/${hexagrams.length}] ${hex.number}. ${hex.pinyin}... `);
    try {
      const result = await proofreadOne(client, hex);
      totalInput      += result.usage.input_tokens;
      totalOutput     += result.usage.output_tokens;
      totalCacheRead  += result.usage.cache_read_input_tokens || 0;
      totalCacheWrite += result.usage.cache_creation_input_tokens || 0;
      console.log(`${result.findings.length} finding${result.findings.length === 1 ? '' : 's'}`);
      return result;
    } catch (err) {
      console.log(`ERROR: ${err.message}`);
      return { hex, findings: [{ quote: '[API ERROR]', suggested: '', confidence: 'low', reason: err.message }], usage: { input_tokens: 0, output_tokens: 0 } };
    }
  });

  const lines = [];
  lines.push('# Proofread report');
  lines.push('');
  lines.push(`Model: \`${MODEL}\`  ·  Hexagrams: ${results.length}`);
  lines.push(`Tokens — input: ${totalInput}, output: ${totalOutput}, cache read: ${totalCacheRead}, cache write: ${totalCacheWrite}`);
  lines.push('');

  let totalFindings = 0;
  for (const r of results) {
    if (r.findings.length === 0) continue;
    totalFindings += r.findings.length;
    lines.push(`## Hexagram ${r.hex.number}. ${r.hex.pinyin} / ${r.hex.english}`);
    lines.push('');
    for (const f of r.findings) {
      lines.push(`- **\`${f.quote}\`** → **\`${f.suggested}\`**  _(${f.confidence})_  — ${f.reason}`);
    }
    lines.push('');
  }

  if (totalFindings === 0) {
    lines.push('No findings. Text appears clean.');
  } else {
    lines.splice(3, 0, `Total findings: ${totalFindings}`, '');
  }

  fs.writeFileSync(REPORT_PATH, lines.join('\n'), 'utf8');
  console.log(`\nReport written to ${REPORT_PATH}`);
  console.log(`Total findings: ${totalFindings}`);
})();
