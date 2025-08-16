import axios from 'axios';
import { getAccessToken } from '@/utils/auth';

axios.interceptors.request.use((config) => {
  try {
    const token = getAccessToken();
    if (token) {
      config.headers = config.headers || {};
      (config.headers as any).Authorization = `Bearer ${token}`;
    }
  } catch {}
  return config;
});
