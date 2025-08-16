import { saveReferral } from '@/utils/referral';

(() => {
  try {
    const usp = new URLSearchParams(window.location.search);
    const ref = usp.get('ref');
    if (ref) saveReferral(ref);
  } catch {}
})();
