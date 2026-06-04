/**
 * Dev-server env API keys (BYOK without pasting into the browser).
 * Never expose key values to the client — only hasServerKey / provider hints.
 */

/** @returns {string | null} */
export function getServerAnthropicKey() {
  const key = process.env.ANTHROPIC_API_KEY || process.env.OPENUI_AI_KEY;
  if (!key || !String(key).trim()) return null;
  return String(key).trim();
}

/** @returns {boolean} */
export function hasServerEnvKey() {
  return Boolean(getServerAnthropicKey());
}

/** Public config for GET /api/ai-config (no secrets). */
export function getAiConfigPublic() {
  const hasServerKey = hasServerEnvKey();
  return {
    hasServerKey,
    ...(hasServerKey ? { envProvider: 'claude', envKeyLabel: 'OPENUI_AI_KEY or ANTHROPIC_API_KEY' } : {}),
  };
}

/**
 * Merge request credentials: in-app apiKey wins; else env Anthropic key for claude provider.
 * @param {{ provider?: string, apiKey?: string, model?: string, baseUrl?: string }} body
 */
export function resolveAiCredentials(body = {}) {
  const provider = body.provider || 'claude';
  const trimmed = body.apiKey?.trim?.() ? body.apiKey.trim() : '';
  if (trimmed) {
    return { ...body, provider, apiKey: trimmed, keySource: 'client' };
  }

  const envKey = getServerAnthropicKey();
  if (envKey && provider === 'claude') {
    return { ...body, provider: 'claude', apiKey: envKey, keySource: 'env' };
  }

  return { ...body, provider, apiKey: trimmed, keySource: trimmed ? 'client' : 'none' };
}
