import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { pingStudioBackend, isLocalStudioHost } from './studioBackendCheck.js';

describe('pingStudioBackend', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns true when workspace-files responds with a files array', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ files: [] }),
    }));
    await expect(pingStudioBackend('react')).resolves.toBe(true);
  });

  it('returns false on network error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
    await expect(pingStudioBackend('react')).resolves.toBe(false);
  });
});

describe('isLocalStudioHost', () => {
  const orig = globalThis.window;

  beforeEach(() => {
    globalThis.window = { location: { hostname: 'localhost' } };
  });

  afterEach(() => {
    globalThis.window = orig;
  });

  it('detects localhost', () => {
    expect(isLocalStudioHost()).toBe(true);
  });
});
