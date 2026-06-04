import { useState } from 'react';
import { Brain, Trash2, Pencil, Check, X, Plus } from 'lucide-react';
import { apiPost } from '../../utils/api';

const AgentMemoryPanel = ({ framework, memory, onMemoryChange, onForgetAll }) => {
  const [editingIndex, setEditingIndex] = useState(null);
  const [editDraft, setEditDraft] = useState('');
  const [newFact, setNewFact] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const facts = memory?.facts || [];

  const persistFacts = async (nextFacts) => {
    setSaving(true);
    setError('');
    try {
      const data = await apiPost('/api/agent-memory', {
        kit: framework,
        facts: nextFacts.map(f => ({
          text: (f.text || '').trim(),
          createdAt: f.createdAt || new Date().toISOString(),
        })).filter(f => f.text),
      });
      onMemoryChange(data && Array.isArray(data.facts) ? data : { facts: [], updatedAt: null });
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const removeFact = async (index) => {
    await persistFacts(facts.filter((_, i) => i !== index));
    if (editingIndex === index) {
      setEditingIndex(null);
      setEditDraft('');
    }
  };

  const startEdit = (index) => {
    setEditingIndex(index);
    setEditDraft(facts[index]?.text || '');
  };

  const saveEdit = async () => {
    if (editingIndex === null || !editDraft.trim()) return;
    const next = facts.map((f, i) =>
      i === editingIndex ? { ...f, text: editDraft.trim() } : f
    );
    await persistFacts(next);
    setEditingIndex(null);
    setEditDraft('');
  };

  const addFact = async () => {
    const text = newFact.trim();
    if (!text) return;
    setSaving(true);
    setError('');
    try {
      const data = await apiPost('/api/agent-memory', { kit: framework, add: [text] });
      onMemoryChange(data && Array.isArray(data.facts) ? data : memory);
      setNewFact('');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="ai-backend-panel ai-memory-panel">
      <div className="ai-backend-title">
        <Brain size={12} /> Project memory
        {facts.length > 0 && (
          <button
            type="button"
            className="ai-mem-forget"
            onClick={onForgetAll}
            disabled={saving}
            title="Forget everything learned"
          >
            <Trash2 size={11} /> Forget all
          </button>
        )}
      </div>

      <p className="ai-memory-intro">
        Facts are injected into every agent request. Edit or remove anything incorrect.
      </p>

      {error && <div className="ai-memory-error">{error}</div>}

      <ul className="ai-mem-list ai-mem-list-editable">
        {facts.map((f, i) => (
          <li key={`${f.createdAt || i}-${i}`} className="ai-mem-item">
            {editingIndex === i ? (
              <div className="ai-mem-edit-row">
                <textarea
                  className="ai-mem-edit-input"
                  value={editDraft}
                  onChange={e => setEditDraft(e.target.value)}
                  rows={2}
                  disabled={saving}
                />
                <div className="ai-mem-edit-actions">
                  <button type="button" className="ai-mem-icon-btn" onClick={saveEdit} disabled={saving} title="Save">
                    <Check size={12} />
                  </button>
                  <button
                    type="button"
                    className="ai-mem-icon-btn"
                    onClick={() => { setEditingIndex(null); setEditDraft(''); }}
                    title="Cancel"
                  >
                    <X size={12} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="ai-mem-view-row">
                <span className="ai-mem-text">{f.text}</span>
                <div className="ai-mem-item-actions">
                  <button type="button" className="ai-mem-icon-btn" onClick={() => startEdit(i)} title="Edit">
                    <Pencil size={11} />
                  </button>
                  <button type="button" className="ai-mem-icon-btn danger" onClick={() => removeFact(i)} disabled={saving} title="Remove">
                    <Trash2 size={11} />
                  </button>
                </div>
              </div>
            )}
          </li>
        ))}
        {facts.length === 0 && (
          <li className="ai-mem-empty">No facts yet — add one below or build something in Edit mode.</li>
        )}
      </ul>

      <div className="ai-mem-add-row">
        <input
          className="ai-mem-add-input"
          value={newFact}
          onChange={e => setNewFact(e.target.value)}
          placeholder="Add a durable fact about this project…"
          disabled={saving}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addFact(); } }}
        />
        <button type="button" className="ai-mem-add-btn" onClick={addFact} disabled={saving || !newFact.trim()}>
          <Plus size={12} /> Add
        </button>
      </div>

      <div className="ai-backend-hint">
        {memory?.updatedAt
          ? `Last updated ${new Date(memory.updatedAt).toLocaleString()}`
          : 'Learned automatically from successful builds.'}
      </div>
    </div>
  );
};

export default AgentMemoryPanel;
