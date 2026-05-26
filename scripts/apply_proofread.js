// Apply high-confidence findings from proofread_report.md to both the
// source .txt and bundled .json. Reports successes and skips for review.

const fs   = require('fs');
const path = require('path');

const REPORT_PATH = path.join(__dirname, '..', 'proofread_report.md');
const TXT_PATH    = path.join(__dirname, '..', 'I_Ching_Pinyin_normalized.txt');
const JSON_PATH   = path.join(__dirname, '..', 'public', 'assets', 'hexagrams.json');

// Explicit false positives — stylistic, not typos.
const SKIP_QUOTES = new Set([
  "the lower is ch'ien, the Creative",
]);

// Parse all findings from the markdown report.
// Format: - **`quote`** → **`suggested`**  _(confidence)_  — reason
function parseReport(md) {
  const findings = [];
  const re = /- \*\*`([\s\S]+?)`\*\* → \*\*`([\s\S]*?)`\*\*\s+_\((high|medium|low)\)_\s+—\s*([^\n]+)/g;
  let currentHexagram = null;
  // Walk by section
  const sections = md.split(/^## /m);
  for (const section of sections) {
    const titleMatch = section.match(/^Hexagram (\d+)\. (.+?)$/m);
    if (!titleMatch) continue;
    currentHexagram = { number: parseInt(titleMatch[1], 10), name: titleMatch[2] };
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(section)) !== null) {
      findings.push({
        hexagram:   currentHexagram,
        quote:      m[1],
        suggested:  m[2],
        confidence: m[3],
        reason:     m[4].trim(),
      });
    }
  }
  return findings;
}

// Apply one finding to both files. Returns { applied, txtCount, jsonCount, reason }
function applyOne(finding, txt, json) {
  const { quote, suggested } = finding;

  if (SKIP_QUOTES.has(quote)) {
    return { applied: false, reason: 'skip-list (stylistic, not a typo)' };
  }
  if (quote === '[PARSE ERROR]' || quote === '[API ERROR]') {
    return { applied: false, reason: 'parse/API error placeholder' };
  }
  if (quote.includes('\n')) {
    return { applied: false, reason: 'multi-line quote — review manually' };
  }
  if (!quote.trim() || !suggested.trim() && suggested !== '') {
    return { applied: false, reason: 'empty quote or suggestion' };
  }

  // Count occurrences in both files. If absent, the LLM may have re-spaced
  // the quote during paraphrase; flag for review.
  const txtCount  = txt.split(quote).length - 1;
  const jsonCount = json.split(quote).length - 1;
  if (txtCount === 0 && jsonCount === 0) {
    return { applied: false, reason: 'quote not found in either file' };
  }

  return {
    applied:    true,
    txtCount,
    jsonCount,
    newTxt:     txtCount  > 0 ? txt.split(quote).join(suggested)  : txt,
    newJson:    jsonCount > 0 ? json.split(quote).join(suggested) : json,
  };
}

function main() {
  const md       = fs.readFileSync(REPORT_PATH, 'utf8');
  let txt        = fs.readFileSync(TXT_PATH, 'utf8');
  let json       = fs.readFileSync(JSON_PATH, 'utf8');
  const findings = parseReport(md);

  console.log(`Parsed ${findings.length} findings from report.`);
  const high = findings.filter(f => f.confidence === 'high');
  console.log(`High-confidence: ${high.length}`);

  const applied = [];
  const skipped = [];
  for (const f of high) {
    const res = applyOne(f, txt, json);
    if (res.applied) {
      txt  = res.newTxt;
      json = res.newJson;
      applied.push({ ...f, txtCount: res.txtCount, jsonCount: res.jsonCount });
    } else {
      skipped.push({ ...f, reason: res.reason });
    }
  }

  // Validate JSON before writing
  try { JSON.parse(json); }
  catch (err) {
    console.error('JSON would be invalid after edits — aborting. ', err.message);
    process.exit(1);
  }

  fs.writeFileSync(TXT_PATH, txt, 'utf8');
  fs.writeFileSync(JSON_PATH, json, 'utf8');

  console.log(`\nApplied: ${applied.length}`);
  console.log(`Skipped: ${skipped.length}`);

  if (skipped.length > 0) {
    console.log('\n── Skipped (high-confidence but couldn\'t apply) ──');
    for (const s of skipped) {
      console.log(`  [Hex ${s.hexagram.number}] "${s.quote.slice(0, 80)}${s.quote.length > 80 ? '…' : ''}"`);
      console.log(`    → reason: ${s.reason}`);
    }
  }

  // Also write a skip-list file for the user
  const skipReport = ['# Findings not auto-applied', '',
    'These need manual review — typically multi-line quotes, false positives, or quotes the LLM paraphrased.',
    '',
  ];
  for (const s of skipped) {
    skipReport.push(`## Hexagram ${s.hexagram.number}. ${s.hexagram.name}`);
    skipReport.push(`**Quote:** \`${s.quote.replace(/\n/g, ' ⏎ ')}\``);
    skipReport.push(`**Suggested:** \`${s.suggested.replace(/\n/g, ' ⏎ ')}\``);
    skipReport.push(`**Reason:** ${s.reason}`);
    skipReport.push(`**LLM rationale:** ${s.reason && s.reason}`);
    skipReport.push('');
  }
  // Add medium/low for review too
  const mediumLow = findings.filter(f => f.confidence !== 'high');
  if (mediumLow.length > 0) {
    skipReport.push('---', '', '# Medium and low confidence findings (review manually)', '');
    for (const f of mediumLow) {
      skipReport.push(`## Hexagram ${f.hexagram.number}. ${f.hexagram.name}  _(${f.confidence})_`);
      skipReport.push(`- **\`${f.quote.replace(/\n/g, ' ⏎ ')}\`** → **\`${f.suggested.replace(/\n/g, ' ⏎ ')}\`**  — ${f.reason}`);
      skipReport.push('');
    }
  }
  fs.writeFileSync(path.join(__dirname, '..', 'proofread_remaining.md'), skipReport.join('\n'));
  console.log(`\nRemaining findings written to proofread_remaining.md`);
}

main();
