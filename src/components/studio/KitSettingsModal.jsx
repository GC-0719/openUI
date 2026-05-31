import React, { useState } from 'react';
import { X, AlertTriangle, Check, Loader, Pen } from 'lucide-react';
import { useAI } from '../../context/AIContext';

const KitSettingsModal = ({ onClose }) => {
  const { kit, updateKit } = useAI();
  const [name, setName] = useState(kit.kitName);
  const [prefix, setPrefix] = useState(kit.kitPrefix);
  const [renaming, setRenaming] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const derivedPrefix = name
    .trim()
    .split(/\s+/)
    .map(w => w[0]?.toLowerCase() || '')
    .join('')
    .replace(/[^a-z]/g, '')
    .slice(0, 4) || 'ui';

  const handleAutoPrefix = () => setPrefix(derivedPrefix);

  const apply = async () => {
    const cleanPrefix = prefix.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    const cleanName = name.trim();
    if (!cleanPrefix || !cleanName) return;

    setRenaming(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch('/api/rename', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          oldPrefix: kit.kitPrefix,
          newPrefix: cleanPrefix,
          kitName: cleanName,
          oldKitName: kit.kitName,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      updateKit({ kitName: cleanName, kitPrefix: cleanPrefix });
      setResult(data.changed || []);
    } catch (err) {
      setError(err.message);
    }
    setRenaming(false);
  };

  const unchanged = name === kit.kitName && prefix === kit.kitPrefix;

  return (
    <div className="openui-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="openui-modal" style={{ width: '460px' }}>
        <div className="openui-modal-header">
          <span className="openui-modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Pen size={15} /> Kit Settings
          </span>
          <button className="openui-modal-close" onClick={onClose}><X size={16} /></button>
        </div>

        <div className="openui-modal-body">
          <div className="kit-settings-grid">
            <div className="ai-settings-section">
              <label className="ai-settings-label">Kit Name</label>
              <input
                className="ai-settings-input"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="openUI"
              />
            </div>
            <div className="ai-settings-section">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label className="ai-settings-label" style={{ marginBottom: 0 }}>CSS Prefix</label>
                <button
                  style={{ fontSize: '11px', color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                  onClick={handleAutoPrefix}
                  title="Auto-derive from kit name"
                >
                  auto
                </button>
              </div>
              <input
                className="ai-settings-input"
                value={prefix}
                onChange={e => setPrefix(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''))}
                placeholder="l"
                maxLength={6}
              />
            </div>
          </div>

          <div className="kit-preview-row" style={{ marginTop: '14px' }}>
            <span style={{ color: 'var(--text-dim)', fontSize: '11px' }}>Preview:</span>
            <div className="kit-prefix-preview">
              {['btn-primary', 'card', 'badge-success', 'input'].map(cls => (
                <code key={cls}>.{prefix || 'ou'}-{cls}</code>
              ))}
            </div>
          </div>

          {!unchanged && (
            <div className="kit-rename-warning" style={{ marginTop: '14px' }}>
              <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: '1px' }} />
              <span>
                This will find-and-replace <strong>{kit.kitPrefix}-</strong> → <strong>{prefix || 'ou'}-</strong> across
                all component JSX files, styles, and the live demo. Make sure your dev server is running.
              </span>
            </div>
          )}

          {result !== null && (
            <div className="kit-rename-changed">
              <strong style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Check size={13} /> Rename complete — {result.length} file{result.length !== 1 ? 's' : ''} updated
              </strong>
              {result.length > 0 && (
                <ul>
                  {result.map(f => <li key={f}>{f}</li>)}
                </ul>
              )}
            </div>
          )}

          {error && (
            <div className="ai-test-result err" style={{ marginTop: '12px' }}>
              {error}
            </div>
          )}
        </div>

        <div className="openui-modal-footer">
          <button className="ai-settings-cancel" onClick={onClose}>Cancel</button>
          <button
            className="ai-settings-save"
            onClick={apply}
            disabled={renaming || unchanged}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            {renaming
              ? <><Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> Renaming…</>
              : result !== null
                ? <><Check size={14} /> Done</>
                : 'Apply Rename'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default KitSettingsModal;
