import { describe, it, expect } from 'vitest';
import { diffLines, countDiffStats } from './fileDiff.js';

describe('diffLines', () => {
  it('marks new file lines as additions', () => {
    const hunks = diffLines(null, 'a\nb');
    expect(hunks).toEqual([
      { type: 'add', text: 'a' },
      { type: 'add', text: 'b' },
    ]);
  });

  it('detects remove and add for a one-line change', () => {
    const hunks = diffLines('old\nkeep', 'new\nkeep');
    expect(hunks.filter(h => h.type !== 'same')).toEqual([
      { type: 'remove', text: 'old' },
      { type: 'add', text: 'new' },
    ]);
  });

  it('returns empty for identical content', () => {
    expect(diffLines('x', 'x')).toEqual([{ type: 'same', text: 'x' }]);
  });
});

describe('countDiffStats', () => {
  it('counts add/remove lines', () => {
    const stats = countDiffStats([
      { type: 'remove', text: 'a' },
      { type: 'add', text: 'b' },
      { type: 'same', text: 'c' },
    ]);
    expect(stats).toEqual({ added: 1, removed: 1 });
  });
});
