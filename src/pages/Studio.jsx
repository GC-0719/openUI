import { lazy, Suspense, useState, useEffect, useCallback, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Eye, Code2, Download, Settings, RotateCcw, RefreshCcw, PanelLeft, X, Sparkles, ShieldCheck, Bot, Monitor, Laptop, Tablet, Smartphone } from 'lucide-react';
import { useAI } from '../context/AIContext';
import AIAgent from '../components/studio/AIAgent';
import FileExplorer from '../components/studio/FileExplorer';
import CodeEditor from '../components/studio/CodeEditor';
import ComponentPreview from '../components/studio/ComponentPreview';
import SpecEditor from '../components/studio/SpecEditor';
import AuditPanel from '../components/studio/AuditPanel';
import ErrorBoundary from '../components/studio/ErrorBoundary';
import { BrandLogo, Wordmark } from '../components/BrandLogo';
import { apiFetch, apiPost } from '../utils/api';
import '../styles/studio.css';
import '../styles/docs.css';

const KitSettingsModal = lazy(() => import('../components/studio/KitSettingsModal'));
const AISettingsModal = lazy(() => import('../components/docs/AISettingsModal'));
const ExportModal = lazy(() => import('../components/docs/ExportModal'));
const angularPreviewEnabled = import.meta.env.VITE_OPENUI_ANGULAR === '1';

const Studio = () => {
  const { kit, specsError, retrySpecsLoad } = useAI();
  const [saveError, setSaveError] = useState('');
  const { framework: fwParam } = useParams();
  const navigate = useNavigate();
  const framework = fwParam === 'angular' ? 'angular' : 'react';

  const [openFiles, setOpenFiles] = useState([]);
  const [activeFilePath, setActiveFilePath] = useState(null);

  const [centerTab, setCenterTab] = useState('preview');
  const [showKitSettings, setShowKitSettings] = useState(false);
  const [showAISettings, setShowAISettings] = useState(false);
  const [aiSettingsTab, setAiSettingsTab] = useState('ai');
  const [showExport, setShowExport] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);
  const [resetting, setResetting] = useState(false);
  const [showExplorer, setShowExplorer] = useState(true);
  const [explorerWidth, setExplorerWidth] = useState(220);
  const [showAgent, setShowAgent] = useState(true);
  const [agentWidth, setAgentWidth] = useState(340);
  const [isDragging, setIsDragging] = useState(false);
  const [previewW, setPreviewW] = useState(null); // null = full width; else device px

  // Generated pages from agent
  const [agentPages, setAgentPages] = useState([]);
  const [activeAgentPage, setActiveAgentPage] = useState(null);

  // Incremented on every file write — triggers FileExplorer + AIAgent workspace refresh
  const [filesVersion, setFilesVersion] = useState(0);

  // Undo / redo stacks — each entry: { description, changes: [{path, before, after}] }
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  // Refs so undo/redo keyboard handler always sees latest stacks without re-subscribing
  const undoRef = useRef(undoStack);
  const redoRef = useRef(redoStack);
  useEffect(() => { undoRef.current = undoStack; }, [undoStack]);
  useEffect(() => { redoRef.current = redoStack; }, [redoStack]);

  const activeFile = openFiles.find(f => f.path === activeFilePath) ?? null;
  const anyDirty = openFiles.some(f => f.dirty);
  const isComponentFile = activeFilePath?.includes('/components/ui/') ?? false;

  // ── Resize drag ──────────────────────────────────────────────────────────
  // Generic horizontal drag. `dir` = +1 when the handle is on the panel's right
  // edge (explorer), -1 when on its left edge (agent panel).
  const makeDrag = useCallback((getWidth, setWidth, dir, min, max) => (e) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = getWidth();
    setIsDragging(true);
    const onMove = (ev) => setWidth(Math.max(min, Math.min(max, startWidth + dir * (ev.clientX - startX))));
    const onUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }, []);

  const startDrag = makeDrag(() => explorerWidth, setExplorerWidth, 1, 160, 480);
  const startAgentDrag = makeDrag(() => agentWidth, setAgentWidth, -1, 300, 620);

  // ── Reset open files when switching framework ────────────────────────────
  useEffect(() => {
    setOpenFiles([]);
    setActiveFilePath(null);
    setCenterTab('preview');
    setPreviewKey(k => k + 1);
    setAgentPages([]);
    setActiveAgentPage(null);
  }, [framework]);

  // ── Open / switch file ───────────────────────────────────────────────────
  const openFile = useCallback(async (path) => {
    setActiveFilePath(path);
    const isComponent = path.includes('/components/ui/') && !path.endsWith('index.jsx') && !path.endsWith('index.ts');

    const isPageFile = framework === 'angular'
      ? (path.includes('/pages/') || path.includes('/app/')) &&
        path.endsWith('.component.ts') &&
        !path.includes('showcase')
      : path.startsWith('src/pages/') &&
        path.endsWith('.jsx') &&
        !path.includes('Dashboard') &&
        !path.includes('ComponentShowcase');

    if (isComponent) {
      setActiveAgentPage(null);
    } else if (isPageFile) {
      const name = path.split('/').pop()
        .replace(/\.component\.ts$/, '')
        .replace(/\.jsx$/, '');
      setAgentPages(prev => prev.includes(name) ? prev : [...prev, name]);
      setActiveAgentPage(name);
    }

    setOpenFiles(prev => {
      if (prev.find(f => f.path === path)) return prev;
      return [...prev, { path, content: null, loading: true, dirty: false, pendingContent: null }];
    });

    try {
      const res = await fetch(`/api/read-file?path=${encodeURIComponent(path)}&kit=${framework}`);
      const data = await res.json();
      const content = data.error ? '// Could not read file' : data.content;
      setOpenFiles(prev => prev.map(f => f.path === path ? { ...f, content, loading: false } : f));
    } catch {
      setOpenFiles(prev => prev.map(f => f.path === path ? { ...f, content: '// Could not read file', loading: false } : f));
    }
  }, [framework]);

  const closeTab = useCallback((path, e) => {
    e?.stopPropagation();
    setOpenFiles(prev => {
      const next = prev.filter(f => f.path !== path);
      if (activeFilePath === path) {
        const idx = prev.findIndex(f => f.path === path);
        setActiveFilePath((next[idx] ?? next[idx - 1] ?? null)?.path ?? null);
      }
      return next;
    });
  }, [activeFilePath]);

  // ── Dirty tracking ───────────────────────────────────────────────────────
  const handleDirtyChange = useCallback((isDirty, editedContent, filePath) => {
    setOpenFiles(prev => prev.map(f =>
      f.path === filePath ? { ...f, dirty: isDirty, pendingContent: isDirty ? editedContent : null } : f
    ));
  }, []);

  // ── Save ─────────────────────────────────────────────────────────────────
  const handleFileSave = async (filePath, content) => {
    try {
      await apiPost('/api/write-file', { path: filePath, content, kit: framework });
      setSaveError('');
      setOpenFiles(prev => prev.map(f =>
        f.path === filePath ? { ...f, content, dirty: false, pendingContent: null } : f
      ));
      setPreviewKey(k => k + 1);
    } catch (err) {
      setSaveError(err.message || 'Save failed');
    }
  };

  const saveAllDirty = async () => {
    const dirty = openFiles.filter(f => f.dirty && f.pendingContent !== null);
    if (!dirty.length) return true;
    const failures = [];
    await Promise.all(dirty.map(async (f) => {
      try {
        await apiPost('/api/write-file', { path: f.path, content: f.pendingContent, kit: framework });
        setOpenFiles(prev => prev.map(o =>
          o.path === f.path ? { ...o, content: f.pendingContent, dirty: false, pendingContent: null } : o
        ));
      } catch (err) {
        failures.push(`${f.path.split('/').pop()}: ${err.message}`);
      }
    }));
    if (failures.length) {
      setSaveError(failures.join(' · '));
      return false;
    }
    setSaveError('');
    return true;
  };

  // ── Preview / Run ────────────────────────────────────────────────────────
  const handleRun = () => setPreviewKey(k => k + 1);

  const handleRunAndPreview = async () => {
    await saveAllDirty();
    setCenterTab('preview');
    setPreviewKey(k => k + 1);
  };

  // ── Reset template ───────────────────────────────────────────────────────
  const handleResetTemplate = async () => {
    if (!window.confirm('Reset the workspace to the original template? All your edits will be lost.')) return;
    setResetting(true);
    try {
      await fetch('/api/reset-template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kit: framework }),
      });
      setOpenFiles([]);
      setActiveFilePath(null);
      setAgentPages([]);
      setActiveAgentPage(null);
      setPreviewKey(k => k + 1);
    } finally {
      setResetting(false);
    }
  };

  // ── Guard: component files must keep their expected named export ─────────
  const guardExport = (path, content) => {
    const isReactComp = path.includes('/components/ui/') && path.endsWith('.jsx');
    const isAngularComp = path.includes('/components/ui/') && path.endsWith('.component.ts');
    if (!isReactComp && !isAngularComp) return content;
    const expectedName = path.split('/').pop()
      .replace(/\.component\.ts$/, '')
      .replace(/\.jsx$/, '');
    if (isAngularComp) {
      if (new RegExp(`export\\s+class\\s+${expectedName}\\b`).test(content)) return content;
      return content.replace(/export\s+class\s+([A-Z]\w*)\b/, `export class ${expectedName}`);
    }
    // Already correct — nothing to do
    if (new RegExp(`export\\s+(?:const|function)\\s+${expectedName}\\b`).test(content)) return content;
    // Find the first PascalCase component export and rename it to the expected name
    return content.replace(
      /export\s+(const|function)\s+([A-Z]\w*)\b/,
      (_, kw) => `export ${kw} ${expectedName}`
    );
  };

  // ── Core write helper — reads before-state for undo, then writes ────────
  const writeFiles = useCallback(async (files) => {
    // Ensure component exports always match their filename
    const safeFiles = Object.fromEntries(
      Object.entries(files).map(([path, content]) => [path, guardExport(path, content)])
    );
    const entries = Object.entries(safeFiles);

    // Snapshot current content of every file before overwriting
    const beforeStates = await Promise.all(
      entries.map(([path]) =>
        fetch(`/api/read-file?path=${encodeURIComponent(path)}&kit=${framework}`)
          .then(r => r.json())
          .then(d => ({ path, before: d.error ? null : d.content }))
          .catch(() => ({ path, before: null }))
      )
    );

    const writeErrors = [];
    await Promise.all(
      entries.map(async ([path, content]) => {
        try {
          await apiPost('/api/write-file', { path, content, kit: framework });
        } catch (err) {
          writeErrors.push(`${path}: ${err.message}`);
        }
      })
    );
    if (writeErrors.length) {
      setSaveError(writeErrors.join(' · '));
      throw new Error(writeErrors.join(' · '));
    }
    setSaveError('');

    setFilesVersion(v => v + 1);

    // Push onto undo stack (cap at 20 entries), clear redo
    const changeSet = beforeStates.map(({ path, before }) => ({
      path, before, after: files[path],
    }));
    setUndoStack(prev => [...prev.slice(-19), { changes: changeSet }]);
    setRedoStack([]);

    // Sync open editor tabs
    entries.forEach(([path, content]) => {
      setOpenFiles(prev => prev.map(f =>
        f.path === path ? { ...f, content, dirty: false, pendingContent: null } : f
      ));
    });

    return entries.map(([path]) => path);
  }, [framework]);

  // ── Undo / Redo ──────────────────────────────────────────────────────────
  const undo = useCallback(async () => {
    const stack = undoRef.current;
    if (!stack.length) return;
    const entry = stack[stack.length - 1];
    await Promise.all(
      entry.changes.map(c => {
        if (c.before === null) {
          // File was newly created — delete it on undo
          return fetch('/api/delete-file', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ path: c.path, kit: framework }),
          }).then(() => setOpenFiles(prev => prev.filter(f => f.path !== c.path)));
        }
        return fetch('/api/write-file', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: c.path, content: c.before, kit: framework }),
        }).then(() => setOpenFiles(prev => prev.map(f =>
          f.path === c.path ? { ...f, content: c.before, dirty: false, pendingContent: null } : f
        )));
      })
    );
    setRedoStack(prev => [...prev, entry]);
    setUndoStack(prev => prev.slice(0, -1));
    setFilesVersion(v => v + 1);
    setPreviewKey(k => k + 1);
  }, [framework]);

  const redo = useCallback(async () => {
    const stack = redoRef.current;
    if (!stack.length) return;
    const entry = stack[stack.length - 1];
    await Promise.all(
      entry.changes.map(c =>
        fetch('/api/write-file', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: c.path, content: c.after, kit: framework }),
        }).then(() => setOpenFiles(prev => prev.map(f =>
          f.path === c.path ? { ...f, content: c.after, dirty: false, pendingContent: null } : f
        )))
      )
    );
    setUndoStack(prev => [...prev, entry]);
    setRedoStack(prev => prev.slice(0, -1));
    setPreviewKey(k => k + 1);
  }, [framework]);

  // Keyboard shortcuts: ⌘Z / ⌘⇧Z — skip when focus is in a text input
  useEffect(() => {
    const handler = (e) => {
      if (!(e.metaKey || e.ctrlKey) || e.key !== 'z') return;
      const tag = e.target?.tagName;
      if (tag === 'TEXTAREA' || tag === 'INPUT') return;
      e.preventDefault();
      if (e.shiftKey) redo(); else undo();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [undo, redo]);

  // ── Agent file writes ────────────────────────────────────────────────────
  const handleFilesWritten = useCallback(async (files) => {
    const BARREL = framework === 'angular'
      ? 'src/components/ui/index.ts'
      : 'src/components/ui/index.jsx';
    const compExt = framework === 'angular' ? '.ts' : '.jsx';
    const barrelIndex = framework === 'angular' ? 'index.ts' : 'index.jsx';

    // Auto-add new components to the barrel if the agent didn't write it
    if (!files[BARREL]) {
      const newCompPaths = Object.keys(files).filter(p =>
        p.startsWith('src/components/ui/') && p.endsWith(compExt) && !p.endsWith(barrelIndex)
      );
      if (newCompPaths.length > 0) {
        try {
          const barrelData = await apiFetch(`/api/read-file?path=${encodeURIComponent(BARREL)}&kit=${framework}`);
          let barrel = barrelData.content || '';
          let updated = false;
          for (const cp of newCompPaths) {
            const name = cp.split('/').pop().replace(compExt, '');
            if (!barrel.includes(`'./${name}'`) && !barrel.includes(`"./${name}"`)) {
              barrel = barrel.trimEnd() + `\nexport * from './${name}';`;
              updated = true;
            }
          }
          if (updated) files = { ...files, [BARREL]: barrel };
        } catch { /* barrel read failed — agent may have omitted exports */ }
      }
    }

    const paths = await writeFiles(files);

    // Probe Vite's transform pipeline for each written source file.
    const parseErrors = [];
    const sourcePaths = paths.filter(p =>
      p.endsWith('.jsx') || p.endsWith('.tsx') || p.endsWith('.ts')
    );
    await Promise.all(sourcePaths.map(async (p) => {
      try {
        const r = await fetch(`/kits/${framework}/workspace/${p}?t=${Date.now()}`);
        if (!r.ok) {
          const body = await r.text();
          const match = body.match(/(?:Error:|PARSE_ERROR[^\n]*\n?)([^\n<]{10,200})/);
          const msg = match?.[1]?.trim() || `Parse error in ${p.split('/').pop()} (HTTP ${r.status})`;
          parseErrors.push({ path: p, error: msg });
        }
      } catch { /* network error — skip */ }
    }));

    const newPages = paths
      .filter(p => {
        if (p.includes('Dashboard') || p.includes('BuilderOutput') || p.includes('showcase')) return false;
        if (framework === 'angular') {
          return (p.includes('/pages/') || p.includes('/app/')) && p.endsWith('.component.ts');
        }
        return p.includes('/pages/') && p.endsWith('.jsx');
      })
      .map(p => {
        const base = p.split('/').pop();
        return base.replace(/\.component\.ts$/, '').replace(/\.jsx$/, '');
      });

    if (newPages.length > 0) {
      setAgentPages(prev => {
        const merged = [...prev];
        newPages.forEach(name => { if (!merged.includes(name)) merged.push(name); });
        return merged;
      });
      setActiveAgentPage(newPages[0]);
      setCenterTab('preview');
    }
    setPreviewKey(k => k + 1);
    return { parseErrors };
  }, [writeFiles, framework]);

  const handleNavigatePage = useCallback((pageName) => {
    setActiveAgentPage(pageName);
    setCenterTab('preview');
    setPreviewKey(k => k + 1);
  }, []);

  // ── File-tree mutations (create / rename / delete from the explorer) ───────
  const handleTreeMutate = useCallback((info) => {
    setFilesVersion(v => v + 1);
    if (info?.type === 'delete') {
      const under = (p) => p === info.path || p.startsWith(info.path + '/');
      setOpenFiles(prev => prev.filter(f => !under(f.path)));
      setActiveFilePath(prev => (prev && under(prev) ? null : prev));
      setPreviewKey(k => k + 1);
    } else if (info?.type === 'rename') {
      const remap = (p) =>
        p === info.path ? info.to
        : p.startsWith(info.path + '/') ? info.to + p.slice(info.path.length)
        : p;
      setOpenFiles(prev => prev.map(f => ({ ...f, path: remap(f.path) })));
      setActiveFilePath(prev => (prev ? remap(prev) : prev));
      setPreviewKey(k => k + 1);
    }
  }, []);

  const removeAgentPage = (name) => {
    setAgentPages(prev => {
      const next = prev.filter(p => p !== name);
      if (activeAgentPage === name) setActiveAgentPage(next[0] ?? null);
      return next;
    });
  };

  // ── Export ───────────────────────────────────────────────────────────────
  const handleExportClick = async () => {
    await saveAllDirty();
    setShowExport(true);
  };

  const fileName = (path) => path.split('/').pop();

  // Preview URL — use agent page route when one is active.
  // Angular gets ?t= cache-buster so Vite serves fresh CSS on every save.
  const previewSrc = activeAgentPage
    ? `/preview/kit-preview.html#/ai/${activeAgentPage}`
    : framework === 'angular'
      ? `/preview/angular-app.html?t=${previewKey}`
      : '/preview/kit-preview.html';

  const openSettings = useCallback((tab = 'ai') => {
    setAiSettingsTab(tab);
    setShowAISettings(true);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>

      {/* ── Top Bar ── */}
      <div className="studio-topbar">
        <Link to="/" className="studio-topbar-brand">
          <BrandLogo size={24} />
          <Wordmark size={15} />
        </Link>
        <div className="studio-topbar-sep" />

        <button
          className="studio-fw-badge"
          onClick={() => navigate('/')}
          title="Switch framework"
        >
          <span className={`studio-fw-dot studio-fw-dot-${framework}`} />
          {framework === 'react' ? 'React' : 'Angular'}
          <span className="studio-fw-switch">switch</span>
        </button>

        <div className="studio-topbar-sep" />
        <button className="studio-topbar-kit-badge" onClick={() => setShowKitSettings(true)}>
          <span style={{ fontSize: '11px', opacity: 0.7 }}>Kit:</span>
          <strong style={{ fontSize: '12px' }}>{kit.kitName}</strong>
          <span style={{ fontSize: '10px', opacity: 0.6 }}>.{kit.kitPrefix}-</span>
        </button>

        <div className="studio-topbar-spacer" />
        <div className="studio-topbar-actions">
          {anyDirty && <span className="studio-unsaved-notice" title="Unsaved changes">● unsaved</span>}
          {saveError && <span className="studio-save-error" title={saveError}>{saveError}</span>}
          {specsError && (
            <button
              type="button"
              className="studio-specs-warning"
              title={specsError}
              onClick={retrySpecsLoad}
            >
              Specs unavailable — retry
            </button>
          )}

          <button className="studio-icon-btn" onClick={handleResetTemplate} disabled={resetting} title="Reset workspace">
            <RefreshCcw size={15} />
          </button>
          <button
            className={`studio-icon-btn${showAgent ? ' panel-active' : ''}`}
            onClick={() => setShowAgent(v => !v)}
            title="Toggle AI Agent"
          >
            <Bot size={15} />
          </button>
          <button className="studio-icon-btn" onClick={() => openSettings('ai')} title="AI Settings">
            <Settings size={15} />
          </button>
          <button className="studio-icon-btn" onClick={handleExportClick} title="Export Kit">
            <Download size={15} />
          </button>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="studio-root" style={{ flex: 1, height: 0, cursor: isDragging ? 'col-resize' : undefined, userSelect: isDragging ? 'none' : undefined }}>

        {/* While dragging, this overlay sits above the preview iframe so it can't
            swallow mousemove/mouseup events and break the resize. */}
        {isDragging && <div className="studio-drag-overlay" />}

        {showExplorer && (
          <>
            <FileExplorer
              selectedFile={activeFilePath}
              onSelect={openFile}
              onKitSettings={() => setShowKitSettings(true)}
              width={explorerWidth}
              framework={framework}
              refreshKey={filesVersion}
              onMutate={handleTreeMutate}
            />
            <div className={`studio-resize-handle${isDragging ? ' dragging' : ''}`} onMouseDown={startDrag} />
          </>
        )}

        <div className="studio-center">
          {/* ── Tab bar ── */}
          <div className="studio-center-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <button
                className={`studio-icon-btn ${showExplorer ? 'panel-active' : ''}`}
                onClick={() => setShowExplorer(v => !v)}
                title={showExplorer ? 'Hide file explorer' : 'Show file explorer'}
              >
                <PanelLeft size={14} />
              </button>
              <div className="studio-topbar-sep" style={{ margin: '0 4px' }} />
              <div className="studio-center-tabs">
                <button className={`studio-center-tab ${centerTab === 'code' ? 'active' : ''}`} onClick={() => setCenterTab('code')}>
                  <Code2 size={13} /> Code
                </button>
                <button
                  className={`studio-center-tab ${centerTab === 'preview' ? 'active' : ''}`}
                  onClick={() => { setCenterTab('preview'); setPreviewKey(k => k + 1); }}
                >
                  <Eye size={13} /> Preview
                </button>
                {isComponentFile && (
                  <button className={`studio-center-tab ${centerTab === 'spec' ? 'active' : ''}`} onClick={() => setCenterTab('spec')}>
                    <Sparkles size={13} /> Spec
                  </button>
                )}
                <button className={`studio-center-tab ${centerTab === 'audit' ? 'active' : ''}`} onClick={() => setCenterTab('audit')}>
                  <ShieldCheck size={13} /> Audit
                </button>
              </div>
            </div>
            <div className="studio-center-actions">
              {centerTab === 'preview' && (
                <div className="studio-size-bar" title="Preview at different screen sizes">
                  {[
                    { w: null, Icon: Monitor, label: 'Full width' },
                    { w: 1280, Icon: Laptop, label: 'Desktop · 1280' },
                    { w: 768, Icon: Tablet, label: 'Tablet · 768' },
                    { w: 390, Icon: Smartphone, label: 'Mobile · 390' },
                  ].map(({ w, Icon, label }) => (
                    <button
                      key={label}
                      className={`studio-size-btn${previewW === w ? ' active' : ''}`}
                      onClick={() => setPreviewW(w)}
                      title={label}
                    >
                      <Icon size={13} />
                    </button>
                  ))}
                </div>
              )}
              {centerTab === 'preview' && !isComponentFile && (
                <button className="studio-icon-btn" onClick={handleRun} title="Reload preview">
                  <RotateCcw size={13} />
                </button>
              )}
            </div>
          </div>

          {/* ── File tabs (code view) ── */}
          {centerTab === 'code' && openFiles.length > 0 && (
            <div className="studio-tabs-bar">
              {openFiles.map(f => (
                <div
                  key={f.path}
                  className={`studio-tab${f.path === activeFilePath ? ' active' : ''}`}
                  onClick={() => setActiveFilePath(f.path)}
                  title={f.path}
                >
                  <span className="studio-tab-name">{fileName(f.path)}</span>
                  {f.dirty && <span className="studio-tab-dirty" />}
                  <button className="studio-tab-close" onClick={e => closeTab(f.path, e)}><X size={11} /></button>
                </div>
              ))}
            </div>
          )}

          {/* ── Agent page tabs (preview view) ── */}
          {centerTab === 'preview' && agentPages.length > 0 && (
            <div className="studio-page-tabs">
              {agentPages.map(name => (
                <div
                  key={name}
                  className={`studio-page-tab${activeAgentPage === name ? ' active' : ''}`}
                  onClick={() => { setActiveAgentPage(name); setPreviewKey(k => k + 1); }}
                >
                  {name}
                  <button
                    className="studio-page-tab-close"
                    onClick={e => { e.stopPropagation(); removeAgentPage(name); }}
                    title="Remove page"
                  >
                    <X size={10} />
                  </button>
                </div>
              ))}
              <button
                className={`studio-page-tab${activeAgentPage === null ? ' active' : ''}`}
                onClick={() => { setActiveAgentPage(null); setPreviewKey(k => k + 1); }}
                title="Live demo"
              >
                Live Demo
              </button>
            </div>
          )}

          {/* ── Content body ── */}
          <ErrorBoundary>
          <div className="studio-center-body">
            {/* Code */}
            <div style={{ display: centerTab === 'code' ? 'flex' : 'none', flexDirection: 'column', height: '100%' }}>
              {openFiles.length === 0 ? (
                <div className="studio-code-empty"><Code2 size={28} /><span>Select a file to start editing</span></div>
              ) : (
                openFiles.map(f => (
                  <div key={f.path} style={{ display: f.path === activeFilePath ? 'flex' : 'none', flexDirection: 'column', height: '100%' }}>
                    {f.loading ? (
                      <div className="studio-code-empty">
                        <div className="ai-thinking-dots"><span /><span /><span /></div>
                        <span>Loading…</span>
                      </div>
                    ) : (
                      <CodeEditor
                        filePath={f.path}
                        content={f.content}
                        framework={framework}
                        onSave={handleFileSave}
                        onRun={handleRunAndPreview}
                        onDirtyChange={handleDirtyChange}
                      />
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Preview */}
            <div style={{ display: centerTab === 'preview' ? 'flex' : 'none', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
              {framework === 'angular' && !angularPreviewEnabled ? (
                <div className="studio-code-empty" style={{ gap: 10, textAlign: 'center', padding: 32 }}>
                  <ShieldCheck size={28} />
                  <span>Angular preview needs the Angular dev server path.</span>
                  <code style={{ color: 'var(--text)', fontSize: 12 }}>npm run dev:angular</code>
                </div>
              ) : isComponentFile && !activeAgentPage ? (
                <ComponentPreview filePath={activeFilePath} previewKey={previewKey} framework={framework} />
              ) : (
                <div className={`studio-preview-stage${previewW ? ' framed' : ''}`}>
                  <iframe
                    key={`${previewKey}-${activeAgentPage}`}
                    src={previewSrc}
                    className="studio-preview-frame"
                    title="Kit Preview"
                    style={previewW ? { width: previewW, maxWidth: '100%' } : undefined}
                  />
                </div>
              )}
            </div>

            {/* Spec */}
            {centerTab === 'spec' && <SpecEditor filePath={activeFilePath} framework={framework} />}

            {/* Audit */}
            {centerTab === 'audit' && <AuditPanel />}
          </div>
          </ErrorBoundary>
        </div>

        {/* ── AI Agent panel ── */}
        {showAgent && (
          <>
            <div className={`studio-resize-handle${isDragging ? ' dragging' : ''}`} onMouseDown={startAgentDrag} />
            <div className="studio-ai-panel" style={{ width: agentWidth }}>
            <AIAgent
              framework={framework}
              onFilesWritten={handleFilesWritten}
              onNavigatePage={handleNavigatePage}
              onOpenSettings={openSettings}
              activeFilePath={activeFilePath}
              activeFileContent={activeFile?.pendingContent ?? activeFile?.content ?? null}
              onUndo={undo}
              canUndo={undoStack.length > 0}
              workspaceRefreshKey={filesVersion}
            />
            </div>
          </>
        )}
      </div>

      <Suspense fallback={null}>
        {showKitSettings && <KitSettingsModal onClose={() => setShowKitSettings(false)} />}
        {showAISettings && <AISettingsModal onClose={() => setShowAISettings(false)} defaultTab={aiSettingsTab} />}
        {showExport && <ExportModal onClose={() => setShowExport(false)} />}
      </Suspense>
    </div>
  );
};

export default Studio;
