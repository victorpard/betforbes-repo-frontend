import React, { useEffect, useMemo, useState } from 'react';
import api from '@/services/api';

type Stats = {
  totalReferrals: number;
  activeReferrals: number;
  totalEarnings: number;
  referralLink: string;
};

type Referral = {
  id: string;
  name: string | null;
  email: string;
  isVerified: boolean;
  createdAt: string; // ISO
};

const PAGE_LIMIT = 20;

const AffiliatesPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [stats, setStats] = useState<Stats | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const hasMore = referrals.length < total;

  const origin =
    typeof window !== 'undefined' ? window.location.origin : 'https://www.betforbes.com';

  // Link de convite exibido no topo
  const inviteLink = useMemo(() => {
    return stats?.referralLink ?? `${origin}/cadastro`;
  }, [stats, origin]);

  async function loadFirstPage() {
    setLoading(true);
    setError(null);
    try {
      const [linkRes, statsRes, refsRes] = await Promise.all([
        api.get('/affiliate/link'),
        api.get('/affiliate/stats'),
        api.get('/affiliate/referrals', { params: { page: 1, limit: PAGE_LIMIT } }),
      ]);

      // /affiliate/link
      // (nós não precisamos do referralCode aqui porque o stats já traz o referralLink,
      // mas se quiser, pode ler de linkRes.data.data.referralCode)
      // /affiliate/stats
      const s: Stats = statsRes?.data?.data;
      setStats(s);

      // /affiliate/referrals
      const data = refsRes?.data?.data;
      setReferrals(data?.referrals ?? []);
      setTotal(data?.total ?? 0);
      setPage(data?.page ?? 1);
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Falha ao carregar afiliados');
    } finally {
      setLoading(false);
    }
  }

  async function loadMore() {
    if (!hasMore || loadingMore) return;
    setLoadingMore(true);
    setError(null);
    try {
      const next = page + 1;
      const res = await api.get('/affiliate/referrals', {
        params: { page: next, limit: PAGE_LIMIT },
      });
      const data = res?.data?.data;
      setReferrals((prev) => [...prev, ...(data?.referrals ?? [])]);
      setTotal(data?.total ?? total);
      setPage(data?.page ?? next);
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Falha ao carregar mais afiliados');
    } finally {
      setLoadingMore(false);
    }
  }

  useEffect(() => {
    loadFirstPage();
  }, []);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      alert('Link copiado!');
    } catch {
      alert('Não foi possível copiar o link.');
    }
  };

  return (
    <div className="min-h-screen bg-[#1e1e1e] text-white px-4 py-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[#FFD700]">Programa de Afiliados</h1>
        </header>

        {/* Link de convite (sem mock) */}
        <section className="bg-[#2a2a2a] rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-2">Seu link de convite</h2>
          <div className="flex gap-2">
            <input
              className="flex-1 bg-[#1e1e1e] border border-[#3a3a3a] rounded-lg px-3 py-2"
              readOnly
              value={inviteLink}
            />
            <button
              onClick={copyLink}
              className="bg-[#FFD700] text-black font-semibold rounded-lg px-4 py-2 hover:bg-[#e6c200]"
            >
              Copiar
            </button>
          </div>
        </section>

        {/* Cards de estatística reais */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#2a2a2a] rounded-lg p-4">
            <p className="text-sm text-gray-400">Total de Afiliados</p>
            <p className="text-2xl font-bold text-[#FFD700]">{stats?.totalReferrals ?? 0}</p>
          </div>
          <div className="bg-[#2a2a2a] rounded-lg p-4">
            <p className="text-sm text-gray-400">Ativos (verificados)</p>
            <p className="text-2xl font-bold text-emerald-400">{stats?.activeReferrals ?? 0}</p>
          </div>
          <div className="bg-[#2a2a2a] rounded-lg p-4">
            <p className="text-sm text-gray-400">Ganhos (R$)</p>
            <p className="text-2xl font-bold text-emerald-400">
              {(stats?.totalEarnings ?? 0).toFixed(2)}
            </p>
          </div>
        </section>

        {/* Lista de afiliados reais */}
        <section className="bg-[#2a2a2a] rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-3">Meus afiliados</h2>

          {loading && <div className="text-gray-400">Carregando…</div>}
          {error && !loading && (
            <div className="text-red-400 text-sm border border-red-500/40 rounded p-2 bg-red-500/10">
              {error}
            </div>
          )}

          {!loading && referrals.length === 0 && !error && (
            <div className="text-gray-400">Você ainda não possui afiliados.</div>
          )}

          {!loading && referrals.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-400 border-b border-[#3a3a3a]">
                    <th className="py-2">Nome</th>
                    <th className="py-2">Email</th>
                    <th className="py-2">Status</th>
                    <th className="py-2">Criado em</th>
                  </tr>
                </thead>
                <tbody>
                  {referrals.map((r) => (
                    <tr key={r.id} className="border-b border-[#3a3a3a]">
                      <td className="py-2">{r.name || '—'}</td>
                      <td className="py-2">{r.email}</td>
                      <td className="py-2">
                        {r.isVerified ? (
                          <span className="text-emerald-400">Verificado</span>
                        ) : (
                          <span className="text-yellow-400">Pendente</span>
                        )}
                      </td>
                      <td className="py-2">
                        {new Date(r.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {hasMore && (
                <div className="mt-3">
                  <button
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="w-full bg-[#3a3a3a] hover:bg-[#4a4a4a] rounded-lg py-2"
                  >
                    {loadingMore ? 'Carregando…' : 'Carregar mais'}
                  </button>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default AffiliatesPage;
