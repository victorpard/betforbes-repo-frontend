const BASE = import.meta.env.VITE_API_URL || '';

export async function listAssets(): Promise<string[]> {
  const resp = await fetch(`${BASE}/api/markets`);
  if (!resp.ok) throw new Error(`Erro ${resp.status}`);
  return resp.json();
}

export async function getTicker(pair: string): Promise<any> {
  const resp = await fetch(`${BASE}/api/markets/${encodeURIComponent(pair)}`);
  if (!resp.ok) throw new Error(`Erro ${resp.status}`);
  return resp.json();
}
