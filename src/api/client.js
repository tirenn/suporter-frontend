export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';
export const JWT_SECRET_KEY = import.meta.env.VITE_JWT_SECRET_KEY || 'suporter-super-secret-jwt-key-2026';

const API_BASE = `${BACKEND_URL}/api/v1`;

export function getStoredToken() {
  return localStorage.getItem('jwt_token');
}

export function setStoredToken(token) {
  if (token) {
    localStorage.setItem('jwt_token', token);
  } else {
    localStorage.removeItem('jwt_token');
  }
}

export function getStoredUser() {
  const user = localStorage.getItem('user_data');
  return user ? JSON.parse(user) : null;
}

export function setStoredUser(user) {
  if (user) {
    localStorage.setItem('user_data', JSON.stringify(user));
  } else {
    localStorage.removeItem('user_data');
  }
}

async function request(endpoint, options = {}) {
  const token = getStoredToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, config);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `HTTP error! status: ${response.status}`);
  }

  return data;
}

export const api = {
  // Auth
  register: (name, email, password) => 
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password })
    }),

  login: (email, password) => 
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    }),

  // Projects
  getProjects: () => request('/projects', { method: 'GET' }),

  createProject: (name, description) => 
    request('/projects', {
      method: 'POST',
      body: JSON.stringify({ name, description })
    }),

  getProjectByUUID: (uuid) => request(`/projects/${uuid}`, { method: 'GET' }),

  triggerAlert: (projectUUID, { name, message, type, duration }) => 
    request(`/projects/${projectUUID}/alert`, {
      method: 'POST',
      body: JSON.stringify({ name, message, type, duration: duration || 5000 })
    })
};
