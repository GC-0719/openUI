import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import { KITS_DIR } from './constants.js';
import { safeKit } from './pathSafety.js';

/** Walk up from `dir` to find a directory containing `.git`. */
export function findGitRoot(dir) {
  let current = path.resolve(dir);
  const root = path.parse(current).root;
  while (current !== root) {
    if (fs.existsSync(path.join(current, '.git'))) return current;
    current = path.dirname(current);
  }
  return null;
}

/**
 * @param {string} line — porcelain line from `git status --porcelain`
 * @returns {{ xy: string, path: string } | null}
 */
export function parsePorcelainLine(line) {
  if (!line || line.length < 4) return null;
  const xy = line.slice(0, 2);
  let rest = line.slice(3).trim();
  if (rest.includes(' -> ')) rest = rest.split(' -> ').pop().trim();
  if (rest.startsWith('"') && rest.endsWith('"')) {
    rest = rest.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, '\\');
  }
  return { xy, path: rest };
}

/**
 * @param {string} xy — two-char index/worktree status from porcelain output
 * @returns {'untracked' | 'staged' | 'modified' | null}
 */
export function classifyPorcelainStatus(xy) {
  const x = xy[0] ?? ' ';
  const y = xy[1] ?? ' ';
  if (x === '?' && y === '?') return 'untracked';
  if (y === ' ' && /[AMDRC]/.test(x)) return 'staged';
  if (y === 'M' || y === 'D' || x === 'M' || x === 'D' || x === 'A') return 'modified';
  if (x === 'U' || y === 'U') return 'modified';
  return null;
}

/** Prefer the more urgent label when a path appears more than once. */
function mergeStatus(prev, next) {
  const rank = { untracked: 1, staged: 2, modified: 3 };
  if (!prev) return next;
  if (!next) return prev;
  return (rank[next] ?? 0) >= (rank[prev] ?? 0) ? next : prev;
}

/**
 * @param {string} workspaceRoot — real path to kits/<kit>/workspace
 */
export function getGitStatusForWorkspace(workspaceRoot) {
  if (!workspaceRoot || !fs.existsSync(workspaceRoot)) {
    return { available: false, reason: 'workspace_missing' };
  }

  const wsReal = fs.realpathSync(workspaceRoot);
  const gitRoot = findGitRoot(wsReal);
  if (!gitRoot) return { available: false, reason: 'not_a_repo' };

  const run = spawnSync('git', ['-C', gitRoot, 'status', '--porcelain', '-u'], {
    encoding: 'utf-8',
    timeout: 8000,
    maxBuffer: 4 * 1024 * 1024,
  });

  if (run.error?.code === 'ENOENT') {
    return { available: false, reason: 'git_not_installed' };
  }
  if (run.status !== 0) {
    return { available: false, reason: run.stderr?.trim() || 'git_failed' };
  }

  const files = {};
  for (const line of (run.stdout || '').split('\n')) {
    const parsed = parsePorcelainLine(line);
    if (!parsed) continue;
    const status = classifyPorcelainStatus(parsed.xy);
    if (!status) continue;

    const abs = path.resolve(gitRoot, parsed.path);
    const rel = path.relative(wsReal, abs).replace(/\\/g, '/');
    if (!rel || rel.startsWith('..') || rel.includes(`${path.sep}..`)) continue;

    files[rel] = mergeStatus(files[rel], status);
  }

  return { available: true, gitRoot, files };
}

export function getGitStatusForKit(openuiRoot, kit) {
  if (!safeKit(kit)) return { available: false, reason: 'invalid_kit' };
  const slot = path.join(openuiRoot, KITS_DIR, kit, 'workspace');
  if (!fs.existsSync(slot)) return { available: false, reason: 'workspace_missing' };
  try {
    return getGitStatusForWorkspace(fs.realpathSync(slot));
  } catch (err) {
    return { available: false, reason: err.message || 'workspace_unreadable' };
  }
}
