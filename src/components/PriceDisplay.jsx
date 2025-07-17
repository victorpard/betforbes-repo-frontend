import { useAllMids } from '../hooks/useHyperliquid';

export function PriceDisplay() {
  const { mids, loading, error, refetch } = useAllMids();

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

  const mainCoins = ['BTC', 'ETH', 'SOL', 'AVAX', 'ARB'];
  const otherCoins = Object.keys(mids).filter(coin => !mainCoins.includes(coin));

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Preços em Tempo Real</h2>
          <button 
            onClick={refetch}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Recarregar
          </button>
        </div>
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">Erro ao carregar preços: {error}</p>
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
        <h2 className="text-xl font-bold">Preços em Tempo Real</h2>
        <button 
          onClick={refetch}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Carregando...' : 'Recarregar'}
        </button>
      </div>

      {Object.keys(mids).length === 0 && loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Carregando preços...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Principais Moedas */}
          {mainCoins.some(coin => mids[coin]) && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Principais Moedas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mainCoins.map(coin => {
                  if (!mids[coin]) return null;
                  
                  return (
                    <div key={coin} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-semibold">
                          {coin}
                        </span>
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      </div>
                      <div className="text-2xl font-bold font-mono">
                        ${formatPrice(mids[coin])}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        USD
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Outras Moedas */}
          {otherCoins.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Outras Moedas</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {otherCoins.slice(0, 20).map(coin => (
                  <div key={coin} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="inline-block bg-gray-200 text-gray-800 px-2 py-1 rounded text-xs">
                        {coin}
                      </span>
                    </div>
                    <div className="text-lg font-bold font-mono">
                      ${formatPrice(mids[coin])}
                    </div>
                  </div>
                ))}
              </div>
              
              {otherCoins.length > 20 && (
                <div className="text-center mt-4">
                  <span className="inline-block bg-gray-100 px-3 py-1 rounded text-sm">
                    +{otherCoins.length - 20} moedas adicionais
                  </span>
                </div>
              )}
            </div>
          )}

          {Object.keys(mids).length === 0 && !loading && (
            <div className="text-center py-8 text-gray-500">
              <p>Nenhum preço disponível</p>
              <button 
                onClick={refetch}
                className="mt-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Recarregar
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
