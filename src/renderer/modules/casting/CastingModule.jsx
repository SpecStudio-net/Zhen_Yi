import { useState, useMemo } from 'react';
import { Hexagram } from '../../components/Hexagram';
import { ReadingPanel } from './ReadingPanel';
import { LLMPanel }     from './LLMPanel';
import { castLine } from './castLine';
import {
  getHexagram,
  hexagramFromLines,
  relatingHexagram,
  changingLines,
  priorityLine,
} from '../../data/hexagrams';
import { saveReading } from '../../../store/journalStore';
import styles from './CastingModule.module.css';

export function CastingModule() {
  const [query,     setQuery]     = useState('');
  const [phase,     setPhase]     = useState('idle');   // 'idle' | 'casting' | 'reading'
  const [lines,     setLines]     = useState(Array(6).fill(null));
  const [nextCast,  setNextCast]  = useState(0);
  const [saveState, setSaveState] = useState('idle');   // 'idle' | 'open'
  const [notes,     setNotes]     = useState('');
  const [messages,  setMessages]  = useState([]);       // LLM conversation

  function submitQuery(e) {
    e.preventDefault();
    if (!query.trim()) return;
    setPhase('casting');
  }

  function handleCast() {
    const value   = castLine();
    const updated = lines.map((v, i) => i === nextCast ? value : v);
    const next    = nextCast + 1;
    setLines(updated);
    setNextCast(next);
    if (next === 6) setPhase('reading');
  }

  function handleCopyToNotes(text) {
    setNotes(prev => prev ? `${prev}\n\n${text}` : text);
    if (saveState === 'idle') setSaveState('open');
  }

  async function handleSave() {
    await saveReading({
      id:        crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      question:  query,
      cast: {
        lines,
        primary:  hexagramFromLines(lines),
        relating: relatingHexagram(lines),
      },
      notes,
      conversation: messages,
    });
    // Return to idle
    setQuery('');   setPhase('idle');
    setLines(Array(6).fill(null));   setNextCast(0);
    setSaveState('idle');   setNotes('');   setMessages([]);
  }

  const reading = useMemo(() => {
    if (phase !== 'reading') return null;
    const primaryNum  = hexagramFromLines(lines);
    const relatingNum = relatingHexagram(lines);
    return {
      primary:            getHexagram(primaryNum),
      relating:           relatingNum ? getHexagram(relatingNum) : null,
      relatingLineValues: relatingNum
        ? lines.map(v => v === 6 ? 7 : v === 9 ? 8 : v)
        : null,
      lines,
      changing:           changingLines(lines),
      priority:           priorityLine(lines),
    };
  }, [phase, lines]);

  return (
    <div className={styles.screen}>

      <div className={styles.queryBar}>
        {phase === 'idle' ? (
          <form className={styles.queryForm} onSubmit={submitQuery}>
            <input
              className={styles.queryInput}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Enter your question or intention"
              autoFocus
            />
          </form>
        ) : (
          <p className={styles.queryLocked}>{query}</p>
        )}
      </div>

      <div className={styles.panels}>

        <div className={styles.hexPanel}>
          {phase === 'idle' && (
            <div className={styles.watermark} aria-hidden="true">易經</div>
          )}

          {phase !== 'idle' && (
            <div className={styles.primaryGlyph}>
              <Hexagram lines={lines} />
            </div>
          )}

          {phase === 'casting' && (
            <button className={styles.castButton} onClick={handleCast}>
              Cast
            </button>
          )}

          {reading?.relating && (
            <>
              <p className={styles.movingTo}>moving to</p>
              <div className={styles.relatingGlyph}>
                <Hexagram lines={reading.relatingLineValues} subordinate />
                <p className={styles.relatingName}>
                  {reading.relating.pinyin}<br />{reading.relating.english}
                </p>
              </div>
            </>
          )}
        </div>

        <div className={styles.readingArea}>
          <div className={styles.readingScroll}>
            {reading && <ReadingPanel reading={reading} />}
            {reading && (
              <LLMPanel
                question={query}
                reading={reading}
                messages={messages}
                setMessages={setMessages}
                onCopyToNotes={handleCopyToNotes}
              />
            )}
          </div>

          {phase === 'reading' && (
            <div className={styles.saveBar}>
              {saveState === 'idle' ? (
                <button className={styles.saveBtn} onClick={() => setSaveState('open')}>
                  Save reading
                </button>
              ) : (
                <>
                  <textarea
                    className={styles.notesInput}
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Notes (optional)"
                    rows={2}
                    autoFocus
                  />
                  <button className={styles.saveBtnConfirm} onClick={handleSave}>Save</button>
                  <button className={styles.saveBtnCancel} onClick={() => setSaveState('idle')}>Cancel</button>
                </>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
