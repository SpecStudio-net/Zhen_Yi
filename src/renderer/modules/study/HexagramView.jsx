import { Hexagram } from '../../components/Hexagram';
import { getHexagram, hexagramLineValues } from '../../data/hexagrams';
import styles from './HexagramView.module.css';

export function HexagramView({ number }) {
  const h     = getHexagram(number);
  const lines = hexagramLineValues(number);

  return (
    <div className={styles.view}>

      <div className={styles.glyphPanel}>
        <div className={styles.glyph}>
          <Hexagram lines={lines} />
        </div>
      </div>

      <div className={styles.textPanel}>

        <header className={styles.header}>
          <span className={styles.number}>{h.number}</span>
          <span className={styles.character}>{h.character}</span>
          <div className={styles.names}>
            <span className={styles.pinyin}>{h.pinyin}</span>
            <span className={styles.english}>{h.english}</span>
          </div>
        </header>

        {h.introduction && (
          <p className={styles.introduction}>{h.introduction}</p>
        )}

        <section className={styles.section}>
          <h2 className={styles.sectionHead}>The Judgment</h2>
          <p className={styles.verse}>{h.judgment.verse}</p>
          {h.judgment.commentary && (
            <p className={styles.commentary}>{h.judgment.commentary}</p>
          )}
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionHead}>The Image</h2>
          <p className={styles.verse}>{h.image.verse}</p>
          {h.image.commentary && (
            <p className={styles.commentary}>{h.image.commentary}</p>
          )}
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionHead}>The Lines</h2>
          {h.lines.map((line, i) => (
            <div key={i} className={styles.line}>
              <h3 className={styles.linePosition}>{line.position}</h3>
              {line.verse && <p className={styles.verse}>{line.verse}</p>}
              {line.commentary && <p className={styles.commentary}>{line.commentary}</p>}
            </div>
          ))}
        </section>

      </div>
    </div>
  );
}
