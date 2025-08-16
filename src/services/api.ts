import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || "/api",
  withCredentials: true,            // <— envia cookies (refresh) sempre
});

// Anexa o Bearer do localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken"); // ajuste a chave se diferente
  if (token) {
    config.headers = config.headers ?? {};
    if (!config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default api;
