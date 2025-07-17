import { useState } from 'react';
import { useUserData } from '../hooks/useHyperliquid';

export function UserDashboard() {
  const [userAddress, setUserAddress] = useState('');
  const [submittedAddress, setSubmittedAddress] = useState('');
  const { userData, loading, error, refetch } = useUserData(submittedAddress);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (userAddress.trim()) {
      setSubmittedAddress(userAddress.trim());
    }
  };

  const formatPrice = (price) => {
    const num = parseFloat(price);
    if (isNaN(num)) return '0.00';
    return num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 6 });
  };

  const formatPnL = (pnl) => {
    const num = parseFloat(pnl);
    if (isNaN(num)) return '0.00';
    return `${num >= 0 ? '+' : ''}${formatPrice(num)}`;
  };

  const getPnLColor = (pnl) => {
    const num = parseFloat(pnl);
    if (num > 0) return 'text-green-600';
    if (num < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <div className="space-y-6">
      {/* Formulário de Endereço */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Dashboard do Usuário</h2>
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <input
            type="text"
            placeholder="Endereço da carteira (0x...)"
            value={userAddress}
            onChange={(e) => setUserAddress(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button 
            type="submit" 
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Carregando...' : 'Consultar'}
          </button>
        </form>
        
        {submittedAddress && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Consultando dados para:</p>
            <p className="font-mono text-sm break-all">{submittedAddress}</p>
          </div>
        )}
      </div>

      {/* Dados do Usuário */}
      {submittedAddress && (
        <>
          {error ? (
            <div className="bg-white rounded-lg shadow p-6">
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
          ) : loading ? (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p>Carregando dados da conta...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Resumo da Conta */}
              {userData.balance && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-600 text-sm">$</span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Saldo Total</p>
                        <p className="text-2xl font-bold">${formatPrice(userData.balance.totalBalance)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 text-sm">💰</span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Disponível</p>
                        <p className="text-2xl font-bold">${formatPrice(userData.balance.availableBalance)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                        <span className="text-orange-600 text-sm">📊</span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Margem Usada</p>
                        <p className="text-2xl font-bold">${formatPrice(userData.balance.marginUsed)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-purple-600 text-sm">📈</span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">PnL Não Realizado</p>
                        <p className={`text-2xl font-bold ${getPnLColor(userData.balance.unrealizedPnl)}`}>
                          ${formatPnL(userData.balance.unrealizedPnl)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Posições */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">
                    Posições Abertas ({userData.positions?.length || 0})
                  </h3>
                  <button 
                    onClick={refetch}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                  >
                    Atualizar
                  </button>
                </div>

                {userData.positions?.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Moeda</th>
                          <th className="text-left p-2">Lado</th>
                          <th className="text-right p-2">Tamanho</th>
                          <th className="text-right p-2">Preço Entrada</th>
                          <th className="text-right p-2">Preço Atual</th>
                          <th className="text-right p-2">PnL</th>
                        </tr>
                      </thead>
                      <tbody>
                        {userData.positions.map((position, index) => (
                          <tr key={index} className="border-b hover:bg-gray-50">
                            <td className="p-2">
                              <span className="inline-block bg-gray-100 px-2 py-1 rounded text-sm">
                                {position.coin}
                              </span>
                            </td>
                            <td className="p-2">
                              <span className={`inline-block px-2 py-1 rounded text-sm ${
                                position.side === 'long' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {position.side.toUpperCase()}
                              </span>
                            </td>
                            <td className="p-2 text-right font-mono">{formatPrice(position.size)}</td>
                            <td className="p-2 text-right font-mono">${formatPrice(position.entryPrice)}</td>
                            <td className="p-2 text-right font-mono">${formatPrice(position.markPrice)}</td>
                            <td className={`p-2 text-right font-mono ${getPnLColor(position.pnl)}`}>
                              ${formatPnL(position.pnl)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>Nenhuma posição aberta</p>
                  </div>
                )}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
