import fs from 'fs';
import path from 'path';
import process from 'node:process';
import { KITS_DIR } from './constants.js';
import { safeKit } from './pathSafety.js';

export const WORKSPACE_LINKS_FILE = '.openui/workspace-links.json';

function workspaceSlot(openuiRoot, kit) {
  return path.join(openuiRoot, KITS_DIR, kit, 'workspace');
}

function templateDir(openuiRoot, kit) {
  return path.join(openuiRoot, KITS_DIR, kit, 'template');
}

function linksConfigPath(openuiRoot) {
  return path.join(openuiRoot, WORKSPACE_LINKS_FILE);
}

export function readWorkspaceLinks(openuiRoot) {
  const file = linksConfigPath(openuiRoot);
  if (!fs.existsSync(file)) return {};
  try {
    const data = JSON.parse(fs.readFileSync(file, 'utf-8'));
    return typeof data === 'object' && data ? data : {};
  } catch {
    return {};
  }
}

function writeWorkspaceLinks(openuiRoot, links) {
  const file = linksConfigPath(openuiRoot);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(links, null, 2), 'utf-8');
}

/**
 * Validate an absolute folder path for use as an external workspace root.
 * @returns {{ ok: true, path: string } | { ok: false, error: string }}
 */
export function validateExternalRoot(externalPath, openuiRoot, kit) {
  if (!safeKit(kit)) return { ok: false, error: 'Invalid kit' };
  if (!externalPath || typeof externalPath !== 'string') {
    return { ok: false, error: 'Missing path' };
  }
  if (externalPath.includes('\0')) return { ok: false, error: 'Invalid path' };

  let resolved;
  try {
    resolved = path.resolve(externalPath.trim());
  } catch {
    return { ok: false, error: 'Invalid path' };
  }

  if (!path.isAbsolute(resolved)) {
    return { ok: false, error: 'Path must be absolute' };
  }

  let stat;
  try {
    stat = fs.statSync(resolved);
  } catch {
    return { ok: false, error: 'Path does not exist' };
  }
  if (!stat.isDirectory()) {
    return { ok: false, error: 'Path is not a directory' };
  }

  let real;
  try {
    real = fs.realpathSync(resolved);
  } catch (err) {
    return { ok: false, error: err.message || 'Cannot resolve path' };
  }

  let openuiReal;
  try {
    openuiReal = fs.realpathSync(openuiRoot);
  } catch (err) {
    return { ok: false, error: err.message || 'Invalid openUI root' };
  }

  const tmpl = templateDir(openuiReal, kit);
  if (real === tmpl || real.startsWith(tmpl + path.sep)) {
    return { ok: false, error: 'Cannot bind to a kit template folder' };
  }

  const slot = workspaceSlot(openuiReal, kit);
  if (fs.existsSync(slot)) {
    try {
      const slotReal = fs.realpathSync(slot);
      if (real === slotReal) {
        return { ok: false, error: 'That folder is already the active workspace' };
      }
    } catch { /* slot may be broken symlink */ }
  }

  const nodeModules = path.join(openuiReal, 'node_modules');
  if (real === nodeModules || real.startsWith(nodeModules + path.sep)) {
    return { ok: false, error: 'Cannot bind to node_modules' };
  }

  return { ok: true, path: real };
}

export function getWorkspaceBindStatus(openuiRoot, kit) {
  if (!safeKit(kit)) return { kit, mode: 'invalid' };

  const slot = workspaceSlot(openuiRoot, kit);
  const links = readWorkspaceLinks(openuiRoot);
  const saved = links[kit] ?? null;

  if (!fs.existsSync(slot)) {
    return {
      kit,
      mode: 'missing',
      slot,
      externalRoot: saved?.externalRoot ?? null,
    };
  }

  try {
    if (!fs.lstatSync(slot).isSymbolicLink()) {
      return { kit, mode: 'builtin', slot, externalRoot: null };
    }
    const externalRoot = fs.realpathSync(slot);
    return {
      kit,
      mode: 'external',
      slot,
      externalRoot,
      linkedAt: saved?.linkedAt ?? null,
    };
  } catch {
    return { kit, mode: 'error', slot, error: 'Workspace slot unreadable' };
  }
}

/**
 * Replace kits/<kit>/workspace with a symlink to the user's project folder.
 */
export function bindExternalWorkspace(openuiRoot, kit, externalPath) {
  const check = validateExternalRoot(externalPath, openuiRoot, kit);
  if (!check.ok) return check;

  const tmpl = templateDir(openuiRoot, kit);
  if (!fs.existsSync(tmpl)) {
    return { ok: false, error: 'Kit template not found — run dev once to initialize' };
  }

  const slot = workspaceSlot(openuiRoot, kit);
  if (fs.existsSync(slot)) {
    const stat = fs.lstatSync(slot);
    if (stat.isSymbolicLink()) {
      fs.unlinkSync(slot);
    } else {
      fs.rmSync(slot, { recursive: true, force: true });
    }
  }

  const linkType = process.platform === 'win32' ? 'junction' : 'dir';
  fs.symlinkSync(check.path, slot, linkType);

  const links = readWorkspaceLinks(openuiRoot);
  links[kit] = {
    externalRoot: check.path,
    linkedAt: new Date().toISOString(),
  };
  writeWorkspaceLinks(openuiRoot, links);

  return { ok: true, externalRoot: check.path, kit };
}

/**
 * Remove symlink (if any) and restore workspace from template.
 */
export function restoreBuiltinWorkspace(openuiRoot, kit, copyPath) {
  if (!safeKit(kit)) return { ok: false, error: 'Invalid kit' };

  const tmpl = templateDir(openuiRoot, kit);
  const slot = workspaceSlot(openuiRoot, kit);
  if (!fs.existsSync(tmpl)) {
    return { ok: false, error: 'Template not found' };
  }

  if (fs.existsSync(slot)) {
    const stat = fs.lstatSync(slot);
    if (stat.isSymbolicLink()) {
      fs.unlinkSync(slot);
    } else {
      fs.rmSync(slot, { recursive: true, force: true });
    }
  }

  copyPath(tmpl, slot);

  const links = readWorkspaceLinks(openuiRoot);
  delete links[kit];
  writeWorkspaceLinks(openuiRoot, links);

  return { ok: true, kit, mode: 'builtin' };
}
