// §6.2 — timing algorithm: ms % 16 → yarrow-stalk probability distribution.
// 6 = old yīn (1/16), 7 = young yáng (5/16), 8 = young yīn (7/16), 9 = old yáng (3/16).
export function castLine() {
  const val = Date.now() % 16;
  if (val === 0)             return 6;
  if (val >= 1 && val <= 5)  return 7;
  if (val >= 6 && val <= 12) return 8;
  return 9;
}
