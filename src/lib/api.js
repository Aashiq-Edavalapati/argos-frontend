export const BACKEND_URL = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000').replace(/\/$/, "");

export const getAuthToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
};

export const setAuthToken = (token) => {
  if (typeof window === 'undefined') return;
  if (token) {
    localStorage.setItem('auth_token', token);
  } else {
    localStorage.removeItem('auth_token');
  }
};

export const apiFetch = async (endpoint, options = {}) => {
  const token = getAuthToken();
  const headers = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  let body = options.body;
  if (options.json !== undefined) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(options.json);
  }

  const url = endpoint.startsWith('http')
    ? endpoint
    : `${BACKEND_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  return fetch(url, {
    credentials: 'include',
    ...options,
    headers,
    body,
  });
};
