export const REF_KEY = 'bf_referral_code';

/** Salva o código no storage (sem alterar o conteúdo digitado) */
export function saveReferral(code: string) {
  try { if (code) localStorage.setItem(REF_KEY, String(code).trim()); } catch {}
}

/** Lê o código salvo */
export function getReferral() {
  try { return localStorage.getItem(REF_KEY) || ''; } catch { return ''; }
}

/** Remove o código salvo */
export function clearReferral() {
  try { localStorage.removeItem(REF_KEY); } catch {}
}

/** Normaliza para maiúsculas e valida 6–12 alfanuméricos */
export function normalize(code?: string) {
  const c = String(code || '').trim().toUpperCase();
  return /^[A-Z0-9]{6,12}$/.test(c) ? c : '';
}

/** Monta o link de convite usando o código salvo (ou fornecido) */
export function buildInviteLink(origin: string, code?: string) {
  const base = (origin || '').replace(/\/+$/, '');
  const ref = normalize(code || getReferral());
  return ref ? `${base}/cadastro?ref=${ref}` : `${base}/cadastro`;
}
