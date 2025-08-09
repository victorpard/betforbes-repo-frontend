import { useEffect, useCallback } from 'react';
import { apiService } from '../services/apiService';

interface UseAuthPersistenceProps {
  setUser: (user: any) => void;
  setIsLoading: (loading: boolean) => void;
}

export const useAuthPersistence = ({ setUser, setIsLoading }: UseAuthPersistenceProps) => {
  // Função para verificar e renovar token periodicamente
  const checkTokenValidity = useCallback(async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    try {
      // Verifica se o token está próximo do vencimento (5 minutos antes)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expirationTime = payload.exp * 1000;
      const currentTime = Date.now();
      const timeUntilExpiration = expirationTime - currentTime;
      
      // Se faltam menos de 5 minutos para expirar, renova o token
      if (timeUntilExpiration < 5 * 60 * 1000 && timeUntilExpiration > 0) {
        console.log('🔄 useAuthPersistence: Renovando token preventivamente...');
        await apiService.refreshToken();
      }
    } catch (error) {
      console.error('Erro ao verificar validade do token:', error);
    }
  }, []);

  // Configura verificação periódica do token
  useEffect(() => {
    // Verifica imediatamente
    checkTokenValidity();
    
    // Configura verificação a cada 2 minutos
    const interval = setInterval(checkTokenValidity, 2 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [checkTokenValidity]);

  // Listener para mudanças no localStorage (múltiplas abas)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'accessToken') {
        if (!e.newValue) {
          // Token foi removido, fazer logout
          setUser(null);
          console.log('🔄 useAuthPersistence: Token removido em outra aba, fazendo logout');
        } else if (e.oldValue !== e.newValue) {
          // Token foi atualizado, revalidar
          console.log('🔄 useAuthPersistence: Token atualizado em outra aba, revalidando...');
          apiService.setAuthHeader(e.newValue);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [setUser]);

  // Listener para quando a aba fica visível novamente
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Aba ficou visível, verifica se o token ainda é válido
        checkTokenValidity();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [checkTokenValidity]);
};
