import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import os from 'os';
import {
  validateExternalRoot,
  bindExternalWorkspace,
  restoreBuiltinWorkspace,
  getWorkspaceBindStatus,
} from './workspaceBind.js';

function copyPath(src, dest) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const f of fs.readdirSync(src)) {
      copyPath(path.join(src, f), path.join(dest, f));
    }
  } else {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
  }
}

describe('workspaceBind', () => {
  let tmp;
  let openuiRoot;
  let projectDir;

  beforeEach(() => {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'openui-bind-'));
    openuiRoot = path.join(tmp, 'openui');
    projectDir = path.join(tmp, 'my-app');
    fs.mkdirSync(projectDir, { recursive: true });
    fs.writeFileSync(path.join(projectDir, 'package.json'), '{}');

    const kitRoot = path.join(openuiRoot, 'kits', 'react');
    fs.mkdirSync(path.join(kitRoot, 'template', 'src'), { recursive: true });
    fs.writeFileSync(path.join(kitRoot, 'template', 'src', 'App.jsx'), 'export default () => null;');
    fs.mkdirSync(path.join(kitRoot, 'workspace', 'src'), { recursive: true });
    fs.writeFileSync(path.join(kitRoot, 'workspace', 'src', 'App.jsx'), 'builtin');
  });

  afterEach(() => {
    fs.rmSync(tmp, { recursive: true, force: true });
  });

  it('rejects template folder as external root', () => {
    const tmpl = path.join(openuiRoot, 'kits', 'react', 'template');
    const r = validateExternalRoot(tmpl, openuiRoot, 'react');
    expect(r.ok).toBe(false);
  });

  it('rejects openUI node_modules', () => {
    const nm = path.join(openuiRoot, 'node_modules');
    fs.mkdirSync(nm, { recursive: true });
    const r = validateExternalRoot(nm, openuiRoot, 'react');
    expect(r.ok).toBe(false);
  });

  it('binds external folder via symlink', () => {
    const bind = bindExternalWorkspace(openuiRoot, 'react', projectDir);
    expect(bind.ok).toBe(true);

    const slot = path.join(openuiRoot, 'kits', 'react', 'workspace');
    expect(fs.lstatSync(slot).isSymbolicLink()).toBe(true);
    expect(fs.realpathSync(slot)).toBe(fs.realpathSync(projectDir));

    const status = getWorkspaceBindStatus(openuiRoot, 'react');
    expect(status.mode).toBe('external');
    expect(status.externalRoot).toBe(fs.realpathSync(projectDir));
  });

  it('restore replaces symlink with template copy', () => {
    bindExternalWorkspace(openuiRoot, 'react', projectDir);
    const restore = restoreBuiltinWorkspace(openuiRoot, 'react', copyPath);
    expect(restore.ok).toBe(true);

    const slot = path.join(openuiRoot, 'kits', 'react', 'workspace');
    expect(fs.lstatSync(slot).isSymbolicLink()).toBe(false);
    expect(fs.readFileSync(path.join(slot, 'src', 'App.jsx'), 'utf-8')).toBe('export default () => null;');

    expect(getWorkspaceBindStatus(openuiRoot, 'react').mode).toBe('builtin');
  });
});
