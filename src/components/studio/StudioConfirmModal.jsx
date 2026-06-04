import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';

/**
 * Replaces window.confirm in Studio — same openui-modal shell as settings/export.
 */
const StudioConfirmModal = ({
  open,
  title = 'Confirm',
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  danger = false,
  busy: busyProp = false,
  onConfirm,
  onCancel,
}) => {
  const [busy, setBusy] = useState(false);
  if (!open) return null;

  const handleConfirm = async () => {
    setBusy(true);
    try {
      await onConfirm?.();
    } finally {
      setBusy(false);
    }
  };

  const isBusy = busy || busyProp;

  return (
    <div
      className="openui-modal-overlay studio-dialog-overlay"
      onClick={e => e.target === e.currentTarget && !isBusy && onCancel?.()}
    >
      <div
        className="openui-modal studio-confirm-modal"
        role="alertdialog"
        aria-labelledby="studio-confirm-title"
        aria-describedby="studio-confirm-desc"
        onClick={e => e.stopPropagation()}
      >
        <div className="openui-modal-header">
          <span
            id="studio-confirm-title"
            className="openui-modal-title"
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            {danger && <AlertTriangle size={16} className="studio-confirm-icon-danger" />}
            {title}
          </span>
        </div>
        <div className="openui-modal-body">
          <p id="studio-confirm-desc" className="studio-confirm-message">
            {message}
          </p>
        </div>
        <div className="openui-modal-footer">
          <button
            type="button"
            className="ai-settings-btn secondary"
            onClick={onCancel}
            disabled={isBusy}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`ai-settings-btn primary${danger ? ' danger' : ''}`}
            onClick={handleConfirm}
            disabled={isBusy}
          >
            {isBusy ? 'Working…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudioConfirmModal;
