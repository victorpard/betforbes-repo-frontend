import { useState, useEffect } from 'react';

export interface AffiliateLinkData {
  referralLink: string;
  referralCode: string;
}

export function useAffiliateLink() {
  const [data, setData] = useState<AffiliateLinkData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLink() {
      try {
        setLoading(true);
        setError(null);

        // Buscar token correto do localStorage
        const token = localStorage.getItem('accessToken');
        if (!token) {
          setError('Usuário não autenticado');
          setLoading(false);
          return;
        }

        // Fazer requisição para a API
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api';
        const response = await fetch(`${apiBaseUrl}/affiliate/link`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        // Se receber 401, tentar refresh token
        if (response.status === 401) {
          const refreshToken = localStorage.getItem('refreshToken');
          if (refreshToken) {
            try {
              const refreshResponse = await fetch(`${apiBaseUrl}/auth/refresh`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({ refreshToken })
              });

              if (refreshResponse.ok) {
                const refreshData = await refreshResponse.json();
                if (refreshData.success && refreshData.data?.tokens?.accessToken) {
                  localStorage.setItem('accessToken', refreshData.data.tokens.accessToken);
                  localStorage.setItem('refreshToken', refreshData.data.tokens.refreshToken);
                  
                  // Tentar novamente com o novo token
                  const retryResponse = await fetch(`${apiBaseUrl}/affiliate/link`, {
                    method: 'GET',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${refreshData.data.tokens.accessToken}`
                    }
                  });

                  if (retryResponse.ok) {
                    const retryData = await retryResponse.json();
                    if (retryData.success) {
                      setData(retryData.data);
                      return;
                    }
                  }
                }
              }
            } catch (refreshError) {
              console.error('Erro ao renovar token:', refreshError);
            }
          }
          
          setError('Sessão expirada. Faça login novamente.');
          return;
        }

        if (!response.ok) {
          throw new Error(`Erro ${response.status}: ${response.statusText}`);
        }

        const responseData = await response.json();
        if (responseData.success) {
          setData(responseData.data);
        } else {
          setError('Não foi possível carregar seu link');
        }
      } catch (err: any) {
        console.error('Erro ao buscar link de afiliado:', err);
        setError('Erro ao buscar link de afiliado');
      } finally {
        setLoading(false);
      }
    }

    fetchLink();
  }, []);

  return { data, loading, error };
}
