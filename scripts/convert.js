'use strict';

const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, 'I_Ching_Pinyin_normalized.txt');
const OUT = path.join(__dirname, '../public/assets/hexagrams.json');

// Chinese characters for the 64 hexagrams in King Wén sequence
const CHARACTERS = {
   1: '乾',   2: '坤',   3: '屯',   4: '蒙',   5: '需',   6: '訟',   7: '師',   8: '比',
   9: '小畜', 10: '履',  11: '泰',  12: '否',  13: '同人', 14: '大有', 15: '謙',  16: '豫',
  17: '隨',  18: '蠱',  19: '臨',  20: '觀',  21: '噬嗑', 22: '賁',  23: '剝',  24: '復',
  25: '無妄', 26: '大畜', 27: '頤',  28: '大過', 29: '坎',  30: '離',  31: '咸',  32: '恆',
  33: '遯',  34: '大壯', 35: '晉',  36: '明夷', 37: '家人', 38: '睽',  39: '蹇',  40: '解',
  41: '損',  42: '益',  43: '夬',  44: '姤',  45: '萃',  46: '升',  47: '困',  48: '井',
  49: '革',  50: '鼎',  51: '震',  52: '艮',  53: '漸',  54: '歸妹', 55: '豐',  56: '旅',
  57: '巽',  58: '兌',  59: '渙',  60: '節',  61: '中孚', 62: '小過', 63: '既濟', 64: '未濟',
};

// Any single block of text longer than this is prose commentary, not oracle verse.
// Empirically derived from the source:
//   longest verse block:       172 chars (hex 62 image "Thus in his conduct...")
//   shortest first-commentary: 144 chars (hex 25 line 1) — below the threshold
// Because line-section commentary can fall below 185 chars, the threshold is a
// first pass only; a fallback rule handles the remaining cases (see splitVerseCommentary).
const PROSE_THRESHOLD = 185;

// Split a flat array of lines into non-blank-separated blocks.
function getBlocks(lines) {
  const blocks = [];
  let current = [];
  for (const line of lines) {
    if (line === '') {
      if (current.length > 0) {
        blocks.push(current.join('\n'));
        current = [];
      }
    } else {
      current.push(line);
    }
  }
  if (current.length > 0) blocks.push(current.join('\n'));
  return blocks;
}

// Given the lines of a judgment/image/line section, return { verse, commentary }.
// `initialVerse` is pre-parsed verse text (from a malformed "means." header) to prepend.
function splitVerseCommentary(lines, initialVerse = '') {
  const rawBlocks = getBlocks(lines);

  // Sub-split any multi-line block where a non-first line exceeds the threshold.
  // Handles hex 32 line 2: the commentary paragraph is not fully normalised in
  // the source (it wraps across two lines with no blank separator from the verse).
  const blocks = [];
  for (const b of rawBlocks) {
    if (!b.includes('\n')) { blocks.push(b); continue; }
    const bLines = b.split('\n');
    const splitAt = bLines.findIndex((l, i) => i > 0 && l.length > PROSE_THRESHOLD);
    if (splitAt === -1) { blocks.push(b); continue; }
    if (splitAt > 0) blocks.push(bLines.slice(0, splitAt).join('\n'));
    blocks.push(bLines.slice(splitAt).join('\n'));
  }

  // Commentary paragraphs are normalised single lines (no internal '\n').
  // Multi-line blocks (internal '\n') are always verse, even if their total
  // character count is large (e.g., hex 2 judgment: 8 oracle lines joined = ~345 chars).
  //
  // Primary rule: first SINGLE-LINE block exceeding the prose-length threshold.
  let commentaryStart = blocks.findIndex(
    b => !b.includes('\n') && b.length > PROSE_THRESHOLD,
  );

  // Fallback: three line-section commentaries are shorter than 185 chars
  // (min observed: 144 chars in hex 25). When no single-line block exceeds the
  // threshold, treat the final block as commentary — every section has one.
  if (commentaryStart === -1 && blocks.length > 0) {
    commentaryStart = blocks.length - 1;
  }

  const verseParts = initialVerse ? [initialVerse] : [];

  if (commentaryStart === -1) {
    verseParts.push(...blocks);
    return { verse: verseParts.join('\n\n'), commentary: '' };
  }

  verseParts.push(...blocks.slice(0, commentaryStart));
  const commentaryParts = blocks.slice(commentaryStart);

  return {
    verse: verseParts.join('\n\n'),
    commentary: commentaryParts.join('\n\n'),
  };
}

// Extract the Pīnyīn trigram name from an "above/below ..." line.
// Handles both ALL-CAPS (e.g. "QIÁN") and already-cased (e.g. "Gèn", "Xùn") variants.
function extractTrigram(line) {
  const raw = line.split(/\s+/)[1];
  return raw[0].toUpperCase() + raw.slice(1).toLowerCase();
}

function parse(text) {
  const result = {};

  // Split file into per-hexagram chunks on "index" separator lines.
  const chunks = text.split(/^index$/m);

  // Line position header. Group 3 captures any inline verse text that follows on the same line.
  const LINE_POS_RE = /^(Nine|Six) (at the beginning|in the second place|in the third place|in the fourth place|in the fifth place|at the top) means:(.*)$/;
  const ALL_NINES_RE = /^When all the lines are nines, it means:$/;
  const ALL_SIXES_RE = /^When all the lines are sixes, it means:$/;

  for (const chunk of chunks) {
    const lines = chunk.split('\n');

    // Find the hexagram header — must contain " / " to exclude numbered prose fragments.
    let headerIdx = -1;
    for (let i = 0; i < lines.length; i++) {
      if (/^\d+\. .+ \/ .+$/.test(lines[i])) { headerIdx = i; break; }
    }
    if (headerIdx === -1) continue;

    const hm = lines[headerIdx].match(/^(\d+)\. (.+?) \/ (.+)$/);
    if (!hm) continue;

    const number  = parseInt(hm[1], 10);
    const pinyin  = hm[2].trim();
    const english = hm[3].trim();

    // Locate section boundaries.
    let judgmentIdx = -1, imageIdx = -1, linesIdx = -1;
    for (let i = headerIdx + 1; i < lines.length; i++) {
      if      (lines[i] === 'THE JUDGMENT' && judgmentIdx === -1) judgmentIdx = i;
      else if (lines[i] === 'THE IMAGE'    && imageIdx    === -1) imageIdx    = i;
      else if (lines[i] === 'THE LINES'    && linesIdx    === -1) linesIdx    = i;
    }

    // Trigrams: first "above" and "below" lines after the header.
    let aboveLine = '', belowLine = '';
    const trigramEnd = judgmentIdx !== -1 ? judgmentIdx : lines.length;
    for (let i = headerIdx + 1; i < trigramEnd; i++) {
      if (!aboveLine && lines[i].startsWith('above ')) aboveLine = lines[i];
      else if (!belowLine && lines[i].startsWith('below ')) belowLine = lines[i];
      if (aboveLine && belowLine) break;
    }
    const trigrams = {
      above: aboveLine ? extractTrigram(aboveLine) : '',
      below: belowLine ? extractTrigram(belowLine) : '',
    };

    // Introduction: everything between the trigrams and THE JUDGMENT.
    const introRaw = lines.slice(headerIdx + 1, judgmentIdx !== -1 ? judgmentIdx : lines.length);
    let pastTrigrams = false;
    const introFiltered = [];
    for (const line of introRaw) {
      if (!pastTrigrams) {
        if (line.startsWith('above ') || line.startsWith('below ') || line === '') continue;
        pastTrigrams = true;
      }
      introFiltered.push(line);
    }
    while (introFiltered.length && introFiltered[introFiltered.length - 1] === '') introFiltered.pop();
    const introduction = introFiltered.join('\n');

    // Judgment: between THE JUDGMENT and THE IMAGE.
    const judgmentLines = lines.slice(
      judgmentIdx !== -1 ? judgmentIdx + 1 : 0,
      imageIdx    !== -1 ? imageIdx        : lines.length,
    );
    const judgment = splitVerseCommentary(judgmentLines);

    // Image: between THE IMAGE and THE LINES.
    const imageLines = lines.slice(
      imageIdx  !== -1 ? imageIdx  + 1 : 0,
      linesIdx  !== -1 ? linesIdx      : lines.length,
    );
    const image = splitVerseCommentary(imageLines);

    // Individual line texts + allNines / allSixes.
    const lineSection = linesIdx !== -1 ? lines.slice(linesIdx + 1) : [];
    const boundaries  = [];
    let allNinesIdx   = -1;
    let allSixesIdx   = -1;

    for (let i = 0; i < lineSection.length; i++) {
      const m = lineSection[i].match(LINE_POS_RE);
      if (m) {
        boundaries.push({ idx: i, position: `${m[1]} ${m[2]}`, inlineVerse: m[3].trim() });
      } else if (ALL_NINES_RE.test(lineSection[i])) {
        allNinesIdx = i;
      } else if (ALL_SIXES_RE.test(lineSection[i])) {
        allSixesIdx = i;
      }
    }

    if (boundaries.length !== 6) {
      process.stderr.write(`WARNING: hex ${number} has ${boundaries.length} line(s) (expected 6)\n`);
    }

    const parsedLines = boundaries.map((b, idx) => {
      const start = b.idx + 1;
      const end   = idx + 1 < boundaries.length ? boundaries[idx + 1].idx
                  : allNinesIdx !== -1            ? allNinesIdx
                  : allSixesIdx !== -1            ? allSixesIdx
                  : lineSection.length;
      const { verse, commentary } = splitVerseCommentary(lineSection.slice(start, end), b.inlineVerse);
      return { position: b.position, verse, commentary };
    });

    // allNines / allSixes: store as single combined string (verse + commentary).
    function parseSpecialOracle(startIdx) {
      if (startIdx === -1) return null;
      const content = lineSection.slice(startIdx + 1);
      const blocks  = getBlocks(content);
      const ci      = blocks.findIndex(b => b.length > PROSE_THRESHOLD);
      if (ci === -1) return blocks.join('\n\n');
      const v = blocks.slice(0, ci).join('\n\n');
      const c = blocks.slice(ci).join('\n\n');
      return v + (c ? '\n\n' + c : '');
    }

    result[number] = {
      number,
      pinyin,
      character: CHARACTERS[number] || '',
      english,
      trigrams,
      introduction,
      judgment,
      image,
      lines: parsedLines,
      allNines: parseSpecialOracle(allNinesIdx),
      allSixes: parseSpecialOracle(allSixesIdx),
    };
  }

  return result;
}

// ── Main ──────────────────────────────────────────────────────────────────────

const text      = fs.readFileSync(SRC, 'utf8');
const hexagrams = parse(text);
const count     = Object.keys(hexagrams).length;

if (count !== 64) {
  process.stderr.write(`ERROR: expected 64 hexagrams, got ${count}\n`);
  process.exit(1);
}

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(hexagrams, null, 2), 'utf8');
console.log(`Written ${count} hexagrams to ${OUT}`);
