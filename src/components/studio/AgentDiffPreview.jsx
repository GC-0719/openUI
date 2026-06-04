import { useMemo, useState } from 'react';
import { X, FileDiff, Plus, Pencil } from 'lucide-react';
import { countDiffStats } from '../../utils/fileDiff';

const statusLabel = {
  new: 'New',
  modified: 'Modified',
  unchanged: 'Unchanged',
};

const AgentDiffPreview = ({ diffs, applying, onApply, onDiscard }) => {
  const visible = useMemo(
    () => diffs.filter(d => d.status !== 'unchanged'),
    [diffs]
  );
  const list = visible.length ? visible : diffs;
  const [activePath, setActivePath] = useState(list[0]?.path ?? null);
  const active = list.find(d => d.path === activePath) ?? list[0] ?? null;

  const totalStats = useMemo(() => {
    let added = 0;
    let removed = 0;
    for (const d of list) {
      const s = countDiffStats(d.hunks);
      added += s.added;
      removed += s.removed;
    }
    return { added, removed };
  }, [list]);

  return (
    <div
      className="openui-modal-overlay agent-diff-overlay"
      onClick={e => e.target === e.currentTarget && !applying && onDiscard()}
    >
      <div className="openui-modal agent-diff-modal" onClick={e => e.stopPropagation()}>
        <div className="openui-modal-header">
          <span className="openui-modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileDiff size={15} /> Review agent changes
          </span>
          <button
            type="button"
            className="openui-modal-close"
            onClick={onDiscard}
            disabled={applying}
            aria-label="Discard"
          >
            <X size={16} />
          </button>
        </div>

        <p className="agent-diff-intro">
          {list.length} file{list.length !== 1 ? 's' : ''}
          {totalStats.added + totalStats.removed > 0 && (
            <> · <span className="agent-diff-stat-add">+{totalStats.added}</span>
            {' '}
            <span className="agent-diff-stat-remove">−{totalStats.removed}</span> lines</>
          )}
          . Nothing is written until you apply.
        </p>

        <div className="agent-diff-layout">
          <ul className="agent-diff-file-list">
            {list.map(entry => {
              const stats = countDiffStats(entry.hunks);
              const Icon = entry.status === 'new' ? Plus : Pencil;
              return (
                <li key={entry.path}>
                  <button
                    type="button"
                    className={`agent-diff-file-btn${entry.path === active?.path ? ' active' : ''}`}
                    onClick={() => setActivePath(entry.path)}
                  >
                    <Icon size={12} className="agent-diff-file-icon" />
                    <span className="agent-diff-file-name">{entry.path.split('/').pop()}</span>
                    <span className={`agent-diff-badge agent-diff-badge--${entry.status}`}>
                      {statusLabel[entry.status]}
                    </span>
                    {(stats.added > 0 || stats.removed > 0) && (
                      <span className="agent-diff-file-stats">
                        +{stats.added} −{stats.removed}
                      </span>
                    )}
                  </button>
                  <span className="agent-diff-file-path" title={entry.path}>{entry.path}</span>
                </li>
              );
            })}
          </ul>

          <div className="agent-diff-viewer">
            {active ? (
              <>
                <div className="agent-diff-viewer-header">{active.path}</div>
                <pre className="agent-diff-hunks">
                  {active.hunks.map((h, i) => (
                    <div key={`${h.type}-${i}`} className={`agent-diff-line agent-diff-line--${h.type}`}>
                      <span className="agent-diff-gutter">
                        {h.type === 'add' ? '+' : h.type === 'remove' ? '−' : ' '}
                      </span>
                      <code>{h.text || ' '}</code>
                    </div>
                  ))}
                </pre>
              </>
            ) : (
              <p className="agent-diff-empty">No files to preview.</p>
            )}
          </div>
        </div>

        <div className="openui-modal-footer">
          <button type="button" className="ai-settings-btn secondary" onClick={onDiscard} disabled={applying}>
            Discard
          </button>
          <button type="button" className="ai-settings-btn primary" onClick={onApply} disabled={applying}>
            {applying ? 'Applying…' : `Apply ${list.length} file${list.length !== 1 ? 's' : ''}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AgentDiffPreview;
