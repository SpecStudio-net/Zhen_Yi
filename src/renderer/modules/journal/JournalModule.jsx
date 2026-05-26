import { useState, useEffect } from 'react';
import { JournalEntry } from './JournalEntry';
import { loadJournal, updateNotes, toggleHidden } from '../../../store/journalStore';
import styles from './JournalModule.module.css';

export function JournalModule() {
  const [entries,    setEntries]    = useState([]);
  const [expanded,   setExpanded]   = useState(null);
  const [showHidden, setShowHidden] = useState(false);

  async function reload() {
    const j = await loadJournal();
    setEntries(j.readings);
  }

  useEffect(() => { reload(); }, []);

  function handleToggle(id) {
    setExpanded(prev => prev === id ? null : id);
  }

  async function handleUpdateNotes(id, notes) {
    await updateNotes(id, notes);
    reload();
  }

  async function handleToggleHidden(id) {
    await toggleHidden(id);
    setExpanded(null);
    reload();
  }

  const visible      = entries.filter(e => showHidden || !e.hidden);
  const hiddenCount  = entries.filter(e => e.hidden).length;

  return (
    <div className={styles.screen}>
      <div className={styles.header}>
        <h1 className={styles.title}>Journal</h1>
        <span className={styles.count}>
          {visible.length} {visible.length === 1 ? 'reading' : 'readings'}
        </span>
        <div className={styles.spacer} />
        {hiddenCount > 0 && (
          <button className={styles.showHiddenBtn} onClick={() => setShowHidden(v => !v)}>
            {showHidden ? 'hide hidden' : `${hiddenCount} hidden`}
          </button>
        )}
      </div>

      <div className={styles.list}>
        {visible.length === 0 ? (
          <p className={styles.empty}>No readings saved yet.</p>
        ) : (
          visible.map(entry => (
            <JournalEntry
              key={entry.id}
              entry={entry}
              expanded={expanded === entry.id}
              onToggle={() => handleToggle(entry.id)}
              onUpdateNotes={notes => handleUpdateNotes(entry.id, notes)}
              onToggleHidden={() => handleToggleHidden(entry.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
