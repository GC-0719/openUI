import { describe, it, expect } from 'vitest';
import path from 'path';
import { fileURLToPath } from 'url';
import { safeKit, createPathResolver } from './pathSafety.js';

const root = path.dirname(fileURLToPath(import.meta.url));

describe('safeKit', () => {
  it('allows react and angular', () => {
    expect(safeKit('react')).toBe('react');
    expect(safeKit('angular')).toBe('angular');
  });

  it('rejects unknown kits', () => {
    expect(safeKit('evil')).toBeNull();
    expect(safeKit('../react')).toBeNull();
  });
});

describe('createPathResolver', () => {
  const { resolveIn, resolveWs } = createPathResolver(path.join(root, '..'));

  it('resolves paths inside the workspace', () => {
    const p = resolveWs('react', 'src/App.jsx');
    expect(p).toContain(path.join('kits', 'react', 'workspace', 'src', 'App.jsx'));
  });

  it('blocks path traversal outside the sandbox', () => {
    expect(resolveWs('react', '../../../etc/passwd')).toBeNull();
    expect(resolveIn('react', 'workspace', '../../package.json')).toBeNull();
  });

  it('rejects invalid kit or source', () => {
    expect(resolveIn('nope', 'workspace', 'src')).toBeNull();
    expect(resolveIn('react', 'public', 'src')).toBeNull();
  });
});
