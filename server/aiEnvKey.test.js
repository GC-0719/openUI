import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  getServerAnthropicKey,
  hasServerEnvKey,
  getAiConfigPublic,
  resolveAiCredentials,
} from './aiEnvKey.js';

describe('aiEnvKey', () => {
  const origOpenui = process.env.OPENUI_AI_KEY;
  const origAnthropic = process.env.ANTHROPIC_API_KEY;

  afterEach(() => {
    if (origOpenui === undefined) delete process.env.OPENUI_AI_KEY;
    else process.env.OPENUI_AI_KEY = origOpenui;
    if (origAnthropic === undefined) delete process.env.ANTHROPIC_API_KEY;
    else process.env.ANTHROPIC_API_KEY = origAnthropic;
  });

  beforeEach(() => {
    delete process.env.OPENUI_AI_KEY;
    delete process.env.ANTHROPIC_API_KEY;
  });

  it('returns null when no env keys', () => {
    expect(getServerAnthropicKey()).toBeNull();
    expect(hasServerEnvKey()).toBe(false);
  });

  it('prefers ANTHROPIC_API_KEY over OPENUI_AI_KEY', () => {
    process.env.OPENUI_AI_KEY = 'sk-openui';
    process.env.ANTHROPIC_API_KEY = 'sk-anthropic';
    expect(getServerAnthropicKey()).toBe('sk-anthropic');
  });

  it('getAiConfigPublic never includes the key', () => {
    process.env.OPENUI_AI_KEY = 'sk-secret';
    const pub = getAiConfigPublic();
    expect(pub.hasServerKey).toBe(true);
    expect(pub.envProvider).toBe('claude');
    expect(JSON.stringify(pub)).not.toContain('sk-secret');
  });

  it('resolveAiCredentials prefers client key', () => {
    process.env.OPENUI_AI_KEY = 'sk-env';
    const r = resolveAiCredentials({ provider: 'claude', apiKey: 'sk-client' });
    expect(r.apiKey).toBe('sk-client');
    expect(r.keySource).toBe('client');
  });

  it('resolveAiCredentials uses env for claude when client key empty', () => {
    process.env.OPENUI_AI_KEY = 'sk-env';
    const r = resolveAiCredentials({ provider: 'claude', apiKey: '' });
    expect(r.apiKey).toBe('sk-env');
    expect(r.keySource).toBe('env');
  });

  it('does not apply env key to openai provider', () => {
    process.env.OPENUI_AI_KEY = 'sk-env';
    const r = resolveAiCredentials({ provider: 'openai', apiKey: '' });
    expect(r.apiKey).toBe('');
    expect(r.keySource).toBe('none');
  });
});
