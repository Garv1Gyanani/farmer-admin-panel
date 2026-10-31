// API client utility for ProFarmer Admin Console

export const API_BASE_URL = (import.meta.env.VITE_API_URL || 'https://apiagritech.divanex.in').replace(/\/$/, '');

const BASE_URL = API_BASE_URL;

export const getAuthToken = () => {
  return localStorage.getItem('profarmer_admin_token') || '';
};

export const setAuthToken = (token) => {
  localStorage.setItem('profarmer_admin_token', token);
};

export const removeAuthToken = () => {
  localStorage.removeItem('profarmer_admin_token');
  localStorage.removeItem('profarmer_admin_user');
};

export const apiFetch = async (endpoint, options = {}) => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const contentType = response.headers.get('content-type') || '';
  let data = null;
  if (contentType.includes('application/json')) {
    data = await response.json();
  } else {
    const text = await response.text();
    if (!response.ok) {
      throw new Error(`Server returned status ${response.status}: ${response.statusText || 'Endpoint unavailable'}`);
    }
    data = { success: true, message: text };
  }

  if (!response.ok) {
    if (response.status === 401) {
      removeAuthToken();
      window.dispatchEvent(new Event('auth:logout'));
    }
    throw new Error(data?.message || `API request failed (${response.status})`);
  }

  return data;
};

export const apiUpload = async (endpoint, formData) => {
  const token = getAuthToken();
  const headers = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'POST',
    headers,
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    if (response.status === 401) {
      removeAuthToken();
      window.dispatchEvent(new Event('auth:logout'));
    }
    throw new Error(data.message || 'File upload failed');
  }

  return data;
};

