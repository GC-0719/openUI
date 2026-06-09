import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ChevronRight, ChevronDown, FileCode, FileText, Folder, FolderOpen,
  Layers, Settings2, FilePlus, FolderPlus, Pencil, Trash2, RefreshCcw, Boxes, Search,
} from 'lucide-react';
import AddComponentModal from './AddComponentModal';
import StudioConfirmModal from './StudioConfirmModal';
import StudioPromptModal from './StudioPromptModal';
import { apiPost } from '../../utils/api';
import { useToast } from '../ui/Toast';
import {
  buildTree,
  filterPaths,
  flattenVisibleTree,
  defaultCollapsedPaths,
  LARGE_TREE_FILE_COUNT,
  VIRTUAL_ROW_HEIGHT,
  virtualWindow,
} from '../../utils/fileTree';

const ext = (name) => { const i = name.lastIndexOf('.'); return i > 0 ? name.slice(i) : ''; };

const iconFor = (name) => {
  if (name.endsWith('.css')) return <FileText size={13} className="studio-file-icon" />;
  if (name === 'index.ts' || name === 'index.jsx') return <Layers size={13} className="studio-file-icon" />;
  return <FileCode size={13} className="studio-file-icon" />;
};

const GIT_BADGE = {
  modified: { label: 'M', title: 'Modified' },
  untracked: { label: 'U', title: 'Untracked' },
  staged: { label: 'S', title: 'Staged' },
};

const FileExplorer = ({ selectedFile, onSelect, onKitSettings, width, framework = 'react', refreshKey = 0, onMutate, onSpecsRefresh }) => {
  const { addToast } = useToast();
  const [files, setFiles] = useState([]);
  const [showAddComponent, setShowAddComponent] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [promptDialog, setPromptDialog] = useState(null);
  const [gitFiles, setGitFiles] = useState({});
  const [gitAvailable, setGitAvailable] = useState(false);
  const [collapsed, setCollapsed] = useState(() => new Set());
  const [loadError, setLoadError] = useState('');
  const [pathFilter, setPathFilter] = useState('');
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(400);
  const scrollRef = useRef(null);
  const largeTreeInitialized = useRef(false);

  const loadFiles = useCallback(() => {
    setLoadError('');
    Promise.all([
      fetch(`/api/workspace-files?kit=${framework}`).then(r => {
        if (!r.ok) throw new Error(`Could not load file tree (${r.status})`);
        return r.json();
      }),
      fetch(`/api/git-status?kit=${framework}`).then(r => r.json()).catch(() => ({ available: false })),
    ])
      .then(([treeData, gitData]) => {
        if (treeData.error) throw new Error(treeData.error);
        setFiles(treeData.files ?? []);
        setGitAvailable(Boolean(gitData.available));
        setGitFiles(gitData.available ? (gitData.files ?? {}) : {});
      })
      .catch(err => {
        setFiles([]);
        setGitFiles({});
        setGitAvailable(false);
        setLoadError(err.message || 'Could not load file tree');
      });
  }, [framework]);

  useEffect(() => {
    queueMicrotask(() => loadFiles());
  }, [loadFiles, refreshKey]);

  const filteredFiles = useMemo(
    () => filterPaths(files, pathFilter),
    [files, pathFilter]
  );

  const tree = useMemo(() => buildTree(filteredFiles), [filteredFiles]);

  useEffect(() => {
    if (files.length < LARGE_TREE_FILE_COUNT) {
      largeTreeInitialized.current = false;
      return;
    }
    if (largeTreeInitialized.current) return;
    largeTreeInitialized.current = true;
    setCollapsed(defaultCollapsedPaths(buildTree(files), 2));
  }, [files]);

  const useVirtual = files.length >= LARGE_TREE_FILE_COUNT;

  const flatNodes = useMemo(
    () => flattenVisibleTree(tree, collapsed, pathFilter),
    [tree, collapsed, pathFilter]
  );

  const { start: winStart, end: winEnd } = useMemo(
    () => (useVirtual ? virtualWindow(scrollTop, viewportHeight, flatNodes.length) : { start: 0, end: flatNodes.length }),
    [useVirtual, scrollTop, viewportHeight, flatNodes.length]
  );

  const visibleNodes = useMemo(
    () => flatNodes.slice(winStart, winEnd),
    [flatNodes, winStart, winEnd]
  );

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setViewportHeight(el.clientHeight || 400));
    ro.observe(el);
    setViewportHeight(el.clientHeight || 400);
    return () => ro.disconnect();
  }, [files.length, loadError]);

  const toggle = useCallback((path) => {
    setCollapsed(prev => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path); else next.add(path);
      return next;
    });
  }, []);

  const createFile = useCallback((parentDir) => {
    setPromptDialog({
      kind: 'file',
      parentDir,
      title: 'New file',
      label: parentDir ? `Name in ${parentDir}/` : 'File name',
      placeholder: 'Component.jsx',
      defaultValue: '',
    });
  }, []);

  const createFolder = useCallback((parentDir) => {
    setPromptDialog({
      kind: 'folder',
      parentDir,
      title: 'New folder',
      label: parentDir ? `Name in ${parentDir}/` : 'Folder name',
      placeholder: 'components',
      defaultValue: '',
    });
  }, []);

  const renamePath = useCallback((fromPath) => {
    const segs = fromPath.split('/');
    setPromptDialog({
      kind: 'rename',
      fromPath,
      title: 'Rename',
      label: 'New name',
      defaultValue: segs[segs.length - 1],
      placeholder: segs[segs.length - 1],
    });
  }, []);

  const deletePath = useCallback((targetPath, isDir) => {
    setConfirmDialog({
      title: isDir ? 'Delete folder' : 'Delete file',
      message: `Delete ${isDir ? 'folder' : 'file'} "${targetPath}"?${isDir ? ' All contents will be removed.' : ''}`,
      confirmLabel: 'Delete',
      danger: true,
      onConfirm: async () => {
        try {
          await apiPost('/api/delete-path', { path: targetPath, kit: framework });
          loadFiles();
          onMutate?.({ type: 'delete', path: targetPath });
        } catch (err) {
          addToast({ title: 'Could not delete', message: err.message, variant: 'error' });
        } finally {
          setConfirmDialog(null);
        }
      },
    });
  }, [framework, onMutate, loadFiles, addToast]);

  const handlePromptSubmit = useCallback(async (name) => {
    if (!promptDialog) return;
    const { kind, parentDir, fromPath } = promptDialog;
    setPromptDialog(null);
    try {
      if (kind === 'file') {
        const filePath = parentDir ? `${parentDir}/${name}` : name;
        await apiPost('/api/write-file', { path: filePath, content: '', kit: framework });
        loadFiles();
        onMutate?.({ type: 'create', path: filePath });
        onSelect?.(filePath);
      } else if (kind === 'folder') {
        const dirPath = parentDir ? `${parentDir}/${name}` : name;
        await apiPost('/api/create-folder', { path: dirPath, kit: framework });
        loadFiles();
        onMutate?.({ type: 'create', path: dirPath });
      } else if (kind === 'rename' && fromPath) {
        const segs = fromPath.split('/');
        if (name === segs[segs.length - 1]) return;
        const toPath = [...segs.slice(0, -1), name].join('/');
        await apiPost('/api/rename-path', { from: fromPath, to: toPath, kit: framework });
        loadFiles();
        onMutate?.({ type: 'rename', path: fromPath, to: toPath });
      }
    } catch (err) {
      const titles = { file: 'Could not create file', folder: 'Could not create folder', rename: 'Could not rename' };
      addToast({ title: titles[kind] || 'Error', message: err.message, variant: 'error' });
    }
  }, [promptDialog, framework, onMutate, onSelect, loadFiles, addToast]);

  const renderDirRow = (node, depth) => {
    const isCollapsed = collapsed.has(node.path);
    return (
      <div
        key={`dir-${node.path}`}
        className="studio-file-item studio-tree-folder"
        style={{ paddingLeft: 6 + depth * 12, height: VIRTUAL_ROW_HEIGHT }}
        onClick={() => toggle(node.path)}
        title={node.path}
      >
        {isCollapsed ? <ChevronRight size={12} className="studio-tree-chev" /> : <ChevronDown size={12} className="studio-tree-chev" />}
        {isCollapsed ? <Folder size={13} className="studio-file-icon" /> : <FolderOpen size={13} className="studio-file-icon" />}
        <span className="studio-file-name">{node.name}</span>
        <span className="studio-tree-actions">
          <button className="studio-tree-action" title="New file" onClick={e => { e.stopPropagation(); createFile(node.path); }}><FilePlus size={11} /></button>
          <button className="studio-tree-action" title="New folder" onClick={e => { e.stopPropagation(); createFolder(node.path); }}><FolderPlus size={11} /></button>
          <button className="studio-tree-action" title="Rename" onClick={e => { e.stopPropagation(); renamePath(node.path); }}><Pencil size={11} /></button>
          <button className="studio-tree-action" title="Delete" onClick={e => { e.stopPropagation(); deletePath(node.path, true); }}><Trash2 size={11} /></button>
        </span>
      </div>
    );
  };

  const renderFileRow = (file, depth) => (
    <div
      key={`file-${file.path}`}
      className={`studio-file-item${selectedFile === file.path ? ' active' : ''}`}
      style={{ paddingLeft: 6 + depth * 12 + 14, height: VIRTUAL_ROW_HEIGHT }}
      onClick={() => onSelect?.(file.path)}
      title={file.path}
    >
      {iconFor(file.name)}
      <span className="studio-file-name">{file.name}</span>
      {gitFiles[file.path] && (
        <span
          className={`studio-git-badge studio-git-badge--${gitFiles[file.path]}`}
          title={GIT_BADGE[gitFiles[file.path]]?.title ?? gitFiles[file.path]}
        >
          {GIT_BADGE[gitFiles[file.path]]?.label ?? '?'}
        </span>
      )}
      <span className="studio-file-ext">{ext(file.name)}</span>
      <span className="studio-tree-actions">
        <button className="studio-tree-action" title="Rename" onClick={e => { e.stopPropagation(); renamePath(file.path); }}><Pencil size={11} /></button>
        <button className="studio-tree-action" title="Delete" onClick={e => { e.stopPropagation(); deletePath(file.path, false); }}><Trash2 size={11} /></button>
      </span>
    </div>
  );

  const renderFlatNode = (item) => {
    if (item.kind === 'dir') return renderDirRow(item.dir, item.depth);
    return renderFileRow(item.file, item.depth);
  };

  const renderRecursive = (node, depth) => {
    const dirs = [...node.dirs.values()].sort((a, b) => a.name.localeCompare(b.name));
    const leafFiles = [...node.files].sort((a, b) => a.name.localeCompare(b.name));
    return (
      <>
        {dirs.map(dir => {
          const isCollapsed = collapsed.has(dir.path);
          return (
            <div key={dir.path}>
              {renderDirRow(dir, depth)}
              {!isCollapsed && renderRecursive(dir, depth + 1)}
            </div>
          );
        })}
        {leafFiles.map(file => renderFileRow(file, depth))}
      </>
    );
  };

  const showFilter = files.length > 50;

  return (
    <aside className="studio-explorer" style={width ? { width } : undefined}>
      <div className="studio-explorer-header">
        <span className="studio-explorer-title">
          Files
          {files.length > 0 && (
            <span className="studio-explorer-count" title={`${files.length} paths in workspace`}>
              {files.length}
            </span>
          )}
          {gitAvailable && <span className="studio-explorer-git-hint" title="Git status shown for changed files">git</span>}
        </span>
        <div style={{ display: 'flex', gap: 2 }}>
          <button
            className="studio-icon-btn"
            onClick={() => setShowAddComponent(true)}
            title="New kit component (barrel + spec)"
          >
            <Boxes size={14} />
          </button>
          <button className="studio-icon-btn" onClick={() => createFile('src')} title="New file in src/"><FilePlus size={14} /></button>
          <button className="studio-icon-btn" onClick={() => createFolder('src')} title="New folder in src/"><FolderPlus size={14} /></button>
          {framework === 'react' && (
            <button className="studio-icon-btn" onClick={onKitSettings} title="Kit Settings"><Settings2 size={14} /></button>
          )}
        </div>
      </div>

      {showFilter && (
        <div className="studio-explorer-filter">
          <Search size={12} className="studio-explorer-filter-icon" />
          <input
            type="search"
            className="studio-explorer-filter-input"
            placeholder="Filter paths…"
            value={pathFilter}
            onChange={(e) => {
              setPathFilter(e.target.value);
              setScrollTop(0);
            }}
            aria-label="Filter file paths"
          />
        </div>
      )}

      <div
        className="studio-explorer-scroll"
        ref={scrollRef}
        onScroll={useVirtual ? (e) => setScrollTop(e.currentTarget.scrollTop) : undefined}
      >
        {loadError ? (
          <div className="studio-tree-error">
            <span>{loadError}</span>
            <button type="button" className="studio-tree-retry" onClick={loadFiles}>
              <RefreshCcw size={12} /> Retry
            </button>
          </div>
        ) : files.length === 0
          ? <div className="studio-tree-empty">No files</div>
          : useVirtual ? (
            <div style={{ height: flatNodes.length * VIRTUAL_ROW_HEIGHT, position: 'relative' }}>
              <div style={{ transform: `translateY(${winStart * VIRTUAL_ROW_HEIGHT}px)` }}>
                {visibleNodes.map(renderFlatNode)}
              </div>
            </div>
          ) : renderRecursive(tree, 0)}
      </div>

      {useVirtual && !loadError && files.length > 0 && (
        <div className="studio-explorer-perf-hint" title="Large workspaces use virtual scrolling and collapsed deep folders">
          {flatNodes.length} visible · {files.length} total
        </div>
      )}

      {showAddComponent && (
        <AddComponentModal
          framework={framework}
          onClose={() => setShowAddComponent(false)}
          onCreated={(info) => {
            loadFiles();
            onMutate?.({ type: 'create', path: info.path });
            onSelect?.(info.path);
            onSpecsRefresh?.();
            addToast({
              title: `${info.name} created`,
              message: 'Barrel updated · spec seeded · open Spec tab to refine.',
              variant: 'success',
            });
          }}
        />
      )}

      <StudioConfirmModal
        open={!!confirmDialog}
        title={confirmDialog?.title}
        message={confirmDialog?.message}
        confirmLabel={confirmDialog?.confirmLabel}
        danger={confirmDialog?.danger}
        onConfirm={confirmDialog?.onConfirm}
        onCancel={() => setConfirmDialog(null)}
      />

      <StudioPromptModal
        open={!!promptDialog}
        title={promptDialog?.title}
        label={promptDialog?.label}
        defaultValue={promptDialog?.defaultValue ?? ''}
        placeholder={promptDialog?.placeholder}
        submitLabel={promptDialog?.kind === 'rename' ? 'Rename' : 'Create'}
        onSubmit={handlePromptSubmit}
        onCancel={() => setPromptDialog(null)}
      />
    </aside>
  );
};

export default FileExplorer;
