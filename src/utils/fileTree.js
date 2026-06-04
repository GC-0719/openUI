/**
 * File explorer tree utilities (build, flatten for virtual scroll, default collapse).
 */

/** @typedef {{ name: string, path: string, dirs: Map<string, TreeNode>, files: { name: string, path: string }[] }} TreeNode */

/**
 * @param {string[]} paths
 * @returns {TreeNode}
 */
export function buildTree(paths) {
  const root = { name: '', path: '', dirs: new Map(), files: [] };
  for (const p of paths) {
    const parts = p.split('/');
    let node = root;
    for (let i = 0; i < parts.length - 1; i++) {
      const seg = parts[i];
      if (!node.dirs.has(seg)) {
        node.dirs.set(seg, {
          name: seg,
          path: parts.slice(0, i + 1).join('/'),
          dirs: new Map(),
          files: [],
        });
      }
      node = node.dirs.get(seg);
    }
    const fileName = parts[parts.length - 1];
    if (fileName === '.gitkeep') continue;
    node.files.push({ name: fileName, path: p });
  }
  return root;
}

/**
 * Paths matching filter (case-insensitive substring on full path).
 * @param {string[]} paths
 * @param {string} filter
 */
export function filterPaths(paths, filter) {
  const q = filter.trim().toLowerCase();
  if (!q) return paths;
  return paths.filter((p) => p.toLowerCase().includes(q));
}

/**
 * When the tree is large, collapse folders deeper than `maxDepth` (0 = root only expanded).
 * @param {TreeNode} tree
 * @param {number} maxDepth
 * @returns {Set<string>} folder paths that should start collapsed
 */
export function defaultCollapsedPaths(tree, maxDepth = 2) {
  const collapsed = new Set();
  const walk = (node, depth) => {
    for (const dir of node.dirs.values()) {
      if (depth >= maxDepth) collapsed.add(dir.path);
      walk(dir, depth + 1);
    }
  };
  walk(tree, 0);
  return collapsed;
}

/**
 * @typedef {'dir' | 'file'} FlatNodeKind
 * @typedef {{ kind: FlatNodeKind, depth: number, path: string, name: string, file?: { name: string, path: string }, dir?: TreeNode }} FlatNode
 */

/**
 * Depth-first flatten respecting collapsed dirs and optional path filter on files.
 * @param {TreeNode} node
 * @param {Set<string>} collapsed
 * @param {string} pathFilter
 * @param {number} depth
 * @returns {FlatNode[]}
 */
export function flattenVisibleTree(node, collapsed, pathFilter = '', depth = 0) {
  const out = [];
  const q = pathFilter.trim().toLowerCase();
  const dirs = [...node.dirs.values()].sort((a, b) => a.name.localeCompare(b.name));
  const files = [...node.files].sort((a, b) => a.name.localeCompare(b.name));

  for (const dir of dirs) {
    out.push({ kind: 'dir', depth, path: dir.path, name: dir.name, dir });
    const isCollapsed = collapsed.has(dir.path);
    if (!isCollapsed) {
      out.push(...flattenVisibleTree(dir, collapsed, pathFilter, depth + 1));
    }
  }

  for (const file of files) {
    if (q && !file.path.toLowerCase().includes(q)) continue;
    out.push({ kind: 'file', depth, path: file.path, name: file.name, file });
  }

  return out;
}

/** Threshold above which we virtualize and auto-collapse deep folders. */
export const LARGE_TREE_FILE_COUNT = 120;

export const VIRTUAL_ROW_HEIGHT = 28;
export const VIRTUAL_OVERSCAN = 8;

/**
 * @param {number} scrollTop
 * @param {number} viewportHeight
 * @param {number} totalRows
 */
export function virtualWindow(scrollTop, viewportHeight, totalRows) {
  const start = Math.max(0, Math.floor(scrollTop / VIRTUAL_ROW_HEIGHT) - VIRTUAL_OVERSCAN);
  const visibleCount = Math.ceil(viewportHeight / VIRTUAL_ROW_HEIGHT) + VIRTUAL_OVERSCAN * 2;
  const end = Math.min(totalRows, start + visibleCount);
  return { start, end };
}
