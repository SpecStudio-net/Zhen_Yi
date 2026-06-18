import { useState, useRef, useEffect } from 'react';
import ReactMarkdown            from 'react-markdown';
import remarkBreaks             from 'remark-breaks';
import { streamCompletion }    from '../../llm/llmClient';
import { assembleSystemPrompt } from '../../llm/assembleContext';
import styles from './LLMPanel.module.css';

const REMARK_PLUGINS = [remarkBreaks];

export function LLMPanel({ question, reading, messages, setMessages, onCopyToNotes }) {
  const [input,       setInput]       = useState('');
  const [streaming,   setStreaming]   = useState(false);
  const [streamText,  setStreamText]  = useState('');
  const [model,       setModel]       = useState('claude-sonnet-4-6');
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamText]);

  async function handleSubmit(e) {
    e.preventDefault();
    const q = input.trim();
    if (!q || streaming) return;
    setInput('');
    if (inputRef.current) inputRef.current.style.height = 'auto';

    const userMsg     = { role: 'user', content: q };
    const history     = [...messages, userMsg];
    setMessages(history);
    setStreaming(true);
    setStreamText('');

    const systemPrompt = assembleSystemPrompt(question, reading);
    let full = '';
    try {
      for await (const chunk of streamCompletion(systemPrompt, history, model)) {
        full += chunk;
        setStreamText(full);
      }
    } catch (err) {
      full = full || `⚠ ${err.message}`;
    } finally {
      setStreaming(false);
      setStreamText('');
      if (full) setMessages(prev => [...prev, { role: 'assistant', content: full }]);
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  }

  function autoGrow(e) {
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }

  return (
    <div className={styles.panel}>
      {messages.length > 0 && (
        <div className={styles.thread}>
          {messages.map((msg, i) => (
            <div key={i} className={msg.role === 'user' ? styles.userMsg : styles.assistantMsg}>
              <div className={styles.msgText}>
                <ReactMarkdown remarkPlugins={REMARK_PLUGINS}>{msg.content}</ReactMarkdown>
              </div>
              {msg.role === 'assistant' && (
                <button className={styles.copyBtn} onClick={() => onCopyToNotes(msg.content)}>
                  copy to notes
                </button>
              )}
            </div>
          ))}
          {streaming && (
            <div className={styles.assistantMsg}>
              <div className={styles.msgText}>
                <ReactMarkdown remarkPlugins={REMARK_PLUGINS}>{streamText}</ReactMarkdown>
                <span className={styles.cursor}>▋</span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      )}

      <form className={styles.form} onSubmit={handleSubmit}>
        <textarea
          ref={inputRef}
          className={styles.input}
          rows={1}
          value={input}
          onChange={e => setInput(e.target.value)}
          onInput={autoGrow}
          onKeyDown={handleKeyDown}
          placeholder={messages.length === 0 ? 'Ask about this reading…' : 'Ask another question…'}
          disabled={streaming}
        />
        <div className={styles.modelToggle}>
          <button
            type="button"
            className={model === 'claude-sonnet-4-6' ? styles.modelOptActive : styles.modelOpt}
            onClick={() => setModel('claude-sonnet-4-6')}
            disabled={streaming}
          >
            sonnet
          </button>
          <button
            type="button"
            className={model === 'claude-opus-4-7' ? styles.modelOptActive : styles.modelOpt}
            onClick={() => setModel('claude-opus-4-7')}
            disabled={streaming}
          >
            opus
          </button>
        </div>
      </form>
    </div>
  );
}
