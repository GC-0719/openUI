/**
 * Build POST body for /api/ai — omit apiKey when the dev server supplies OPENUI_AI_KEY.
 * @param {{ provider: string, model: string, apiKey?: string, baseUrl?: string, keySource?: string }} settings
 * @param {Record<string, unknown>} rest messages, systemPrompt, stream, etc.
 */
export function buildAiRequestBody(settings, rest = {}) {
  const base = {
    provider: settings.provider,
    model: settings.model,
    baseUrl: settings.baseUrl,
    ...rest,
  };
  if (settings.keySource === 'env') {
    return base;
  }
  if (settings.apiKey?.trim()) {
    return { ...base, apiKey: settings.apiKey.trim() };
  }
  return base;
}
