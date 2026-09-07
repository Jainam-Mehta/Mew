const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const config = {
    ...options,
    headers,
  };

  const url = endpoint.startsWith('http')
    ? endpoint
    : `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  const response = await fetch(url, config);

  if (response.status === 401) {
    // Optionally clear token if unauthorized
  }

  const contentType = response.headers.get('content-type');
  let data = null;
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const errorMessage =
      (data && data.detail) ||
      (data && data.message) ||
      `HTTP error ${response.status}`;
    const error = new Error(errorMessage);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  get: (endpoint, options) => request(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, body, options) =>
    request(endpoint, { ...options, method: 'POST', body: body !== undefined ? JSON.stringify(body) : undefined }),
  put: (endpoint, body, options) =>
    request(endpoint, { ...options, method: 'PUT', body: body !== undefined ? JSON.stringify(body) : undefined }),
  patch: (endpoint, body, options) =>
    request(endpoint, { ...options, method: 'PATCH', body: body !== undefined ? JSON.stringify(body) : undefined }),
  delete: (endpoint, options) => request(endpoint, { ...options, method: 'DELETE' }),
};

export default api;
