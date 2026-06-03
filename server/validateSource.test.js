import { describe, it, expect } from 'vitest';
import { validateSourceContent } from './validateSource.js';

describe('validateSourceContent', () => {
  it('returns null for valid TypeScript', () => {
    const code = 'export const x = 1;\n';
    expect(validateSourceContent(code, 'test.ts', undefined)).toBeNull();
  });

  it('returns error for invalid syntax', () => {
    const code = 'export class { broken\n';
    const err = validateSourceContent(code, 'bad.ts', undefined);
    expect(err).toBeTruthy();
    expect(err).toMatch(/line|error/i);
  });

  it('catches invalid JSX', () => {
    const code = 'export default function X() { return <div unclosed; }\n';
    const err = validateSourceContent(code, 'bad.jsx', undefined);
    expect(err).toBeTruthy();
  });
});
