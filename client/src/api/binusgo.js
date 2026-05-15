const BASE = '/api';

function getToken() {
  return localStorage.getItem('binusgo_token') || '';
}

async function request(path, { method = 'GET', body, auth = false } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) {
    const t = getToken();
    if (t) headers.Authorization = `Bearer ${t}`;
  }
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    credentials: 'include',
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : {};
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

export const api = {
  // auth
  register: (b) => request('/auth/register', { method: 'POST', body: b }),
  login: (b) => request('/auth/login', { method: 'POST', body: b }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  me: () => request('/auth/me', { auth: true }),

  // campuses
  campuses: () => request('/campuses'),

  // routes
  routes: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/routes${q ? '?' + q : ''}`);
  },
  searchRoutes: (b) => request('/routes/search', { method: 'POST', body: b, auth: true }),

  // saved
  saved: () => request('/saved', { auth: true }),
  save: (campusId) => request('/saved', { method: 'POST', body: { campusId }, auth: true }),
  unsave: (id) => request(`/saved/${id}`, { method: 'DELETE', auth: true }),

  // history
  history: () => request('/history', { auth: true }),

  // admin
  adminStats: () => request('/admin/stats', { auth: true }),
};

export const setToken = (t) => {
  if (t) localStorage.setItem('binusgo_token', t);
  else localStorage.removeItem('binusgo_token');
};
