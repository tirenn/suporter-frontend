export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';
export const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI';

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

  const config = { ...options, headers };
  const response = await fetch(`${API_BASE}${endpoint}`, config);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `HTTP error! status: ${response.status}`);
  }

  return data;
}

export async function executeRecaptcha(action) {
  return new Promise((resolve, reject) => {
    if (!window.grecaptcha) {
      reject(new Error('reCAPTCHA script belum termuat'));
      return;
    }
    window.grecaptcha.ready(() => {
      window.grecaptcha.execute(RECAPTCHA_SITE_KEY, { action }).then((token) => {
        if (!token) {
          reject(new Error('Gagal mendapatkan token reCAPTCHA'));
          return;
        }
        resolve(token);
      }).catch(reject);
    });
  });
}

export const api = {
  // Auth
  register: (name, username, password, recaptchaToken) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, username, password, role: 'streamer', recaptcha_token: recaptchaToken }),
    }),

  login: (username, password, recaptchaToken) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password, recaptcha_token: recaptchaToken }),
    }),

  // Streamer public profile (for donation page — no auth)
  getStreamerProfile: (username) =>
    request(`/streamers/${encodeURIComponent(username)}`, { method: 'GET' }),

  // Update QRIS URL (requires streamer auth)
  updateProfile: (qrisUrl) =>
    request('/profile', {
      method: 'PUT',
      body: JSON.stringify({ qris_url: qrisUrl }),
    }),

  regenerateWebhookKey: () =>
    request('/profile/webhook-key', { method: 'PUT' }),

  // Projects (1 Project = 1 OBS Template Overlay)
  getProjects: () => request('/projects', { method: 'GET' }),

  createProject: (name, description, templateData = {}) =>
    request('/projects', {
      method: 'POST',
      body: JSON.stringify({ name, description, ...templateData }),
    }),

  getProjectByUUID: (uuid) => request(`/projects/${uuid}`, { method: 'GET' }),

  updateProject: (uuid, updateData) =>
    request(`/projects/${uuid}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    }),

  deleteProject: (uuid) =>
    request(`/projects/${uuid}`, { method: 'DELETE' }),

  triggerAlert: (projectUUID, alertData, duration) =>
    request(`/projects/${projectUUID}/alert`, {
      method: 'POST',
      body: JSON.stringify({ ...alertData, duration: duration || 7000 }),
    }),

  // Donations — public, rate-limited, requires reCAPTCHA token
  createDonation: (streamerUsername, senderName, amount, message, recaptchaToken) =>
    request('/donations', {
      method: 'POST',
      body: JSON.stringify({
        streamer_username: streamerUsername,
        sender_name: senderName,
        amount: Number(amount),
        message,
        recaptcha_token: recaptchaToken,
      }),
    }),
};
