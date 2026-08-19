// Base URL of the Express API.
// Set NEXT_PUBLIC_API_URL in .env.local.
// Defaults to the local backend API.

export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4002/api';
  
function authHeaders() {
  if (typeof window === 'undefined') return {};
  const token = window.localStorage.getItem('utb_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(path, { method = 'GET', body, auth = false } = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(auth ? authHeaders() : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request to ${path} failed (${res.status})`);
  return data;
}

export const api = {
  // Curriculum
  getCourses: () => request('/api/courses'),
  markCoursePassed: (courseId, body) =>
    request(`/api/courses/${courseId}/mark-passed`, { method: 'POST', body, auth: true }),
  getMyProgress: () => request('/api/courses/progress/me', { auth: true }),

  // Auth
  login: (email, password) => request('/api/auth/login', { method: 'POST', body: { email, password } }),
  register: (payload) => request('/api/auth/register', { method: 'POST', body: payload }),
  me: () => request('/api/auth/me', { auth: true }),

  // Projects / Labs — same pattern, extend as those screens get built
  getProjects: (category) => request(`/api/projects${category ? `?category=${category}` : ''}`),
  getLabs: () => request('/api/labs'),
};

export function isAuthenticated() {
  if (typeof window === 'undefined') return false;
  return Boolean(window.localStorage.getItem('utb_token'));
}
