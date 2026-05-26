import styles from './ReadingPanel.module.css';

export function ReadingPanel({ reading }) {
  const { primary, relating, changing, priority } = reading;
  const allChanging = changing.length === 6;

  return (
    <div className={styles.panel}>

      <header className={styles.header}>
        <span className={styles.number}>{primary.number}</span>
        <span className={styles.character}>{primary.character}</span>
        <div className={styles.names}>
          <span className={styles.pinyin}>{primary.pinyin}</span>
          <span className={styles.english}>{primary.english}</span>
        </div>
      </header>

      {primary.introduction && (
        <p className={styles.introduction}>{primary.introduction}</p>
      )}

      <section className={styles.section}>
        <h2 className={styles.sectionHead}>The Judgment</h2>
        <p className={styles.verse}>{primary.judgment.verse}</p>
        {primary.judgment.commentary && (
          <p className={styles.commentary}>{primary.judgment.commentary}</p>
        )}
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionHead}>The Image</h2>
        <p className={styles.verse}>{primary.image.verse}</p>
        {primary.image.commentary && (
          <p className={styles.commentary}>{primary.image.commentary}</p>
        )}
      </section>

      {/* Changing lines — only when 1–5 are changing */}
      {!allChanging && changing.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionHead}>The Lines</h2>
          {changing.map(n => {
            const line = primary.lines[n - 1];
            return (
              <div key={n} className={n === priority ? styles.priorityLine : styles.changingLine}>
                <h3 className={styles.linePosition}>{line.position}</h3>
                {line.verse && <p className={styles.verse}>{line.verse}</p>}
                {line.commentary && <p className={styles.commentary}>{line.commentary}</p>}
              </div>
            );
          })}
        </section>
      )}

      {/* All-nines / all-sixes special oracle (hex 1 and hex 2 only) */}
      {allChanging && primary.allNines && (
        <section className={styles.section}>
          <p className={styles.commentary}>{primary.allNines}</p>
        </section>
      )}
      {allChanging && primary.allSixes && (
        <section className={styles.section}>
          <p className={styles.commentary}>{primary.allSixes}</p>
        </section>
      )}

      {/* Relating hexagram — judgment only */}
      {relating && (
        <section className={styles.relatingSection}>
          <h2 className={styles.relatingHead}>
            {relating.number} · {relating.pinyin} · {relating.english}
          </h2>
          <p className={styles.verse}>{relating.judgment.verse}</p>
          {relating.judgment.commentary && (
            <p className={styles.commentary}>{relating.judgment.commentary}</p>
          )}
        </section>
      )}

    </div>
  );
}
