import { describe, it, expect } from 'vitest';
import { fileURLToPath } from 'url';
import path from 'path';
import { isPathInsideRoot, runSecurityAudit } from './securityAudit.js';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

describe('isPathInsideRoot', () => {
  it('allows paths under root', () => {
    expect(isPathInsideRoot('/tmp/ws', 'src/App.jsx')).toBe(true);
  });
  it('blocks traversal', () => {
    expect(isPathInsideRoot('/tmp/ws', '../../etc/passwd')).toBe(false);
  });
});

describe('runSecurityAudit', () => {
  it('passes on the openUI repo', () => {
    const r = runSecurityAudit(root);
    expect(r.ok, r.findings.join('\n')).toBe(true);
  });
});
