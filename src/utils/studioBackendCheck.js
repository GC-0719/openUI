/**
 * Returns true when the Vite dev-server studio APIs are reachable.
 * Production static hosting (npm start / openui.live) has no /api/* routes.
 */
export async function pingStudioBackend(kit = 'react') {
  try {
    const res = await fetch(
      `/api/workspace-files?kit=${encodeURIComponent(kit)}`,
      { method: 'GET' }
    );
    if (!res.ok) return false;
    const data = await res.json();
    return !data.error && Array.isArray(data.files);
  } catch {
    return false;
  }
}

/** Show full Studio shell on localhost even for production builds (vite preview, npm start). */
export function isLocalStudioHost() {
  if (typeof window === 'undefined') return false;
  const host = window.location.hostname;
  return host === 'localhost' || host === '127.0.0.1' || host === '[::1]';
}

export function shouldMountStudio() {
  if (!import.meta.env.PROD) return true;
  if (import.meta.env.VITE_OPENUI_STUDIO === '1') return true;
  return isLocalStudioHost();
}
