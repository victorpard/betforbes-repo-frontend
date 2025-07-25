import { useState, useEffect } from 'react';
import { getTicker } from '../services/marketService';

export function useTicker(pair: string, intervalMs = 5000) {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchData() {
      try {
        const result = await getTicker(pair);
        if (mounted) setData(result);
      } catch (err: any) {
        if (mounted) setError(err.message);
      }
    }

    fetchData();
    const id = setInterval(fetchData, intervalMs);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, [pair, intervalMs]);

  return { data, error };
}
