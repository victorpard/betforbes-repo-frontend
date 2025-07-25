import { useState, useEffect } from 'react';
import { apiService, type AffiliateStats, type ReferralUser } from '../services/apiService';

interface UseAffiliatesReturn {
  // Estados
  stats: AffiliateStats | null;
  referralLink: string;
  referralCode: string;
  referrals: ReferralUser[];

  // Estados de loading
  isLoadingStats: boolean;
  isLoadingLink: boolean;
  isLoadingReferrals: boolean;

  // Estados de erro
  error: string | null;

  // Funções
  refreshStats: () => Promise<void>;
  refreshLink: () => Promise<void>;
  refreshReferrals: () => Promise<void>;
}

export const useAffiliates = (): UseAffiliatesReturn => {
  // Estados principais
  const [stats, setStats] = useState<AffiliateStats | null>(null);
  const [referralLink, setReferralLink] = useState<string>('');
  const [referralCode, setReferralCode] = useState<string>('');
  const [referrals, setReferrals] = useState<ReferralUser[]>([]);

  // Estados de loading
  const [isLoadingStats, setIsLoadingStats] = useState<boolean>(false);
  const [isLoadingLink, setIsLoadingLink] = useState<boolean>(false);
  const [isLoadingReferrals, setIsLoadingReferrals] = useState<boolean>(false);

  // Estado de erro
  const [error, setError] = useState<string | null>(null);

  // Função para buscar estatísticas
  const refreshStats = async (): Promise<void> => {
    setIsLoadingStats(true);
    setError(null);
    
    try {
      const response = await apiService.getAffiliateStats();
      if (response.success && response.data) {
        setStats(response.data);
      } else {
        throw new Error(response.message || 'Erro ao carregar estatísticas');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('Erro ao carregar estatísticas de afiliados:', err);
    } finally {
      setIsLoadingStats(false);
    }
  };

  // Função para buscar link de referência
  const refreshLink = async (): Promise<void> => {
    setIsLoadingLink(true);
    setError(null);
    
    try {
      const response = await apiService.getReferralLink();
      if (response.success && response.data) {
        setReferralLink(response.data.referralLink);
        setReferralCode(response.data.referralCode);
      } else {
        throw new Error(response.message || 'Erro ao carregar link de referência');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('Erro ao carregar link de referência:', err);
    } finally {
      setIsLoadingLink(false);
    }
  };

  // Função para buscar lista de referenciados
  const refreshReferrals = async (): Promise<void> => {
    setIsLoadingReferrals(true);
    setError(null);
    
    try {
      const response = await apiService.getReferralsList();
      if (response.success && response.data) {
        // A API retorna { referrals: [], total: 0, page: 1, totalPages: 0 }
        // Precisamos extrair apenas o array referrals
        setReferrals(response.data.referrals || []);
      } else {
        throw new Error(response.message || 'Erro ao carregar lista de referenciados');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('Erro ao carregar lista de referenciados:', err);
      // Em caso de erro, definir array vazio para evitar crashes
      setReferrals([]);
    } finally {
      setIsLoadingReferrals(false);
    }
  };

  // Carregar dados iniciais
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      // Configurar token no apiService
      apiService.setAuthHeader(token);
      
      // Carregar dados iniciais
      refreshStats();
      refreshLink();
      refreshReferrals();
    } else {
      console.warn('Token de acesso não encontrado no localStorage');
      setError('Token de acesso não encontrado. Faça login novamente.');
    }
  }, []);

  return {
    // Estados
    stats,
    referralLink,
    referralCode,
    referrals,

    // Estados de loading
    isLoadingStats,
    isLoadingLink,
    isLoadingReferrals,

    // Estado de erro
    error,

    // Funções
    refreshStats,
    refreshLink,
    refreshReferrals,
  };
};
