import React, { useEffect, useState } from 'react';
import { useAllMids } from '../../hooks/useCryptoData';

// Componente que exibe preços em tempo real
export function RealTimePrices() {
  const { mids, loading } = useAllMids();
  const [visibleCoins, setVisibleCoins] = useState<string[]>(['BTC', 'ETH', 'SOL', 'BNB', 'ADA']);
  
  if (loading) {
    return <div className="text-center py-2">Carregando preços em tempo real...</div>;
  }
  
  return (
    <div className="grid grid-cols-5 gap-2 mb-4">
      {visibleCoins.map(coin => {
        const price = mids[coin];
        return (
          <div key={coin} className="bg-gray-800 rounded p-2 text-center">
            <div className="font-bold">{coin}</div>
            <div className="text-yellow-400">${price ? price.toLocaleString() : '---'}</div>
          </div>
        );
      })}
    </div>
  );
}
