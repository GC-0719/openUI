// AI provider layer: high token limits, truncation-aware continuation, SSE streaming.

export function parseLocalLLMResponse(rawText) {
  try {
    const d = JSON.parse(rawText);
    if (d.error) throw new Error(typeof d.error === 'string' ? d.error : d.error.message || JSON.stringify(d.error));
    return d.choices?.[0]?.message?.content ?? d.message?.content ?? '';
  } catch (e) {
    if (!(e instanceof SyntaxError)) throw e;
  }
  let content = '';
  for (const line of rawText.split('\n')) {
    const stripped = line.startsWith('data: ') ? line.slice(6) : line.trim();
    if (!stripped || stripped === '[DONE]') continue;
    try {
      const chunk = JSON.parse(stripped);
      if (chunk.error) throw new Error(typeof chunk.error === 'string' ? chunk.error : chunk.error.message || JSON.stringify(chunk.error));
      content += chunk.choices?.[0]?.delta?.content ?? chunk.choices?.[0]?.message?.content ?? chunk.message?.content ?? '';
    } catch (e) {
      if (!(e instanceof SyntaxError)) throw e;
    }
  }
  if (!content) throw new Error(`Local LLM returned unexpected format: ${rawText.slice(0, 300)}`);
  return content;
}

const AI_MAX_TOKENS = { claude: 16000, openai: 16384, gemini: 8192, local: 8192 };
const AI_MAX_CONTINUATIONS = 4;
const AI_CONTINUE_PROMPT =
  'Continue the response from exactly where you stopped. Do NOT repeat any text you already wrote — resume mid-line/mid-token if needed. Keep the identical format (same fenced code blocks with file-path annotations).';

async function* sseLines(body) {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buf = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    let idx;
    while ((idx = buf.indexOf('\n')) >= 0) {
      const line = buf.slice(0, idx);
      buf = buf.slice(idx + 1);
      if (line.trim()) yield line.trim();
    }
  }
  if (buf.trim()) yield buf.trim();
}

function cacheSystem(systemPrompt) {
  if (!systemPrompt) return undefined;
  return [{ type: 'text', text: systemPrompt, cache_control: { type: 'ephemeral' } }];
}

function cacheMessages(messages) {
  if (!Array.isArray(messages) || messages.length === 0) return messages;
  const out = messages.map(m => ({ ...m }));
  const last = out[out.length - 1];
  if (typeof last.content === 'string') {
    last.content = [{ type: 'text', text: last.content, cache_control: { type: 'ephemeral' } }];
  } else if (Array.isArray(last.content) && last.content.length) {
    const blocks = last.content.map(b => ({ ...b }));
    blocks[blocks.length - 1] = { ...blocks[blocks.length - 1], cache_control: { type: 'ephemeral' } };
    last.content = blocks;
  }
  return out;
}

function logClaudeCache(usage) {
  if (!usage) return;
  const read = usage.cache_read_input_tokens || 0;
  const write = usage.cache_creation_input_tokens || 0;
  if (read || write) console.log(`[openui] claude cache → read ${read} · write ${write} · fresh ${usage.input_tokens || 0}`);
}

async function aiProviderOnce({ provider, model, apiKey, baseUrl, systemPrompt, messages }) {
  if (provider === 'claude') {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({ model, system: cacheSystem(systemPrompt), messages: cacheMessages(messages), max_tokens: AI_MAX_TOKENS.claude }),
    });
    const d = await r.json();
    if (d.error) throw new Error(d.error.message);
    logClaudeCache(d.usage);
    return { text: d.content?.[0]?.text || '', truncated: d.stop_reason === 'max_tokens' };
  }
  if (provider === 'openai') {
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, messages: [{ role: 'system', content: systemPrompt }, ...messages], max_tokens: AI_MAX_TOKENS.openai }),
    });
    const d = await r.json();
    if (d.error) throw new Error(d.error.message);
    return { text: d.choices?.[0]?.message?.content || '', truncated: d.choices?.[0]?.finish_reason === 'length' };
  }
  if (provider === 'gemini') {
    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents: messages.map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] })),
          generationConfig: { maxOutputTokens: AI_MAX_TOKENS.gemini },
        }),
      }
    );
    const d = await r.json();
    if (d.error) throw new Error(d.error.message || d.error.status);
    return {
      text: d.candidates?.[0]?.content?.parts?.[0]?.text || '',
      truncated: d.candidates?.[0]?.finishReason === 'MAX_TOKENS',
    };
  }
  if (provider === 'local') {
    const base = (baseUrl || 'http://localhost:11434/v1').replace(/\/$/, '');
    const authHeaders = {};
    if (apiKey && apiKey.toLowerCase() !== 'ollama') authHeaders['Authorization'] = `Bearer ${apiKey}`;
    const allMessages = [{ role: 'system', content: systemPrompt }, ...messages];
    let r = await fetch(`${base}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders },
      body: JSON.stringify({ model, messages: allMessages, stream: false }),
    });
    if (r.status === 404) {
      const ollamaBase = base.replace(/\/v1$/, '');
      r = await fetch(`${ollamaBase}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({ model, messages: allMessages, stream: false }),
      });
    }
    if (!r.ok) {
      const errBody = await r.text();
      let errMsg = `Local LLM error ${r.status}`;
      try { const d = JSON.parse(errBody); if (d.error) errMsg = typeof d.error === 'string' ? d.error : d.error.message || errMsg; } catch {}
      throw new Error(errMsg);
    }
    return { text: parseLocalLLMResponse(await r.text()), truncated: false };
  }
  throw new Error(`Unknown provider: ${provider}`);
}

export async function aiComplete(args) {
  let full = '';
  let messages = [...args.messages];
  for (let round = 0; round < AI_MAX_CONTINUATIONS; round++) {
    const { text, truncated } = await aiProviderOnce({ ...args, messages });
    full += text;
    if (!truncated || !text) break;
    messages = [...messages, { role: 'assistant', content: text }, { role: 'user', content: AI_CONTINUE_PROMPT }];
  }
  return full;
}

async function aiStreamOnce({ provider, model, apiKey, baseUrl, systemPrompt, messages }, onDelta) {
  if (provider === 'claude') {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({ model, system: cacheSystem(systemPrompt), messages: cacheMessages(messages), max_tokens: AI_MAX_TOKENS.claude, stream: true }),
    });
    if (!r.ok) { const d = await r.json().catch(() => ({})); throw new Error(d.error?.message || `Claude error ${r.status}`); }
    let truncated = false;
    for await (const line of sseLines(r.body)) {
      if (!line.startsWith('data:')) continue;
      const payload = line.slice(5).trim();
      let ev; try { ev = JSON.parse(payload); } catch { continue; }
      if (ev.type === 'message_start') logClaudeCache(ev.message?.usage);
      else if (ev.type === 'content_block_delta' && ev.delta?.text) onDelta(ev.delta.text);
      else if (ev.type === 'message_delta' && ev.delta?.stop_reason === 'max_tokens') truncated = true;
      else if (ev.type === 'error') throw new Error(ev.error?.message || 'Claude stream error');
    }
    return { truncated };
  }
  if (provider === 'openai' || provider === 'local') {
    let url, headers;
    const allMessages = [{ role: 'system', content: systemPrompt }, ...messages];
    const body = { model, messages: allMessages, stream: true };
    if (provider === 'openai') {
      url = 'https://api.openai.com/v1/chat/completions';
      headers = { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' };
      body.max_tokens = AI_MAX_TOKENS.openai;
    } else {
      const base = (baseUrl || 'http://localhost:11434/v1').replace(/\/$/, '');
      url = `${base}/chat/completions`;
      headers = { 'Content-Type': 'application/json' };
      if (apiKey && apiKey.toLowerCase() !== 'ollama') headers['Authorization'] = `Bearer ${apiKey}`;
    }
    const r = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) });
    if (!r.ok) { const t = await r.text(); throw new Error(`${provider} error ${r.status}: ${t.slice(0, 200)}`); }
    let truncated = false;
    for await (const line of sseLines(r.body)) {
      if (!line.startsWith('data:')) continue;
      const payload = line.slice(5).trim();
      if (payload === '[DONE]') break;
      let ev; try { ev = JSON.parse(payload); } catch { continue; }
      const delta = ev.choices?.[0]?.delta?.content;
      if (delta) onDelta(delta);
      if (ev.choices?.[0]?.finish_reason === 'length') truncated = true;
    }
    return { truncated };
  }
  if (provider === 'gemini') {
    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents: messages.map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] })),
          generationConfig: { maxOutputTokens: AI_MAX_TOKENS.gemini },
        }),
      }
    );
    if (!r.ok) { const t = await r.text(); throw new Error(`Gemini error ${r.status}: ${t.slice(0, 200)}`); }
    let truncated = false;
    for await (const line of sseLines(r.body)) {
      if (!line.startsWith('data:')) continue;
      const payload = line.slice(5).trim();
      let ev; try { ev = JSON.parse(payload); } catch { continue; }
      const parts = ev.candidates?.[0]?.content?.parts;
      if (parts) for (const p of parts) if (p.text) onDelta(p.text);
      if (ev.candidates?.[0]?.finishReason === 'MAX_TOKENS') truncated = true;
    }
    return { truncated };
  }
  throw new Error(`Unknown provider: ${provider}`);
}

export async function aiStreamWithContinuation(args, onDelta) {
  let messages = [...args.messages];
  for (let round = 0; round < AI_MAX_CONTINUATIONS; round++) {
    let roundText = '';
    const { truncated } = await aiStreamOnce({ ...args, messages }, (d) => { roundText += d; onDelta(d); });
    if (!truncated || !roundText) break;
    messages = [...messages, { role: 'assistant', content: roundText }, { role: 'user', content: AI_CONTINUE_PROMPT }];
  }
}
