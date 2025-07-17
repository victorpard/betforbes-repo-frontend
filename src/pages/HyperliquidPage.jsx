import { MarketDataTable } from '../components/MarketDataTable';
import { PriceDisplay } from '../components/PriceDisplay';
import { UserDashboard } from '../components/UserDashboard';

export function HyperliquidPage() {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Hyperliquid Trading</h1>
          <p className="mt-2 text-gray-600">
            Dados de mercado em tempo real e dashboard de usuários
          </p>
        </div>

        <div className="space-y-8">
          {/* Dashboard do Usuário */}
          <UserDashboard />

          {/* Preços em Tempo Real */}
          <PriceDisplay />

          {/* Tabela de Dados de Mercado */}
          <MarketDataTable />
        </div>
      </div>
    </div>
  );
}
