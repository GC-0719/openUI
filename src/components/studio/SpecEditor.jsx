import { useState, useEffect, useCallback } from 'react';
import { Zap, Save, Plus, Trash2, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { useAI } from '../../context/AIContext';
import { componentsMeta, angularComponentsMeta } from '../../data/components-meta.js';

const EMPTY_SPEC = {
  purpose: '',
  useWhen: [''],
  avoidWhen: [''],
  defaultProps: '{}',
  accessibilityNotes: '',
  patterns: [],
};

const EMPTY_PATTERN = { name: '', props: '{}', whenToUse: '' };

function deriveComponentId(filePath) {
  return filePath.split('/').pop()
    .replace(/\.(jsx|js|tsx|ts)$/, '')
    .replace(/\.component$/, '')
    .toLowerCase();
}

function deriveComponentMeta(compId, framework) {
  const data = framework === 'angular' ? angularComponentsMeta : componentsMeta;
  const comp = data.find(c => c.id === compId || c.name.toLowerCase() === compId);
  if (!comp) return { name: compId, description: '', classes: [], variants: [] };
  const classes = [];
  const variants = [];
  comp.variants?.forEach(v => {
    if (v.name) variants.push(v.name);
  });
  return { name: comp.name, description: comp.description || '', classes, variants };
}

const DynamicList = ({ label, items, onChange, placeholder }) => {
  const update = (i, val) => {
    const next = [...items];
    next[i] = val;
    onChange(next);
  };
  const add = () => onChange([...items, '']);
  const remove = (i) => onChange(items.filter((_, idx) => idx !== i));

  return (
    <div className="spec-field">
      <label className="spec-label">{label}</label>
      {items.map((item, i) => (
        <div key={i} className="spec-list-row">
          <input
            className="spec-input"
            value={item}
            onChange={e => update(i, e.target.value)}
            placeholder={placeholder}
          />
          <button className="spec-icon-btn" onClick={() => remove(i)} title="Remove" disabled={items.length <= 1}>
            <Trash2 size={12} />
          </button>
        </div>
      ))}
      <button className="spec-add-btn" onClick={add}>
        <Plus size={11} /> Add
      </button>
    </div>
  );
};

const PatternRow = ({ pattern, onChange, onRemove, index }) => {
  const [open, setOpen] = useState(index === 0);
  return (
    <div className="spec-pattern-card">
      <div className="spec-pattern-header" onClick={() => setOpen(v => !v)}>
        <span className="spec-pattern-name">{pattern.name || `Pattern ${index + 1}`}</span>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button className="spec-icon-btn" onClick={e => { e.stopPropagation(); onRemove(); }} title="Remove">
            <Trash2 size={11} />
          </button>
          {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </div>
      </div>
      {open && (
        <div className="spec-pattern-body">
          <div className="spec-field">
            <label className="spec-label">Name</label>
            <input className="spec-input" value={pattern.name}
              onChange={e => onChange({ ...pattern, name: e.target.value })} placeholder="Primary CTA" />
          </div>
          <div className="spec-field">
            <label className="spec-label">Props (JSON)</label>
            <textarea className="spec-textarea spec-mono" rows={2} value={pattern.props}
              onChange={e => onChange({ ...pattern, props: e.target.value })}
              placeholder='{"variant": "primary"}' />
          </div>
          <div className="spec-field">
            <label className="spec-label">When to use</label>
            <input className="spec-input" value={pattern.whenToUse}
              onChange={e => onChange({ ...pattern, whenToUse: e.target.value })}
              placeholder="Use when the action is the primary CTA on the page" />
          </div>
        </div>
      )}
    </div>
  );
};

const SpecEditor = ({ filePath, framework = 'react' }) => {
  const { settings, specs, updateSpec } = useAI();
  const [form, setForm] = useState(EMPTY_SPEC);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [savedAt, setSavedAt] = useState(null);
  const [genError, setGenError] = useState('');

  const compId = filePath ? deriveComponentId(filePath) : null;
  const meta = compId ? deriveComponentMeta(compId, framework) : null;

  useEffect(() => {
    if (!compId) return;
    const existing = specs[compId];
    if (existing) {
      setForm({
        purpose: existing.purpose || '',
        useWhen: existing.useWhen?.length ? existing.useWhen : [''],
        avoidWhen: existing.avoidWhen?.length ? existing.avoidWhen : [''],
        defaultProps: JSON.stringify(existing.defaultProps ?? {}, null, 2),
        accessibilityNotes: existing.accessibilityNotes || '',
        patterns: (existing.patterns || []).map(p => ({
          name: p.name || '',
          props: JSON.stringify(p.props ?? {}, null, 2),
          whenToUse: p.whenToUse || '',
        })),
      });
    } else {
      setForm(EMPTY_SPEC);
    }
    setSavedAt(null);
    setGenError('');
  }, [compId, specs]);

  const handleSave = useCallback(async () => {
    if (!compId) return;
    setSaving(true);
    try {
      let defaultProps = {};
      try { defaultProps = JSON.parse(form.defaultProps); } catch { /* keep empty */ }
      const aiSpec = {
        purpose: form.purpose,
        useWhen: form.useWhen.filter(Boolean),
        avoidWhen: form.avoidWhen.filter(Boolean),
        defaultProps,
        accessibilityNotes: form.accessibilityNotes,
        patterns: form.patterns.map(p => {
          let props = {};
          try { props = JSON.parse(p.props); } catch { /* keep empty */ }
          return { name: p.name, props, whenToUse: p.whenToUse };
        }),
      };
      const isKitComponent = filePath?.includes('/components/ui/');
      await updateSpec(compId, aiSpec, {
        kit: framework,
        scope: isKitComponent ? 'workspace' : 'global',
      });
      setSavedAt(Date.now());
    } finally {
      setSaving(false);
    }
  }, [compId, form, updateSpec]);

  const isConfigured = settings.provider === 'local'
    ? Boolean(settings.baseUrl?.trim() && settings.model?.trim())
    : Boolean(settings.apiKey?.trim());

  const handleAIGenerate = useCallback(async () => {
    if (!compId || !isConfigured) {
      setGenError('Configure an AI provider in Settings first.');
      return;
    }
    setGenerating(true);
    setGenError('');
    try {
      const res = await fetch('/api/ai-spec-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          componentId: compId,
          componentName: meta?.name || compId,
          description: meta?.description || '',
          classes: meta?.classes || [],
          variants: meta?.variants || [],
          provider: settings.provider,
          model: settings.model,
          apiKey: settings.apiKey,
          baseUrl: settings.baseUrl,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      const s = data.aiSpec;
      setForm({
        purpose: s.purpose || '',
        useWhen: s.useWhen?.length ? s.useWhen : [''],
        avoidWhen: s.avoidWhen?.length ? s.avoidWhen : [''],
        defaultProps: JSON.stringify(s.defaultProps ?? {}, null, 2),
        accessibilityNotes: s.accessibilityNotes || '',
        patterns: (s.patterns || []).map(p => ({
          name: p.name || '',
          props: JSON.stringify(p.props ?? {}, null, 2),
          whenToUse: p.whenToUse || '',
        })),
      });
    } catch (err) {
      setGenError(err.message);
    } finally {
      setGenerating(false);
    }
  }, [compId, meta, settings]);

  if (!filePath || !compId) {
    return (
      <div className="spec-empty">
        <Sparkles size={28} opacity={0.3} />
        <span>Open a component file to edit its AI spec</span>
      </div>
    );
  }

  return (
    <div className="spec-editor">
      <div className="spec-editor-header">
        <div>
          <div className="spec-editor-title">{meta?.name || compId}</div>
          <div className="spec-editor-subtitle">Component Intelligence Spec</div>
        </div>
        <button
          className={`spec-gen-btn${generating ? ' loading' : ''}`}
          onClick={handleAIGenerate}
          disabled={generating || !isConfigured}
          title={!isConfigured ? 'Configure AI provider in Settings' : 'Generate spec with AI'}
        >
          {generating
            ? <span className="ai-thinking-dots"><span /><span /><span /></span>
            : <Zap size={13} />}
          {generating ? 'Generating…' : 'AI Generate'}
        </button>
      </div>

      {genError && <div className="spec-error">{genError}</div>}

      <div className="spec-editor-scroll">
        <div className="spec-field">
          <label className="spec-label">Purpose</label>
          <textarea
            className="spec-textarea"
            rows={2}
            value={form.purpose}
            onChange={e => setForm(f => ({ ...f, purpose: e.target.value }))}
            placeholder="Any user-triggered action that causes a state change"
          />
        </div>

        <DynamicList
          label="Use When"
          items={form.useWhen}
          onChange={v => setForm(f => ({ ...f, useWhen: v }))}
          placeholder="form submission, triggering a modal…"
        />

        <DynamicList
          label="Avoid When"
          items={form.avoidWhen}
          onChange={v => setForm(f => ({ ...f, avoidWhen: v }))}
          placeholder="navigation — use NavItem instead"
        />

        <div className="spec-field">
          <label className="spec-label">Default Props (JSON)</label>
          <textarea
            className="spec-textarea spec-mono"
            rows={3}
            value={form.defaultProps}
            onChange={e => setForm(f => ({ ...f, defaultProps: e.target.value }))}
            placeholder='{ "variant": "primary", "size": "md" }'
          />
        </div>

        <div className="spec-field">
          <label className="spec-label">Accessibility Notes</label>
          <textarea
            className="spec-textarea"
            rows={2}
            value={form.accessibilityNotes}
            onChange={e => setForm(f => ({ ...f, accessibilityNotes: e.target.value }))}
            placeholder="Provide meaningful label text. Use aria-label for icon-only usage."
          />
        </div>

        <div className="spec-field">
          <div className="spec-label-row">
            <label className="spec-label">Patterns</label>
            <button className="spec-add-btn" onClick={() => setForm(f => ({ ...f, patterns: [...f.patterns, { ...EMPTY_PATTERN }] }))}>
              <Plus size={11} /> Add pattern
            </button>
          </div>
          {form.patterns.length === 0 && (
            <div className="spec-patterns-empty">No patterns yet. Add one to describe specific usage scenarios.</div>
          )}
          {form.patterns.map((p, i) => (
            <PatternRow
              key={i}
              index={i}
              pattern={p}
              onChange={updated => setForm(f => ({ ...f, patterns: f.patterns.map((x, idx) => idx === i ? updated : x) }))}
              onRemove={() => setForm(f => ({ ...f, patterns: f.patterns.filter((_, idx) => idx !== i) }))}
            />
          ))}
        </div>
      </div>

      <div className="spec-editor-footer">
        {savedAt && <span className="spec-saved-notice">Saved</span>}
        <button
          className="spec-save-btn"
          onClick={handleSave}
          disabled={saving}
        >
          <Save size={13} />
          {saving ? 'Saving…' : 'Save Spec'}
        </button>
      </div>
    </div>
  );
};

export default SpecEditor;
