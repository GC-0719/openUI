import { useState } from 'react';
import { X, Boxes } from 'lucide-react';
import { apiPost } from '../../utils/api';

const AddComponentModal = ({ framework, onClose, onCreated }) => {
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    setBusy(true);
    setError('');
    try {
      const data = await apiPost('/api/register-component', {
        kit: framework,
        name: name.trim(),
      });
      onCreated?.(data);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="openui-modal-overlay" onClick={e => e.target === e.currentTarget && !busy && onClose()}>
      <div className="openui-modal add-component-modal" onClick={e => e.stopPropagation()}>
        <div className="openui-modal-header">
          <span className="openui-modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Boxes size={15} /> New kit component
          </span>
          <button type="button" className="openui-modal-close" onClick={onClose} disabled={busy}>
            <X size={16} />
          </button>
        </div>

        <div className="openui-modal-body">
          <p className="add-component-intro">
            Creates <code>src/components/ui/&lt;Name&gt;</code>, appends the UI barrel export, and seeds
            <code>.openui/specs.json</code> so the agent sees your component. Refine the spec in the
            <strong> Spec</strong> tab after opening the file.
          </p>
          <label className="add-component-label" htmlFor="component-name">PascalCase name</label>
          <input
            id="component-name"
            className="add-component-input"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="StatCard"
            disabled={busy}
            spellCheck={false}
            onKeyDown={e => e.key === 'Enter' && submit()}
          />
          {error && <p className="add-component-error">{error}</p>}
        </div>

        <div className="openui-modal-footer">
          <button type="button" className="ai-settings-btn secondary" onClick={onClose} disabled={busy}>
            Cancel
          </button>
          <button
            type="button"
            className="ai-settings-btn primary"
            onClick={submit}
            disabled={busy || !name.trim()}
          >
            {busy ? 'Creating…' : 'Create component'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddComponentModal;
