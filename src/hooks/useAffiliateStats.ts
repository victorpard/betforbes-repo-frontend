import { useState, useEffect } from 'react';
import api from '@/services/api';

export interface AffiliateStats {
  totalReferrals: number;
  activeReferrals: number;
  totalEarnings: number;
  referralLink: string;
  referralCode?: string;
}

export interface Referral {
  id: string;
  name: string | null;
  email: string;
  isVerified: boolean;
  createdAt: string;
  totalEarnings?: number;
}

export function useAffiliateStats() {
  const [stats, setStats] = useState<AffiliateStats | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Tenta renovar o accessToken com o refreshToken salvo
  const tryRefresh = async (): Promise<boolean> => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) return false;
    try {
      const res = await api.post('/auth/refresh', { refreshToken });
      const newAT: string | undefined =
        res?.data?.accessToken || res?.data?.token;
      if (newAT) {
        localStorage.setItem('accessToken', newAT);
        return true;
      }
    } catch {
      /* noop */
    }
    return false;
  };

  useEffect(() => {
    let alive = true;

    const fetchAll = async () => {
      setLoading(true);
      setError(null);
      try {
        const [s, r] = await Promise.all([
          api.get('/affiliate/stats'),
          api.get('/affiliate/referrals', { params: { page: 1, limit: 50 } }),
        ]);

        if (!alive) return;

        if (s.data?.success && s.data?.data) setStats(s.data.data);
        else throw new Error(s.data?.message || 'Falha ao carregar estatísticas');

        if (r.data?.success && r.data?.data) {
          setReferrals(r.data.data.referrals || []);
        } else {
          throw new Error(r.data?.message || 'Falha ao carregar afiliados');
        }
      } catch (err: any) {
        // 401 -> tenta refresh uma vez e repete
        const status = err?.response?.status;
        if (status === 401) {
          const ok = await tryRefresh();
          if (ok) {
            try {
              const [s2, r2] = await Promise.all([
                api.get('/affiliate/stats'),
                api.get('/affiliate/referrals', { params: { page: 1, limit: 50 } }),
              ]);
              if (!alive) return;
              if (s2.data?.success && s2.data?.data) setStats(s2.data.data);
              if (r2.data?.success && r2.data?.data) {
                setReferrals(r2.data.data.referrals || []);
              }
              return;
            } catch (e2: any) {
              setError(e2?.message || 'Erro ao carregar dados de afiliados');
            }
          } else {
            setError('Sessão expirada. Faça login novamente.');
          }
        } else {
          setError(err?.message || 'Erro ao carregar dados de afiliados');
        }
      } finally {
        if (alive) setLoading(false);
      }
    };

    fetchAll();
    return () => {
      alive = false;
    };
  }, []);

  return { stats, referrals, loading, error };
}
