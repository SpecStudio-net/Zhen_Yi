import { useState, useMemo } from 'react';
import { getHexagram } from '../../data/hexagrams';
import styles from './SearchView.module.css';

// Text fields to search across, in priority order.
function textFields(h) {
  const fields = [
    h.judgment.verse, h.judgment.commentary,
    h.image.verse,    h.image.commentary,
    ...h.lines.flatMap(l => [l.verse, l.commentary]),
    h.introduction,
  ];
  return fields.filter(Boolean);
}

// Return the first snippet in h that contains q (case-insensitive), with match highlighted.
function findSnippet(h, q) {
  const lower = q.toLowerCase();
  for (const text of textFields(h)) {
    const idx = text.toLowerCase().indexOf(lower);
    if (idx === -1) continue;
    const start  = Math.max(0, idx - 60);
    const end    = Math.min(text.length, idx + q.length + 60);
    const before = (start > 0 ? '…' : '') + text.slice(start, idx);
    const match  = text.slice(idx, idx + q.length);
    const after  = text.slice(idx + q.length, end) + (end < text.length ? '…' : '');
    return { before, match, after };
  }
  return null;
}

export function SearchView({ onSelect }) {
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    const q = query.trim();
    if (q.length < 2) return [];
    const out = [];
    for (let n = 1; n <= 64; n++) {
      const h       = getHexagram(n);
      const nameHit = h.pinyin.toLowerCase().includes(q.toLowerCase())
                   || h.english.toLowerCase().includes(q.toLowerCase());
      const snippet = nameHit ? null : findSnippet(h, q);
      if (nameHit || snippet) out.push({ n, h, snippet });
    }
    return out;
  }, [query]);

  return (
    <div className={styles.container}>
      <div className={styles.inputBar}>
        <input
          className={styles.input}
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search judgments, images, line texts…"
          autoFocus
        />
      </div>

      <div className={styles.results}>
        {query.trim().length >= 2 && results.length === 0 && (
          <p className={styles.empty}>No matches</p>
        )}
        {results.map(({ n, h, snippet }) => (
          <div key={n} className={styles.result} onClick={() => onSelect(n)}>
            <div className={styles.resultMeta}>
              <span className={styles.resultNumber}>{n}</span>
              <span className={styles.resultPinyin}>{h.pinyin}</span>
              <span className={styles.resultEnglish}>{h.english}</span>
            </div>
            {snippet && (
              <p className={styles.snippet}>
                {snippet.before}
                <mark>{snippet.match}</mark>
                {snippet.after}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
