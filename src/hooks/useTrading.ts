import { useState, useCallback } from 'react';
import { hyperliquidService } from '../services/hyperliquidService';

// Interface para ordens
interface OrderRequest {
  coin: string;
  is_buy: boolean;
  sz: number;
  limit_px: number;
  order_type: 'limit' | 'market';
  reduce_only?: boolean;
}

// Hook para execução de ordens
export function useOrderExecution() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderResult, setOrderResult] = useState<any>(null);

  // Executar ordem
  const executeOrder = useCallback(async (order: OrderRequest) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await hyperliquidService.placeOrder(order);
      setOrderResult(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('[useOrderExecution] Error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Cancelar ordem
  const cancelOrder = useCallback(async (orderId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await hyperliquidService.cancelOrder(orderId);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('[useOrderExecution] Cancel Error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    executeOrder,
    cancelOrder,
    isLoading,
    error,
    orderResult
  };
}

// Hook para histórico de ordens
export function useOrderHistory(userAddress: string) {
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Buscar histórico
  const fetchHistory = useCallback(async () => {
    if (!userAddress) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await hyperliquidService.getOrderHistory(userAddress);
      setHistory(data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('[useOrderHistory] Error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userAddress]);

  return {
    history,
    isLoading,
    error,
    fetchHistory
  };
}

// Hook para calcular tamanho da ordem baseado em alavancagem
export function useOrderSizing() {
  // Calcular tamanho da ordem com alavancagem
  const calculateOrderSize = useCallback((
    balance: number,
    price: number,
    leverage: number,
    percentOfBalance: number = 100
  ) => {
    // Valor disponível para a ordem
    const availableValue = balance * (percentOfBalance / 100);
    
    // Tamanho da ordem com alavancagem
    const orderSize = (availableValue * leverage) / price;
    
    return {
      orderSize,
      notionalValue: orderSize * price,
      leverage,
      marginRequired: (orderSize * price) / leverage
    };
  }, []);

  // Calcular lucro/prejuízo potencial
  const calculatePnL = useCallback((
    orderSize: number,
    entryPrice: number,
    exitPrice: number,
    isLong: boolean
  ) => {
    if (isLong) {
      return orderSize * (exitPrice - entryPrice);
    } else {
      return orderSize * (entryPrice - exitPrice);
    }
  }, []);

  return {
    calculateOrderSize,
    calculatePnL
  };
}

// Hook para gerenciar posições abertas
export function usePositionManagement(userAddress: string) {
  const [positions, setPositions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Buscar posições
  const fetchPositions = useCallback(async () => {
    if (!userAddress) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await hyperliquidService.getUserPositions(userAddress);
      setPositions(data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('[usePositionManagement] Error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userAddress]);

  // Fechar posição
  const closePosition = useCallback(async (
    coin: string,
    size: number,
    isLong: boolean,
    marketPrice: number
  ) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Para fechar uma posição, fazemos o oposto da direção atual
      const order: OrderRequest = {
        coin,
        is_buy: !isLong, // Inverter direção para fechar
        sz: size,
        limit_px: marketPrice,
        order_type: 'market',
        reduce_only: true // Importante: apenas reduzir posição
      };
      
      const result = await hyperliquidService.placeOrder(order);
      await fetchPositions(); // Atualizar posições após fechar
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('[usePositionManagement] Close Error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [fetchPositions]);

  return {
    positions,
    isLoading,
    error,
    fetchPositions,
    closePosition
  };
}

// Hook para gerenciar saldo e margem
export function useBalanceManagement(userAddress: string) {
  const [balance, setBalance] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Buscar saldo
  const fetchBalance = useCallback(async () => {
    if (!userAddress) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await hyperliquidService.getUserBalance(userAddress);
      setBalance(data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('[useBalanceManagement] Error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userAddress]);

  return {
    balance,
    isLoading,
    error,
    fetchBalance
  };
}
