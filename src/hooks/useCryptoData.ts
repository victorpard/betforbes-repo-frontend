import { useState, useEffect, useCallback } from 'react';
import { hyperliquidApi } from '../services/hyperliquidService';

// Hook para dados de mercado
export function useMarketData() {
  const [marketData, setMarketData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMarketData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await hyperliquidApi.getMarketData();
      setMarketData(response.data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('[useMarketData] Error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMarketData();
    
    // Atualizar a cada 30 segundos
    const interval = setInterval(fetchMarketData, 30000);
    
    return () => clearInterval(interval);
  }, [fetchMarketData]);

  return {
    marketData,
    loading,
    error,
    refetch: fetchMarketData
  };
}

// Hook para preços em tempo real
export function useAllMids() {
  const [mids, setMids] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMids = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await hyperliquidApi.getAllMids();
      setMids(response.data || {});
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('[useAllMids] Error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMids();
    
    // Atualizar a cada 5 segundos para preços em tempo real
    const interval = setInterval(fetchMids, 5000);
    
    return () => clearInterval(interval);
  }, [fetchMids]);

  return {
    mids,
    loading,
    error,
    refetch: fetchMids
  };
}

// Hook para dados do usuário
export function useUserData(address: string) {
  const [userData, setUserData] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserData = useCallback(async () => {
    if (!address) {
      setUserData({});
      setLoading(false);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const [positions, balance] = await Promise.all([
        hyperliquidApi.getUserPositions(address),
        hyperliquidApi.getUserBalance(address)
      ]);
      
      setUserData({
        positions: positions.data || [],
        balance: balance.data || {}
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('[useUserData] Error:', err);
      setUserData({});
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    fetchUserData();
    
    if (address) {
      // Atualizar a cada 10 segundos se há endereço
      const interval = setInterval(fetchUserData, 10000);
      return () => clearInterval(interval);
    }
  }, [fetchUserData, address]);

  return {
    userData,
    loading,
    error,
    refetch: fetchUserData
  };
}

// Hook para verificar saúde da conexão
export function useConnectionHealth() {
  const [isHealthy, setIsHealthy] = useState(true);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const checkHealth = useCallback(async () => {
    try {
      const response = await hyperliquidApi.healthCheck();
      setIsHealthy(response.success);
      setLastCheck(new Date());
    } catch (err) {
      setIsHealthy(false);
      setLastCheck(new Date());
      console.error('[useConnectionHealth] Error:', err);
    }
  }, []);

  useEffect(() => {
    checkHealth();
    
    // Verificar saúde a cada 60 segundos
    const interval = setInterval(checkHealth, 60000);
    
    return () => clearInterval(interval);
  }, [checkHealth]);

  return {
    isHealthy,
    lastCheck,
    checkHealth
  };
}
