/**
 * Line-level diff for agent file preview (unified hunks).
 */

const MAX_DIFF_LINES = 800;

/** @returns {{ type: 'same' | 'remove' | 'add', text: string }[]} */
export function diffLines(before, after) {
  const oldLines = before == null ? [] : before.split('\n');
  const newLines = (after ?? '').split('\n');
  const n = oldLines.length;
  const m = newLines.length;

  const dp = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      if (oldLines[i - 1] === newLines[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  const raw = [];
  let i = n;
  let j = m;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldLines[i - 1] === newLines[j - 1]) {
      raw.push({ type: 'same', text: oldLines[i - 1] });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      raw.push({ type: 'add', text: newLines[j - 1] });
      j--;
    } else {
      raw.push({ type: 'remove', text: oldLines[i - 1] });
      i--;
    }
  }
  raw.reverse();

  if (raw.length <= MAX_DIFF_LINES) return raw;

  const head = raw.slice(0, MAX_DIFF_LINES - 1);
  head.push({ type: 'same', text: `… ${raw.length - MAX_DIFF_LINES + 1} more lines (open file in editor to review)` });
  return head;
}

/** @typedef {{ path: string, before: string | null, after: string, status: 'new' | 'modified' | 'unchanged', hunks: ReturnType<typeof diffLines> }} FileDiffEntry */

/**
 * @param {string} framework
 * @param {Record<string, string>} files
 * @param {(path: string, content: string) => string} normalizeContent
 * @returns {Promise<{ files: Record<string, string>, diffs: FileDiffEntry[] }>}
 */
export async function buildAgentFileDiffs(framework, files, normalizeContent) {
  const normalized = Object.fromEntries(
    Object.entries(files).map(([path, content]) => [path, normalizeContent(path, content)])
  );

  const diffs = await Promise.all(
    Object.entries(normalized).map(async ([path, after]) => {
      let before = null;
      try {
        const res = await fetch(
          `/api/read-file?path=${encodeURIComponent(path)}&kit=${framework}`
        );
        const data = await res.json();
        if (!data.error) before = data.content;
      } catch {
        before = null;
      }

      const status =
        before === null ? 'new' : before === after ? 'unchanged' : 'modified';

      return {
        path,
        before,
        after,
        status,
        hunks: diffLines(before, after),
      };
    })
  );

  diffs.sort((a, b) => a.path.localeCompare(b.path));
  return { files: normalized, diffs };
}

export function countDiffStats(hunks) {
  let added = 0;
  let removed = 0;
  for (const h of hunks) {
    if (h.type === 'add') added++;
    else if (h.type === 'remove') removed++;
  }
  return { added, removed };
}
