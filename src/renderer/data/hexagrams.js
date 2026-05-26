import hexagrams from '../../../public/assets/hexagrams.json';

// The eight trigrams in KING_WEN row/column order (index 0–7).
// lines: 3-value array [line1, line2, line3] bottom→top, stable values only (7=yáng, 8=yīn).
export const TRIGRAMS = [
  { index: 0, pinyin: 'Kūn',  symbol: '☷', lines: [8, 8, 8] },
  { index: 1, pinyin: 'Zhèn', symbol: '☳', lines: [7, 8, 8] },
  { index: 2, pinyin: 'Kǎn',  symbol: '☵', lines: [8, 7, 8] },
  { index: 3, pinyin: 'Duì',  symbol: '☱', lines: [7, 7, 8] },
  { index: 4, pinyin: 'Gèn',  symbol: '☶', lines: [8, 8, 7] },
  { index: 5, pinyin: 'Lí',   symbol: '☲', lines: [7, 8, 7] },
  { index: 6, pinyin: 'Xùn',  symbol: '☴', lines: [8, 7, 7] },
  { index: 7, pinyin: 'Qián', symbol: '☰', lines: [7, 7, 7] },
];

// Return the six stable line values (7/8) for any hexagram by number,
// derived from its lower and upper trigram names stored in hexagrams.json.
export function hexagramLineValues(n) {
  const h = hexagrams[n];
  const find = name => (TRIGRAMS.find(t => t.pinyin === name) || TRIGRAMS[0]).lines;
  return [...find(h.trigrams.below), ...find(h.trigrams.above)];
}

// King Wén lookup table: KING_WEN[lower][upper] → hexagram number.
// Trigram index = 3-bit encoding of the three lines bottom→top: yang=1, yin=0.
//   Kūn(000)=0  Zhèn(001)=1  Kǎn(010)=2  Duì(011)=3
//   Gèn(100)=4  Lí(101)=5   Xùn(110)=6  Qián(111)=7
export const KING_WEN = [
  [ 2, 16,  8, 45, 23, 35, 20, 12],  // lower Kūn
  [24, 51,  3, 17, 27, 21, 42, 25],  // lower Zhèn
  [ 7, 40, 29, 47,  4, 64, 59,  6],  // lower Kǎn
  [19, 54, 60, 58, 41, 38, 61, 10],  // lower Duì
  [15, 62, 39, 31, 52, 56, 53, 33],  // lower Gèn
  [36, 55, 63, 49, 22, 30, 37, 13],  // lower Lí
  [46, 32, 48, 28, 18, 50, 57, 44],  // lower Xùn
  [11, 34,  5, 43, 26, 14,  9,  1],  // lower Qián
];

// Return the full hexagram object for a given number (1–64).
export function getHexagram(n) {
  return hexagrams[n];
}

// Return a single line object (1–6, bottom to top) for a given hexagram.
export function getLine(n, lineNumber) {
  return hexagrams[n].lines[lineNumber - 1];
}

// Given an array of six line values [6|7|8|9] (index 0 = bottom line), return
// the hexagram number using the King Wén trigram lookup table.
// 6 or 8 → yīn; 7 or 9 → yáng.
export function hexagramFromLines(lines) {
  const y = v => (v === 7 || v === 9) ? 1 : 0;
  const lower = y(lines[0]) | (y(lines[1]) << 1) | (y(lines[2]) << 2);
  const upper = y(lines[3]) | (y(lines[4]) << 1) | (y(lines[5]) << 2);
  return KING_WEN[lower][upper];
}

// Return an array of line positions (1-indexed) that are changing (value 6 or 9).
export function changingLines(lines) {
  return lines.reduce((acc, v, i) => {
    if (v === 6 || v === 9) acc.push(i + 1);
    return acc;
  }, []);
}

// Given an array of six line values, return the relating hexagram number,
// or null if no lines are changing.
export function relatingHexagram(lines) {
  if (!lines.some(v => v === 6 || v === 9)) return null;
  // Flip changing lines: old yīn (6) → yáng, old yáng (9) → yīn.
  const flipped = lines.map(v => v === 6 ? 7 : v === 9 ? 8 : v);
  return hexagramFromLines(flipped);
}

// Return the 1-indexed position of the priority line, applying the rules in §6.4.
// Returns null if there are no changing lines, or if all six lines are changing
// (in which case the reading uses the allNines/allSixes oracle or the relating judgment).
export function priorityLine(lines) {
  const changing = changingLines(lines);
  if (changing.length === 0 || changing.length === 6) return null;
  if (changing.length === 1) return changing[0];

  // Prefer 9s (old yáng) over 6s (old yīn).
  const nines = changing.filter(p => lines[p - 1] === 9);
  const group = nines.length > 0 ? nines : changing; // sixes if no nines

  if (group.length === 1) return group[0];

  // Wilhelm positional tiebreaker (group is sorted ascending by construction).
  switch (group.length) {
    case 2: return group[1];          // upper (higher-numbered)
    case 3: return group[1];          // middle
    case 4:
    case 5: {
      // Lower of the non-group positions (non-changing for case 4; single for case 5).
      const nonGroup = [1, 2, 3, 4, 5, 6].filter(p => !group.includes(p));
      return nonGroup[0];
    }
    default: return group[0];
  }
}
