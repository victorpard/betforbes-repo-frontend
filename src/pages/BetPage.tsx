import { useNavigate } from 'react-router-dom';
import { useAllMids, useMarketData } from '../hooks/useHyperliquid';
import { useAuth } from '../contexts/AuthContext';

// Tipos de ordem
type OrderType = 'market' | 'limit';

// Tipos para os dados da aposta
interface BetData {
  assetSymbol: string | null;
  amount: string;
  leverage: number;
  direction: 'long' | 'short' | null;
  orderType: OrderType;
  targetPrice: string;
  potentialGain: number;
  potentialLoss: number;
  fees: number;
}

const BetPage: React.FC = () => {
console.log('🎲 [BetPage] montado em', window.location.pathname);
  const navigate = useNavigate();
  const { user } = useAuth();
  const [betData, setBetData] = useState<BetData>({
    assetSymbol: null,
    amount: '',
    leverage: 1,
    direction: null,
    orderType: 'market',
    targetPrice: '',
    potentialGain: 0,
    potentialLoss: 0,
    fees: 0,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [chartPeriod, setChartPeriod] = useState('24h');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const availableBalance = user?.balance ?? 0;
  const { mids, loading: midsLoading } = useAllMids();
  const { marketData, loading: marketDataLoading } = useMarketData(betData.assetSymbol);

  const assets = useMemo(() =>
    Object.keys(mids).map(symbol => ({ symbol, price: parseFloat(mids[symbol]) })),
    [mids]
  );
  const filteredAssets = useMemo(
    () => assets.filter(a => a.symbol.toLowerCase().includes(searchTerm.toLowerCase())),
    [searchTerm, assets]
  );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (marketData && betData.amount && betData.direction) {
      const amount = parseFloat(betData.amount);
      const leverage = betData.leverage;
      const price = parseFloat(marketData.markPx);
      const priceMovement = price * 0.05;
      const leveraged = amount * leverage;
      const gain = (priceMovement / price) * leveraged;
      const fees = amount * 0.001;
      setBetData(prev => ({ ...prev, potentialGain: gain, potentialLoss: gain, fees }));
    }
  }, [marketData, betData.amount, betData.leverage, betData.direction]);

  // Handlers omitidos para brevidade, mantêm-se iguais

  const getRiskLevel = (lev: number) => {
    if (lev <= 5) return { level: 'Baixo', color: 'bg-green-500' };
    if (lev <= 15) return { level: 'Médio', color: 'bg-yellow-500' };
    if (lev <= 30) return { level: 'Alto', color: 'bg-orange-500' };
    return { level: 'Muito Alto', color: 'bg-red-500' };
  };

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  const formatVolume = (v: number) => {
    if (v >= 1e9) return `$${(v / 1e9).toFixed(1)}B`;
    if (v >= 1e6) return `$${(v / 1e6).toFixed(1)}M`;
    return `$${(v / 1e3).toFixed(1)}K`;
  };

  return (
    <div className="min-h-screen bg-[#1e1e1e] text-white">
      <header className="flex items-center justify-between p-4 border-b border-gray-700">
        <button onClick={() => navigate('/')} className="text-golden text-xl">←</button>
        <h1 className="text-golden text-xl font-bold">Nova Aposta</h1>
        <div className="w-6" />
      </header>

      {showSuccessMessage && (
        <div className="mb-4 p-4 bg-green-900 text-white rounded">
          🎉 Aposta realizada com sucesso!
        </div>
      )}

      <div className="p-4 space-y-6 pb-24 md:pb-6">
        {/* Seleção de Ativo */}
        <div className="space-y-3">
          <h2 className="text-golden text-lg font-semibold">Selecionar Ativo</h2>
          <div className="relative" ref={dropdownRef}>
            <input
              type="text"
              placeholder="Buscar criptomoeda..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              onFocus={() => setIsDropdownOpen(true)}
              className="w-full p-3 bg-[#2a2a2a] border-2 border-gray-600 rounded-lg"
            />
            {isDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-[#2a2a2a] border rounded-lg max-h-60 overflow-y-auto">
                {midsLoading
                  ? <div className="p-3 text-center text-gray-400">Carregando...</div>
                  : filteredAssets.map(a => (
                      <button
                        key={a.symbol}
                        onClick={() => {/* handle select */}}
                        className="w-full p-3 text-left hover:bg-[#3a3a3a]"
                      >
                        <span className="font-semibold">{a.symbol}</span>
                        <span className="float-right">${a.price}</span>
                      </button>
                    ))}
              </div>
            )}
          </div>
        </div>

        {/* Card do Ativo Selecionado */}
        {marketData && !marketDataLoading ? (
          <div className="bg-[#2a2a2a] border-2 border-golden rounded-lg p-4">
            <div className="flex justify-between">
              <div>
                <h3 className="text-xl font-bold">{marketData.name}</h3>
                <p className="text-gray-400">{betData.assetSymbol}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">${parseFloat(marketData.markPx)}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Volume 24h:</span>
                <span className="ml-2 font-semibold">{formatVolume(parseFloat(marketData.dayNtlVlm))}</span>
              </div>
              <div>
                <span className="text-gray-400">Funding 1h:</span>
                <span className="ml-2 font-semibold">{(parseFloat(marketData.fundingRate)*100).toFixed(4)}%</span>
              </div>
            </div>
          </div>
        ) : (
          betData.assetSymbol && <div className="text-center p-4">Carregando dados do ativo...</div>
        )}

        {/* Aqui seguem demais campos de formulário, botões e sliders conforme seu design original */}
      </div>
    </div>
  );
};

export default BetPage;
