import { describe, it, expect } from 'vitest';
import { buildThemeOverridesCss } from './themeSync.js';

describe('buildThemeOverridesCss', () => {
  it('builds :root rules from css vars', () => {
    const css = buildThemeOverridesCss({ '--primary': '#ff0000' }, {}, 'MyKit');
    expect(css).toContain('MyKit');
    expect(css).toContain(':root');
    expect(css).toContain('--primary: #ff0000');
  });

  it('returns empty string when no overrides', () => {
    expect(buildThemeOverridesCss({}, {})).toBe('');
  });
});
