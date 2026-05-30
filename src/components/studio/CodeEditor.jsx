import { useState, useEffect, useRef, useCallback } from 'react';
import { FileCode, Save, Play, RotateCcw, Undo2, Redo2 } from 'lucide-react';

const MAX_HISTORY = 200;
const HISTORY_DEBOUNCE_MS = 400;

const CodeEditor = ({ filePath, content, framework = 'react', onSave, onRun, onDirtyChange }) => {
  const [edited, setEdited] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const [histPos, setHistPos] = useState(0);
  const [histLen, setHistLen] = useState(1);

  const textareaRef = useRef(null);
  const gutterRef = useRef(null);
  const historyRef = useRef([]);
  const histPosRef = useRef(0);
  const debounceRef = useRef(null);
  const prevFilePathRef = useRef(null);
  const editedRef = useRef('');

  // ── Reset on file switch; absorb external edits (e.g. agent writes) ──────
  useEffect(() => {
    const incoming = content ?? '';

    if (filePath !== prevFilePathRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
      setEdited(incoming);
      editedRef.current = incoming;
      historyRef.current = [incoming];
      histPosRef.current = 0;
      setHistPos(0);
      setHistLen(1);
      setSavedFlash(false);
      prevFilePathRef.current = filePath;
    } else if (incoming !== editedRef.current) {
      // External change (agent wrote the file) — add to history so user can undo it
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
      const truncated = historyRef.current.slice(0, histPosRef.current + 1);
      truncated.push(incoming);
      if (truncated.length > MAX_HISTORY) truncated.shift();
      historyRef.current = truncated;
      histPosRef.current = truncated.length - 1;
      setHistPos(truncated.length - 1);
      setHistLen(truncated.length);
      setEdited(incoming);
      editedRef.current = incoming;
    }
  }, [content, filePath]);

  const isDirty = edited !== (content ?? '');
  const lines = edited.split('\n');

  useEffect(() => {
    onDirtyChange?.(isDirty, edited, filePath);
  }, [isDirty, edited, filePath, onDirtyChange]);

  // ── History ───────────────────────────────────────────────────────────────
  const commitToHistory = useCallback((value) => {
    const truncated = historyRef.current.slice(0, histPosRef.current + 1);
    // Don't add duplicate of current top
    if (truncated[truncated.length - 1] === value) return;
    truncated.push(value);
    if (truncated.length > MAX_HISTORY) truncated.shift();
    historyRef.current = truncated;
    histPosRef.current = truncated.length - 1;
    setHistPos(truncated.length - 1);
    setHistLen(truncated.length);
  }, []);

  const scheduleHistory = useCallback((value) => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      debounceRef.current = null;
      commitToHistory(value);
    }, HISTORY_DEBOUNCE_MS);
  }, [commitToHistory]);

  // ── Undo / Redo ───────────────────────────────────────────────────────────
  const undo = useCallback(() => {
    // Flush any pending debounce so the current state is in history first
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
      commitToHistory(editedRef.current);
    }
    if (histPosRef.current <= 0) return;
    histPosRef.current--;
    const prev = historyRef.current[histPosRef.current];
    setEdited(prev);
    editedRef.current = prev;
    setHistPos(histPosRef.current);
  }, [commitToHistory]);

  const redo = useCallback(() => {
    if (histPosRef.current >= historyRef.current.length - 1) return;
    histPosRef.current++;
    const next = historyRef.current[histPosRef.current];
    setEdited(next);
    editedRef.current = next;
    setHistPos(histPosRef.current);
  }, []);

  // ── Reset to template ─────────────────────────────────────────────────────
  const resetToTemplate = useCallback(async () => {
    if (!filePath) return;
    try {
      const res = await fetch(`/api/read-file?path=${encodeURIComponent(filePath)}&kit=${framework}&source=template`);
      if (!res.ok) return;
      const { content: tmpl } = await res.json();
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
      // Push template content onto history so the user can undo the reset
      const truncated = historyRef.current.slice(0, histPosRef.current + 1);
      if (truncated[truncated.length - 1] !== tmpl) truncated.push(tmpl);
      if (truncated.length > MAX_HISTORY) truncated.shift();
      historyRef.current = truncated;
      histPosRef.current = truncated.length - 1;
      setHistPos(truncated.length - 1);
      setHistLen(truncated.length);
      setEdited(tmpl);
      editedRef.current = tmpl;
    } catch { /* template file doesn't exist — no-op */ }
  }, [filePath, framework]);

  // ── Save ──────────────────────────────────────────────────────────────────
  const handleSave = useCallback(async () => {
    if (!isDirty || saving) return;
    setSaving(true);
    try {
      await onSave(filePath, edited);
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 2000);
    } finally {
      setSaving(false);
    }
  }, [filePath, edited, isDirty, saving, onSave]);

  // ── Scroll sync ───────────────────────────────────────────────────────────
  const syncScroll = () => {
    if (gutterRef.current && textareaRef.current) {
      gutterRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  // ── Keyboard ──────────────────────────────────────────────────────────────
  const handleKeyDown = (e) => {
    const mod = e.metaKey || e.ctrlKey;

    if (mod && e.key === 's') { e.preventDefault(); handleSave(); return; }
    if (mod && e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo(); return; }
    if (mod && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) { e.preventDefault(); redo(); return; }

    if (e.key === 'Tab') {
      e.preventDefault();
      const ta = textareaRef.current;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const next = edited.slice(0, start) + '  ' + edited.slice(end);
      setEdited(next);
      editedRef.current = next;
      scheduleHistory(next);
      requestAnimationFrame(() => { ta.selectionStart = ta.selectionEnd = start + 2; });
      return;
    }

    // Commit history immediately on Enter or paste (better undo granularity)
    if (e.key === 'Enter') {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
      commitToHistory(editedRef.current);
    }
  };

  const handleChange = (e) => {
    const val = e.target.value;
    setEdited(val);
    editedRef.current = val;
    scheduleHistory(val);
  };

  const handlePaste = () => {
    // Commit the pre-paste state to history immediately
    clearTimeout(debounceRef.current);
    debounceRef.current = null;
    commitToHistory(editedRef.current);
  };

  // canUndo is true when there's history to go back to, OR when the user has
  // unsaved typed changes (pending debounce that will become a history entry on undo)
  const canUndo = histPos > 0 || isDirty;
  const canRedo = histPos < histLen - 1;

  // ── Empty state ───────────────────────────────────────────────────────────
  if (!filePath || content === null || content === undefined) {
    return (
      <div className="studio-code-editor">
        <div className="studio-code-empty">
          <FileCode size={32} />
          <span>Select a file to edit</span>
        </div>
      </div>
    );
  }

  return (
    <div className="studio-code-editor">
      {/* ── Toolbar ── */}
      <div className="studio-editor-toolbar">
        <div className="studio-editor-actions">
          {savedFlash && <span className="studio-saved-flash">Saved</span>}

          <button
            className="studio-editor-btn"
            onClick={undo}
            disabled={!canUndo}
            title="Undo (⌘Z)"
          >
            <Undo2 size={12} />
          </button>
          <button
            className="studio-editor-btn"
            onClick={redo}
            disabled={!canRedo}
            title="Redo (⌘⇧Z)"
          >
            <Redo2 size={12} />
          </button>
          <button
            className="studio-editor-btn"
            onClick={resetToTemplate}
            title="Reset file to original template"
          >
            <RotateCcw size={12} />
            Reset
          </button>

          <div className="studio-editor-sep" />

          <button
            className={`studio-editor-btn ${isDirty ? 'primary' : ''}`}
            onClick={handleSave}
            disabled={!isDirty || saving}
            title="Save (⌘S)"
          >
            <Save size={12} />
            {saving ? 'Saving…' : 'Save'}
          </button>
          <button
            className="studio-editor-btn run"
            onClick={onRun}
            title="Save & run preview"
          >
            <Play size={12} />
            Run
          </button>
        </div>
      </div>

      {/* ── Editor body ── */}
      <div className="studio-editor-body">
        <div className="studio-editor-gutter" ref={gutterRef} aria-hidden="true">
          {lines.map((_, i) => (
            <div key={i} className="studio-gutter-line">{i + 1}</div>
          ))}
        </div>
        <textarea
          ref={textareaRef}
          className="studio-editor-textarea"
          value={edited}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          onScroll={syncScroll}
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
        />
      </div>
    </div>
  );
};

export default CodeEditor;
