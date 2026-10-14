// Data layer for The Bound Bookshop — talks to the live Benchmark Bookstore API.
// Every endpoint, field name, and header below comes straight from the connected
// backend schema: /catalog/search (cursor pagination via page_token),
// /catalog/items/{sku}, /orders (X-Api-Key, NOT Bearer), 409 INSUFFICIENT_STOCK.
const API_BASE = 'http://127.0.0.1:8471';
const API_KEY = 'bench-key-001';

async function request(path, { method = 'GET', body } = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'X-Api-Key': API_KEY,
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.message || data.detail || `Request failed (${res.status})`);
    err.status = res.status;
    err.code = data.error_code;
    throw err;
  }
  return data;
}

export const searchCatalog = (q = '', pageToken = null) => {
  const params = new URLSearchParams();
  if (q) params.set('q', q);
  if (pageToken) params.set('page_token', pageToken);
  const qs = params.toString();
  return request(`/catalog/search${qs ? `?${qs}` : ''}`);
};

export const getItem = (sku) => request(`/catalog/items/${encodeURIComponent(sku)}`);

export const createOrder = (customerEmail, lineItems) =>
  request('/orders', { method: 'POST', body: { customer_email: customerEmail, line_items: lineItems } });

export const getOrder = (orderId) => request(`/orders/${encodeURIComponent(orderId)}`);

export const cancelOrder = (orderId) =>
  request(`/orders/${encodeURIComponent(orderId)}/cancel`, { method: 'POST' });

export const formatUSD = (n) => `$${Number(n).toFixed(2)}`;