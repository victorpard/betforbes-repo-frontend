import axios, { AxiosRequestConfig } from 'axios';
import { getReferral, saveReferral } from '@/utils/referral';

function injectReferral(config: AxiosRequestConfig) {
  try {
    const method = (config.method || 'get').toLowerCase();
    if (method !== 'post') return config;

    const url = String(config.url || '');
    if (!/\/auth\/register(?:$|\?)/.test(url)) return config;

    const ref = getReferral();
    if (!ref) return config;

    const data: any = (config as any).data;

    // Se for FormData
    if (typeof FormData !== 'undefined' && data instanceof FormData) {
      if (!data.has('referralCode')) data.set('referralCode', ref);
      return config;
    }

    // Se já for objeto
    if (data && typeof data === 'object') {
      if (!('referralCode' in data)) data.referralCode = ref;
      return config;
    }

    // Se vier string (JSON)
    if (typeof data === 'string') {
      try {
        const obj = JSON.parse(data);
        if (!obj.referralCode) obj.referralCode = ref;
        (config as any).data = obj; // axios serializa depois
        return config;
      } catch {}
    }

    // Default
    (config as any).data = { referralCode: ref };
    return config;
  } catch {
    return config;
  }
}

(function init() {
  // Captura ?ref= na URL atual e persiste (sem alterar UI)
  try {
    const ref = new URLSearchParams(location.search).get('ref');
    if (ref) saveReferral(ref);
  } catch {}

  axios.interceptors.request.use((cfg) => injectReferral(cfg));
})();
