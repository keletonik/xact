/**
 * Thin API client. When VITE_API_BASE is empty, the app is offline-only and
 * all reads/writes go to Dexie. When it is set, the client also mirrors writes
 * to the API. Read-through caching is the caller's responsibility.
 */
const BASE = import.meta.env.VITE_API_BASE || '';

let token = null;
export function setAuthToken(t) { token = t; }
export function getAuthToken() { return token; }
export function isOnline() { return Boolean(BASE); }

async function request(path, { method = 'GET', body, headers = {} } = {}) {
  if (!BASE) throw new Error('API not configured (VITE_API_BASE is empty)');
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'content-type': 'application/json',
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`${res.status} ${res.statusText}: ${text}`);
  }
  const ct = res.headers.get('content-type') || '';
  return ct.includes('application/json') ? res.json() : res.text();
}

export const api = {
  login: (email, password) => request('/auth/login', { method: 'POST', body: { email, password } }),
  register: (data) => request('/auth/register', { method: 'POST', body: data }),
  listProducts: () => request('/products'),
  createProduct: (p) => request('/products', { method: 'POST', body: p }),
  updateProduct: (id, p) => request(`/products/${id}`, { method: 'PUT', body: p }),
  deleteProduct: (id) => request(`/products/${id}`, { method: 'DELETE' }),
};
