import path from 'path';
import { KITS_DIR } from './constants.js';

export const safeKit = (k) => (k === 'react' || k === 'angular' ? k : null);

/**
 * Create workspace path resolvers bound to a project root.
 * Blocks `..` traversal outside kits/<kit>/<workspace|template>.
 */
export function createPathResolver(cwd) {
  const resolveIn = (kit, source, relPath) => {
    if (!safeKit(kit)) return null;
    if (source !== 'workspace' && source !== 'template') return null;
    const baseRoot = path.resolve(cwd, KITS_DIR, kit, source);
    const full = path.resolve(baseRoot, relPath || '');
    if (full !== baseRoot && !full.startsWith(baseRoot + path.sep)) return null;
    return full;
  };
  const resolveWs = (kit, relPath) => resolveIn(kit, 'workspace', relPath);
  return { resolveIn, resolveWs };
}
