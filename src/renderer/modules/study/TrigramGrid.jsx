import { KING_WEN, getHexagram, TRIGRAMS } from '../../data/hexagrams';
import styles from './TrigramGrid.module.css';

export function TrigramGrid({ onSelect }) {
  return (
    <div className={styles.container}>
      <table className={styles.table}>
        <thead>
          <tr>
            <td className={styles.corner} />
            {TRIGRAMS.map(t => (
              <th key={t.index} className={styles.colHead}>
                <span className={styles.trigramSymbol}>{t.symbol}</span>
                <span className={styles.trigramName}>{t.pinyin}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {TRIGRAMS.map(lower => (
            <tr key={lower.index}>
              <th className={styles.rowHead}>
                <span className={styles.trigramSymbol}>{lower.symbol}</span>
                <span className={styles.trigramName}>{lower.pinyin}</span>
              </th>
              {TRIGRAMS.map(upper => {
                const n = KING_WEN[lower.index][upper.index];
                const h = getHexagram(n);
                return (
                  <td key={upper.index} className={styles.cell}>
                    <button
                      className={styles.cellBtn}
                      onClick={() => onSelect(n)}
                      title={`${n}. ${h.pinyin} / ${h.english}`}
                    >
                      {n}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
