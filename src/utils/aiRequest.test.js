import { describe, it, expect } from 'vitest';
import { buildAiRequestBody } from './aiRequest.js';

describe('buildAiRequestBody', () => {
  it('omits apiKey when keySource is env', () => {
    const body = buildAiRequestBody(
      { provider: 'claude', model: 'claude-sonnet-4-6', apiKey: '', keySource: 'env' },
      { messages: [] }
    );
    expect(body.apiKey).toBeUndefined();
    expect(body.provider).toBe('claude');
  });

  it('includes apiKey for client source', () => {
    const body = buildAiRequestBody(
      { provider: 'claude', model: 'm', apiKey: 'sk-x', keySource: 'client' },
      {}
    );
    expect(body.apiKey).toBe('sk-x');
  });
});
