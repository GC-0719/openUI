import { useEffect, useRef, useState } from 'react';

/**
 * Replaces window.prompt in Studio file tree and similar flows.
 */
const StudioPromptModal = ({
  open,
  title = 'Enter a name',
  description,
  label,
  defaultValue = '',
  placeholder = '',
  submitLabel = 'OK',
  cancelLabel = 'Cancel',
  busy = false,
  onSubmit,
  onCancel,
}) => {
  const [value, setValue] = useState(defaultValue);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setValue(defaultValue);
      queueMicrotask(() => inputRef.current?.focus());
    }
  }, [open, defaultValue]);

  if (!open) return null;

  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSubmit?.(trimmed);
  };

  return (
    <div
      className="openui-modal-overlay studio-dialog-overlay"
      onClick={e => e.target === e.currentTarget && !busy && onCancel?.()}
    >
      <div className="openui-modal studio-prompt-modal" onClick={e => e.stopPropagation()}>
        <div className="openui-modal-header">
          <span className="openui-modal-title">{title}</span>
        </div>
        <div className="openui-modal-body">
          {description && <p className="studio-prompt-desc">{description}</p>}
          {label && <label className="studio-prompt-label">{label}</label>}
          <input
            ref={inputRef}
            type="text"
            className="studio-prompt-input"
            value={value}
            onChange={e => setValue(e.target.value)}
            placeholder={placeholder}
            disabled={busy}
            spellCheck={false}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault();
                submit();
              }
              if (e.key === 'Escape') onCancel?.();
            }}
          />
        </div>
        <div className="openui-modal-footer">
          <button
            type="button"
            className="ai-settings-btn secondary"
            onClick={onCancel}
            disabled={busy}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className="ai-settings-btn primary"
            onClick={submit}
            disabled={busy || !value.trim()}
          >
            {busy ? 'Saving…' : submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudioPromptModal;
