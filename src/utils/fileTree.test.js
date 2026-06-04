import { describe, it, expect } from 'vitest';
import {
  buildTree,
  filterPaths,
  defaultCollapsedPaths,
  flattenVisibleTree,
  virtualWindow,
} from './fileTree.js';

describe('buildTree', () => {
  it('nests paths and skips .gitkeep as leaf', () => {
    const tree = buildTree(['src/a.js', 'src/lib/b.js', 'src/empty/.gitkeep']);
    expect(tree.files).toHaveLength(0);
    expect(tree.dirs.get('src').files.map((f) => f.name)).toEqual(['a.js']);
    expect(tree.dirs.get('src').dirs.get('lib').files[0].name).toBe('b.js');
  });
});

describe('filterPaths', () => {
  it('filters by substring', () => {
    const paths = ['src/pages/Home.jsx', 'src/components/Button.jsx'];
    expect(filterPaths(paths, 'pages')).toEqual(['src/pages/Home.jsx']);
  });
});

describe('flattenVisibleTree', () => {
  it('hides children when folder collapsed', () => {
    const tree = buildTree(['src/a.js', 'src/deep/b.js']);
    const collapsed = new Set(['src']);
    const flat = flattenVisibleTree(tree, collapsed);
    expect(flat.some((n) => n.path === 'src/a.js')).toBe(false);
    expect(flat.some((n) => n.kind === 'dir' && n.path === 'src')).toBe(true);
  });
});

describe('defaultCollapsedPaths', () => {
  it('collapses deep folders', () => {
    const paths = [];
    for (let i = 0; i < 5; i++) {
      paths.push(`src/${'l'.repeat(i + 1)}/file${i}.js`);
    }
    const tree = buildTree(paths);
    const collapsed = defaultCollapsedPaths(tree, 1);
    expect(collapsed.size).toBeGreaterThan(0);
  });
});

describe('virtualWindow', () => {
  it('returns a slice range for scroll position', () => {
    const { start, end } = virtualWindow(140, 200, 100);
    expect(start).toBeLessThan(end);
    expect(end).toBeLessThanOrEqual(100);
  });
});
