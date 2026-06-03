import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ChevronRight, ChevronDown, FileCode, FileText, Folder, FolderOpen,
  Layers, Settings2, FilePlus, FolderPlus, Pencil, Trash2, RefreshCcw, Boxes,
} from 'lucide-react';
import AddComponentModal from './AddComponentModal';
import { apiPost } from '../../utils/api';
import { useToast } from '../../../kits/react/workspace/src/components/ui/Toast';

// ── Tree building ────────────────────────────────────────────────────────────
// Turn a flat list of workspace-relative paths into a nested folder tree.
// `.gitkeep` placeholders create the folder node but are not shown as files.
function buildTree(paths) {
  const root = { name: '', path: '', dirs: new Map(), files: [] };
  for (const p of paths) {
    const parts = p.split('/');
    let node = root;
    for (let i = 0; i < parts.length - 1; i++) {
      const seg = parts[i];
      if (!node.dirs.has(seg)) {
        node.dirs.set(seg, { name: seg, path: parts.slice(0, i + 1).join('/'), dirs: new Map(), files: [] });
      }
      node = node.dirs.get(seg);
    }
    const fileName = parts[parts.length - 1];
    if (fileName === '.gitkeep') continue;
    node.files.push({ name: fileName, path: p });
  }
  return root;
}

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
  const [gitFiles, setGitFiles] = useState({});
  const [gitAvailable, setGitAvailable] = useState(false);
  const [collapsed, setCollapsed] = useState(() => new Set());
  const [loadError, setLoadError] = useState('');

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

  const tree = useMemo(() => buildTree(files), [files]);

  const toggle = useCallback((path) => {
    setCollapsed(prev => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path); else next.add(path);
      return next;
    });
  }, []);

  // ── Mutations ──────────────────────────────────────────────────────────────
  const createFile = useCallback(async (parentDir) => {
    const name = window.prompt(`New file name${parentDir ? ` in ${parentDir}/` : ''}:`, '');
    if (!name) return;
    const filePath = parentDir ? `${parentDir}/${name}` : name;
    try {
      await apiPost('/api/write-file', { path: filePath, content: '', kit: framework });
      loadFiles();
      onMutate?.({ type: 'create', path: filePath });
      onSelect?.(filePath);
    } catch (err) {
      addToast({ title: 'Could not create file', message: err.message, variant: 'error' });
    }
  }, [framework, onMutate, onSelect, loadFiles, addToast]);

  const createFolder = useCallback(async (parentDir) => {
    const name = window.prompt(`New folder name${parentDir ? ` in ${parentDir}/` : ''}:`, '');
    if (!name) return;
    const dirPath = parentDir ? `${parentDir}/${name}` : name;
    try {
      await apiPost('/api/create-folder', { path: dirPath, kit: framework });
      loadFiles();
      onMutate?.({ type: 'create', path: dirPath });
    } catch (err) {
      addToast({ title: 'Could not create folder', message: err.message, variant: 'error' });
    }
  }, [framework, onMutate, loadFiles, addToast]);

  const renamePath = useCallback(async (fromPath) => {
    const segs = fromPath.split('/');
    const next = window.prompt('Rename to:', segs[segs.length - 1]);
    if (!next || next === segs[segs.length - 1]) return;
    const toPath = [...segs.slice(0, -1), next].join('/');
    try {
      await apiPost('/api/rename-path', { from: fromPath, to: toPath, kit: framework });
      loadFiles();
      onMutate?.({ type: 'rename', path: fromPath, to: toPath });
    } catch (err) {
      addToast({ title: 'Could not rename', message: err.message, variant: 'error' });
    }
  }, [framework, onMutate, loadFiles, addToast]);

  const deletePath = useCallback(async (targetPath, isDir) => {
    if (!window.confirm(`Delete ${isDir ? 'folder' : 'file'} "${targetPath}"?${isDir ? ' All contents will be removed.' : ''}`)) return;
    try {
      await apiPost('/api/delete-path', { path: targetPath, kit: framework });
      loadFiles();
      onMutate?.({ type: 'delete', path: targetPath });
    } catch (err) {
      addToast({ title: 'Could not delete', message: err.message, variant: 'error' });
    }
  }, [framework, onMutate, loadFiles, addToast]);

  // ── Render ───────────────────────────────────────────────────────────────
  const renderDir = (node, depth) => {
    const dirs = [...node.dirs.values()].sort((a, b) => a.name.localeCompare(b.name));
    const leafFiles = [...node.files].sort((a, b) => a.name.localeCompare(b.name));
    return (
      <>
        {dirs.map(dir => {
          const isCollapsed = collapsed.has(dir.path);
          return (
            <div key={dir.path}>
              <div
                className="studio-file-item studio-tree-folder"
                style={{ paddingLeft: 6 + depth * 12 }}
                onClick={() => toggle(dir.path)}
                title={dir.path}
              >
                {isCollapsed ? <ChevronRight size={12} className="studio-tree-chev" /> : <ChevronDown size={12} className="studio-tree-chev" />}
                {isCollapsed ? <Folder size={13} className="studio-file-icon" /> : <FolderOpen size={13} className="studio-file-icon" />}
                <span className="studio-file-name">{dir.name}</span>
                <span className="studio-tree-actions">
                  <button className="studio-tree-action" title="New file" onClick={e => { e.stopPropagation(); createFile(dir.path); }}><FilePlus size={11} /></button>
                  <button className="studio-tree-action" title="New folder" onClick={e => { e.stopPropagation(); createFolder(dir.path); }}><FolderPlus size={11} /></button>
                  <button className="studio-tree-action" title="Rename" onClick={e => { e.stopPropagation(); renamePath(dir.path); }}><Pencil size={11} /></button>
                  <button className="studio-tree-action" title="Delete" onClick={e => { e.stopPropagation(); deletePath(dir.path, true); }}><Trash2 size={11} /></button>
                </span>
              </div>
              {!isCollapsed && renderDir(dir, depth + 1)}
            </div>
          );
        })}
        {leafFiles.map(file => (
          <div
            key={file.path}
            className={`studio-file-item${selectedFile === file.path ? ' active' : ''}`}
            style={{ paddingLeft: 6 + depth * 12 + 14 }}
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
        ))}
      </>
    );
  };

  return (
    <aside className="studio-explorer" style={width ? { width } : undefined}>
      <div className="studio-explorer-header">
        <span className="studio-explorer-title">
          Files
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
      <div className="studio-explorer-scroll">
        {loadError ? (
          <div className="studio-tree-error">
            <span>{loadError}</span>
            <button type="button" className="studio-tree-retry" onClick={loadFiles}>
              <RefreshCcw size={12} /> Retry
            </button>
          </div>
        ) : files.length === 0
          ? <div className="studio-tree-empty">No files</div>
          : renderDir(tree, 0)}
      </div>

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
    </aside>
  );
};

export default FileExplorer;
