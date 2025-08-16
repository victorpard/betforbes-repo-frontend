export function getAccessToken(): string {
  try {
    for (const k of ['accessToken','token','authToken']) {
      const v = localStorage.getItem(k);
      if (v) return v.replace(/^"|"$/g, '');
    }
    const raw = localStorage.getItem('betforbes_user') || localStorage.getItem('user');
    if (raw) {
      const u = JSON.parse(raw);
      return u?.accessToken || u?.token || u?.tokens?.access?.token || '';
    }
  } catch {}
  return '';
}
