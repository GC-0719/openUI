import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import os from 'os';
import {
  validateComponentName,
  appendBarrelExport,
  buildComponentStub,
  registerCustomComponent,
  readMergedSpecs,
} from './customComponent.js';

describe('validateComponentName', () => {
  it('accepts PascalCase', () => {
    expect(validateComponentName('StatCard').ok).toBe(true);
  });
  it('rejects invalid names', () => {
    expect(validateComponentName('stat-card').ok).toBe(false);
  });
});

describe('appendBarrelExport', () => {
  it('appends a new export line', () => {
    const out = appendBarrelExport("export * from './Button';\n", "export * from './StatCard';");
    expect(out).toContain('StatCard');
  });
  it('does not duplicate', () => {
    const barrel = "export * from './StatCard';\n";
    expect(appendBarrelExport(barrel, "export * from './StatCard';")).toBe(barrel);
  });
});

describe('buildComponentStub', () => {
  it('builds react jsx path', () => {
    const s = buildComponentStub('react', 'StatCard');
    expect(s.path).toBe('src/components/ui/StatCard.jsx');
    expect(s.content).toContain('export const StatCard');
  });

  it('builds angular component path', () => {
    const s = buildComponentStub('angular', 'StatCard');
    expect(s.path).toBe('src/components/ui/stat-card.component.ts');
    expect(s.exportLine).toContain('StatCardComponent');
  });
});

describe('registerCustomComponent', () => {
  let tmp;

  beforeEach(() => {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'openui-custom-'));
    const ui = path.join(tmp, 'kits', 'react', 'workspace', 'src', 'components', 'ui');
    fs.mkdirSync(ui, { recursive: true });
    fs.writeFileSync(
      path.join(ui, 'index.jsx'),
      "export * from './Button';\n",
      'utf-8'
    );
    fs.mkdirSync(path.join(tmp, 'src', 'data'), { recursive: true });
    fs.writeFileSync(path.join(tmp, 'src/data/ai-specs.json'), '{}', 'utf-8');
  });

  afterEach(() => {
    fs.rmSync(tmp, { recursive: true, force: true });
  });

  it('creates file, barrel line, and workspace spec', () => {
    const r = registerCustomComponent(tmp, 'react', 'StatCard');
    expect(r.ok).toBe(true);
    expect(fs.existsSync(path.join(tmp, 'kits/react/workspace/src/components/ui/StatCard.jsx'))).toBe(true);
    const barrel = fs.readFileSync(path.join(tmp, 'kits/react/workspace/src/components/ui/index.jsx'), 'utf-8');
    expect(barrel).toContain('StatCard');
    const specs = readMergedSpecs(tmp, 'react');
    expect(specs.statcard).toBeDefined();
  });
});
