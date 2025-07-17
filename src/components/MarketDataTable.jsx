import { useState } from 'react';
import { useMarketData } from '../hooks/useHyperliquid';

export function MarketDataTable() {
  const { marketData, loading, error, refetch } = useMarketData();
  const [sortBy, setSortBy] = useState('coin');
  const [sortOrder, setSortOrder] = useState('asc');

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const sortedData = [...marketData].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];

    if (sortBy === 'price') {
      aValue = parseFloat(aValue) || 0;
      bValue = parseFloat(bValue) || 0;
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const formatPrice = (price) => {
    const num = parseFloat(price);
    if (isNaN(num)) return '0.00';
    
    if (num >= 1000) {
      return num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    } else if (num >= 1) {
      return num.toFixed(4);
    } else {
      return num.toFixed(6);
    }
  };

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Dados de Mercado</h2>
          <button 
            onClick={refetch}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Recarregar
          </button>
        </div>
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">Erro ao carregar dados: {error}</p>
          <button 
            onClick={refetch}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Dados de Mercado Hyperliquid</h2>
        <button 
          onClick={refetch}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Carregando...' : 'Recarregar'}
        </button>
      </div>

      {loading && marketData.length === 0 ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Carregando dados de mercado...</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th 
                  className="text-left p-2 cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort('coin')}
                >
                  Moeda {sortBy === 'coin' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  className="text-right p-2 cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort('price')}
                >
                  Preço {sortBy === 'price' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th className="text-right p-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {sortedData.map((coin) => (
                <tr key={coin.coin} className="border-b hover:bg-gray-50">
                  <td className="p-2">
                    <span className="inline-block bg-gray-100 px-2 py-1 rounded text-sm font-medium">
                      {coin.coin}
                    </span>
                  </td>
                  <td className="p-2 text-right font-mono">
                    ${formatPrice(coin.price)}
                  </td>
                  <td className="p-2 text-right">
                    <span className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                      Ativo
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {sortedData.length === 0 && !loading && (
            <div className="text-center py-8 text-gray-500">
              Nenhum dado de mercado disponível
            </div>
          )}
        </div>
      )}
    </div>
  );
}
