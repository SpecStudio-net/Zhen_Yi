import { useState } from 'react';
import { CastingModule } from './modules/casting/CastingModule';
import { StudyModule }   from './modules/study/StudyModule';
import { JournalModule } from './modules/journal/JournalModule';
import styles from './App.module.css';

const TABS = ['cast', 'study', 'journal'];

export default function App() {
  const [tab, setTab] = useState('cast');

  return (
    <div className={styles.app}>
      <nav className={styles.nav}>
        {TABS.map(t => (
          <button
            key={t}
            className={tab === t ? `${styles.tab} ${styles.tabActive}` : styles.tab}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </nav>
      <main className={styles.main}>
        {tab === 'cast'    && <CastingModule />}
        {tab === 'study'   && <StudyModule />}
        {tab === 'journal' && <JournalModule />}
      </main>
    </div>
  );
}
