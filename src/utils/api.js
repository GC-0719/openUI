/**
 * Fetch JSON from the local dev-server API. Throws on HTTP errors or `{ error }` payloads.
 */
export async function apiFetch(url, options = {}) {
  const res = await fetch(url, options);
  let data = null;
  const text = await res.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      if (!res.ok) throw new Error(text.slice(0, 200) || `Request failed (${res.status})`);
    }
  }
  if (!res.ok) {
    const msg = data?.error || `Request failed (${res.status})`;
    throw new Error(msg);
  }
  if (data?.error) throw new Error(data.error);
  return data ?? {};
}

/** POST JSON body; returns parsed response. */
export async function apiPost(url, body) {
  return apiFetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}
