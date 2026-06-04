import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { execSync } from 'child_process';
import {
  parsePorcelainLine,
  classifyPorcelainStatus,
  findGitRoot,
  getGitStatusForWorkspace,
} from './gitStatus.js';

describe('parsePorcelainLine', () => {
  it('parses modified and untracked lines', () => {
    expect(parsePorcelainLine(' M src/App.jsx')).toEqual({ xy: ' M', path: 'src/App.jsx' });
    expect(parsePorcelainLine('?? src/new.jsx')).toEqual({ xy: '??', path: 'src/new.jsx' });
  });

  it('parses rename target', () => {
    expect(parsePorcelainLine('R  old.jsx -> src/new.jsx')).toEqual({
      xy: 'R ',
      path: 'src/new.jsx',
    });
  });
});

describe('classifyPorcelainStatus', () => {
  it('classifies common codes', () => {
    expect(classifyPorcelainStatus('??')).toBe('untracked');
    expect(classifyPorcelainStatus(' M')).toBe('modified');
    expect(classifyPorcelainStatus('M ')).toBe('staged');
    expect(classifyPorcelainStatus('MM')).toBe('modified');
  });
});

describe('findGitRoot', () => {
  let tmp;
  beforeEach(() => {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'openui-git-'));
    fs.mkdirSync(path.join(tmp, 'src'), { recursive: true });
    fs.mkdirSync(path.join(tmp, '.git'));
  });
  afterEach(() => {
    fs.rmSync(tmp, { recursive: true, force: true });
  });

  it('finds .git in workspace', () => {
    expect(findGitRoot(path.join(tmp, 'src'))).toBe(tmp);
  });
});

describe('getGitStatusForWorkspace', () => {
  let tmp;

  beforeEach(() => {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'openui-git-int-'));
    fs.mkdirSync(path.join(tmp, 'src'), { recursive: true });
    execSync('git init', { cwd: tmp, stdio: 'ignore' });
    execSync('git config user.email "test@openui.dev"', { cwd: tmp, stdio: 'ignore' });
    execSync('git config user.name "openUI Test"', { cwd: tmp, stdio: 'ignore' });
  });

  afterEach(() => {
    fs.rmSync(tmp, { recursive: true, force: true });
  });

  it('reports untracked and modified files under workspace', () => {
    fs.writeFileSync(path.join(tmp, 'src', 'tracked.jsx'), 'v1');
    execSync('git add src/tracked.jsx', { cwd: tmp, stdio: 'ignore' });
    execSync('git commit -m init', { cwd: tmp, stdio: 'ignore' });

    fs.writeFileSync(path.join(tmp, 'src', 'tracked.jsx'), 'v2');
    fs.writeFileSync(path.join(tmp, 'src', 'new.jsx'), 'new');

    const status = getGitStatusForWorkspace(tmp);
    expect(status.available).toBe(true);
    expect(status.files['src/tracked.jsx']).toBe('modified');
    expect(status.files['src/new.jsx']).toBe('untracked');
  });
});
