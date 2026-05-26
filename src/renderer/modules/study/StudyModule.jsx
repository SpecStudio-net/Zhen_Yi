import { useState, useEffect } from 'react';
import { BrowseView }   from './BrowseView';
import { TrigramGrid }  from './TrigramGrid';
import { SearchView }   from './SearchView';
import { HexagramView } from './HexagramView';
import styles from './StudyModule.module.css';

const TABS = [
  { id: 'browse',  label: 'Browse'       },
  { id: 'trigram', label: 'Trigram Grid'  },
  { id: 'search',  label: 'Search'       },
];

export function StudyModule() {
  const [tab,       setTab]       = useState('browse');
  const [selected,  setSelected]  = useState(null);
  const [jumpValue, setJumpValue] = useState('');

  useEffect(() => {
    function onPop() { setSelected(null); }
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  function openHexagram(n) {
    history.pushState({ hexagram: n }, '');
    setSelected(n);
  }

  function handleBack() {
    history.back();
  }

  function handleJump(e) {
    const n = parseInt(e.target.value, 10);
    if (n >= 1 && n <= 64) { openHexagram(n); setJumpValue(''); }
    else setJumpValue(e.target.value);
  }

  function handleJumpKey(e) {
    if (e.key === 'Enter') {
      const n = parseInt(jumpValue, 10);
      if (n >= 1 && n <= 64) { openHexagram(n); setJumpValue(''); }
    }
  }

  return (
    <div className={styles.screen}>

      <nav className={styles.nav}>
        {selected ? (
          <button className={styles.backBtn} onClick={handleBack}>
            ← back
          </button>
        ) : (
          TABS.map(t => (
            <button
              key={t.id}
              className={`${styles.tab}${tab === t.id ? ` ${styles.tabActive}` : ''}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))
        )}
        <div className={styles.spacer} />
        <input
          className={styles.jumpInput}
          type="number"
          min={1}
          max={64}
          value={jumpValue}
          onChange={handleJump}
          onKeyDown={handleJumpKey}
          placeholder="1–64"
        />
      </nav>

      <div className={styles.content}>
        {selected ? (
          <HexagramView number={selected} />
        ) : (
          <>
            {tab === 'browse'  && <BrowseView  onSelect={openHexagram} />}
            {tab === 'trigram' && <TrigramGrid onSelect={openHexagram} />}
            {tab === 'search'  && <SearchView  onSelect={openHexagram} />}
          </>
        )}
      </div>

    </div>
  );
}
