import { useCallback, useEffect, useState } from 'react';
import { X, FolderOpen, Link2, Unlink } from 'lucide-react';
import { apiPost } from '../../utils/api';
import StudioConfirmModal from './StudioConfirmModal';

const OpenWorkspaceModal = ({ framework, onClose, onBound }) => {
  const [status, setStatus] = useState(null);
  const [rootPath, setRootPath] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);

  const loadStatus = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/workspace-bind?kit=${framework}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load workspace status');
      setStatus(data);
      if (data.mode === 'external' && data.externalRoot) {
        setRootPath(data.externalRoot);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [framework]);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  const bind = async () => {
    setBusy(true);
    setError('');
    try {
      const data = await apiPost('/api/workspace-bind', {
        kit: framework,
        action: 'bind',
        rootPath: rootPath.trim(),
      });
      setStatus(data);
      onBound?.(data);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const restoreBuiltin = async () => {
    setShowRestoreConfirm(false);
    setBusy(true);
    setError('');
    try {
      const data = await apiPost('/api/workspace-bind', {
        kit: framework,
        action: 'restore',
      });
      setStatus(data);
      onBound?.(data);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const isExternal = status?.mode === 'external';

  return (
    <div className="openui-modal-overlay" onClick={e => e.target === e.currentTarget && !busy && onClose()}>
      <div className="openui-modal open-workspace-modal" onClick={e => e.stopPropagation()}>
        <div className="openui-modal-header">
          <span className="openui-modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FolderOpen size={15} /> Open existing project
          </span>
          <button type="button" className="openui-modal-close" onClick={onClose} disabled={busy}>
            <X size={16} />
          </button>
        </div>

        <div className="openui-modal-body">
          <p className="open-workspace-intro">
            Point the <strong>{framework}</strong> kit workspace at a folder on your machine.
            openUI replaces <code>kits/{framework}/workspace</code> with a symlink so the agent, file tree,
            and preview all use your real project files. Paths are validated — no traversal outside your chosen root.
          </p>

          {loading ? (
            <p className="open-workspace-muted">Loading…</p>
          ) : (
            <>
              {isExternal && (
                <div className="open-workspace-status open-workspace-status--linked">
                  <Link2 size={14} />
                  <div>
                    <strong>Linked folder</strong>
                    <code className="open-workspace-path">{status.externalRoot}</code>
                  </div>
                </div>
              )}

              {!isExternal && status?.mode === 'builtin' && (
                <div className="open-workspace-status">
                  Using the built-in template workspace inside this openUI install.
                </div>
              )}

              <label className="open-workspace-label" htmlFor="workspace-root-path">
                Absolute path to project folder
              </label>
              <input
                id="workspace-root-path"
                className="open-workspace-input"
                type="text"
                placeholder="/home/you/projects/my-app"
                value={rootPath}
                onChange={e => setRootPath(e.target.value)}
                disabled={busy}
                spellCheck={false}
              />

              {error && <p className="open-workspace-error">{error}</p>}
            </>
          )}
        </div>

        <div className="openui-modal-footer">
          {isExternal && (
            <button
              type="button"
              className="ai-settings-btn secondary"
              onClick={() => setShowRestoreConfirm(true)}
              disabled={busy || loading}
              style={{ marginRight: 'auto' }}
            >
              <Unlink size={14} style={{ marginRight: 6, verticalAlign: -2 }} />
              Use template
            </button>
          )}
          <button type="button" className="ai-settings-btn secondary" onClick={onClose} disabled={busy}>
            Cancel
          </button>
          <button
            type="button"
            className="ai-settings-btn primary"
            onClick={bind}
            disabled={busy || loading || !rootPath.trim()}
          >
            {busy ? 'Linking…' : isExternal ? 'Re-link folder' : 'Link folder'}
          </button>
        </div>
      </div>

      <StudioConfirmModal
        open={showRestoreConfirm}
        title="Use template workspace"
        message="Restore the built-in template workspace? Your linked folder on disk is not deleted, but openUI will stop using it until you bind again."
        confirmLabel="Use template"
        onConfirm={restoreBuiltin}
        onCancel={() => setShowRestoreConfirm(false)}
      />
    </div>
  );
};

export default OpenWorkspaceModal;
