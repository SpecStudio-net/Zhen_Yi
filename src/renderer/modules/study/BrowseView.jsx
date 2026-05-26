import { Hexagram } from '../../components/Hexagram';
import { getHexagram, hexagramLineValues } from '../../data/hexagrams';
import styles from './BrowseView.module.css';

export function BrowseView({ onSelect }) {
  return (
    <div className={styles.grid}>
      {Array.from({ length: 64 }, (_, i) => i + 1).map(n => {
        const h     = getHexagram(n);
        const lines = hexagramLineValues(n);
        return (
          <div key={n} className={styles.card} onClick={() => onSelect(n)}>
            <div className={styles.glyph}>
              <Hexagram lines={lines} />
            </div>
            <div className={styles.meta}>
              <span className={styles.number}>{n}</span>
              <span className={styles.pinyin}>{h.pinyin}</span>
              <span className={styles.english}>{h.english}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
