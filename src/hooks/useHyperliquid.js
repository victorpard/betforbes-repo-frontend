import { useState, useEffect, useCallback } from 'react';
import { hyperliquidApi } from '../services/hyperliquidApi';

export function useMarketData() {
  const [marketData, setMarketData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMarketData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await hyperliquidApi.getMarketData();
      setMarketData(response.data || []);
    } catch (err) {
      setError(err.message);
      console.error('[useMarketData] Error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMarketData();
    
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

export function useAllMids() {
  const [mids, setMids] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMids = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await hyperliquidApi.getAllMids();
      setMids(response.data || {});
    } catch (err) {
      setError(err.message);
      console.error('[useAllMids] Error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMids();
    
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

export function useUserData(address) {
  const [userData, setUserData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
      setError(err.message);
      console.error('[useUserData] Error:', err);
      setUserData({});
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    fetchUserData();
    
    if (address) {
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
