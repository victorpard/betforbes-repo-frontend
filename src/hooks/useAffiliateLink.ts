import { useState, useEffect } from 'react';
import axios from 'axios';

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
        const token = localStorage.getItem('token');
        const response = await axios.get<{
          success: boolean;
          data: AffiliateLinkData;
        }>('/api/affiliates/link', {
          headers: {
            Authorization: token ? `Bearer ${token}` : ''
          },
          withCredentials: true
        });

        if (response.data.success) {
          setData(response.data.data);
        } else {
          setError('Não foi possível carregar seu link');
        }
      } catch (err: any) {
        console.error(err);
        setError('Erro ao buscar link de afiliado');
      } finally {
        setLoading(false);
      }
    }

    fetchLink();
  }, []);

  return { data, loading, error };
}
