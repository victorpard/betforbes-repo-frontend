import axios, { AxiosInstance } from 'axios';

export const api: AxiosInstance = axios.create({
  baseURL: '/api',
  withCredentials: true,
  timeout: 20000,
});

function readAnyToken(): string | null {
  try {
    return (
      localStorage.getItem('accessToken') ||
      localStorage.getItem('token') ||
      localStorage.getItem('auth_token')
    );
  } catch {
    return null;
  }
}

function applyAuthHeader(tok?: string | null) {
  const t = tok ?? readAnyToken();
  if (t) {
    api.defaults.headers.common['Authorization'] = `Bearer ${t}`;
    axios.defaults.headers.common['Authorization'] = `Bearer ${t}`; // cobre axios direto
  } else {
    delete api.defaults.headers.common['Authorization'];
    delete axios.defaults.headers.common['Authorization'];
  }
}

// aplica no boot
applyAuthHeader();

// expõe util opcional para reaplicar após login/logout
export function setAuthToken(token?: string | null) {
  if (token) localStorage.setItem('accessToken', token);
  applyAuthHeader(token);
}

export default api;
