import { useState } from 'react';
import { Hexagram } from '../../components/Hexagram';
import { ReadingPanel } from '../casting/ReadingPanel';
import {
  getHexagram,
  changingLines,
  priorityLine,
} from '../../data/hexagrams';
import styles from './JournalEntry.module.css';

function formatDate(iso) {
  const d = new Date(iso);
  const date = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  const time = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  return `${date} · ${time}`;
}

function changingLabel(lines) {
  const ch = changingLines(lines);
  if (ch.length === 0) return 'No changing lines';
  if (ch.length === 6) return 'All lines changing';
  return `Line${ch.length > 1 ? 's' : ''} ${ch.join(', ')} changing`;
}

export function JournalEntry({ entry, expanded, onToggle, onUpdateNotes, onToggleHidden }) {
  const [notes, setNotes] = useState(entry.notes || '');

  const primary  = getHexagram(entry.cast.primary);
  const relating = entry.cast.relating ? getHexagram(entry.cast.relating) : null;

  const reading = {
    primary,
    relating,
    relatingLineValues: entry.cast.relating
      ? entry.cast.lines.map(v => v === 6 ? 7 : v === 9 ? 8 : v)
      : null,
    lines:    entry.cast.lines,
    changing: changingLines(entry.cast.lines),
    priority: priorityLine(entry.cast.lines),
  };

  return (
    <div className={styles.entry}>

      <div className={styles.summary} onClick={onToggle}>
        <div className={styles.glyph}>
          <Hexagram lines={entry.cast.lines} />
        </div>
        <div className={styles.meta}>
          <div className={styles.topRow}>
            <span className={styles.question}>{entry.question || '(no question)'}</span>
            <span className={styles.date}>{formatDate(entry.timestamp)}</span>
          </div>
          <span className={styles.hexName}>
            {primary.number} · {primary.pinyin} · {primary.english}
          </span>
          {relating && (
            <span className={styles.relatingName}>
              → {relating.number} · {relating.pinyin} · {relating.english}
            </span>
          )}
          <span className={styles.changingStr}>{changingLabel(entry.cast.lines)}</span>
        </div>
      </div>

      {expanded && (
        <div className={styles.body}>
          <div className={styles.readingWrap}>
            <ReadingPanel reading={reading} />
          </div>
          {entry.conversation?.length > 0 && (
            <div className={styles.conversationSection}>
              <h3 className={styles.notesHead}>Conversation</h3>
              <div className={styles.thread}>
                {entry.conversation.map((msg, i) => (
                  <div
                    key={i}
                    className={msg.role === 'user' ? styles.userMsg : styles.assistantMsg}
                  >
                    <p className={styles.msgText}>{msg.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className={styles.notesSection}>
            <h3 className={styles.notesHead}>Notes</h3>
            <textarea
              className={styles.notesInput}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              onBlur={() => onUpdateNotes(notes)}
              placeholder="Personal notes…"
              rows={4}
            />
          </div>
          <button className={styles.hideBtn} onClick={onToggleHidden}>
            {entry.hidden ? 'unhide this entry' : 'hide this entry'}
          </button>
        </div>
      )}

    </div>
  );
}
