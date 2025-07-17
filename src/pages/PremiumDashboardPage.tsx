import React, { useState } from 'react';
import PremiumHeader from '../components/PremiumHeader';
import PremiumBalanceCard from '../components/PremiumBalanceCard';
import StatsCards from '../components/StatsCards';
import PremiumActionButtons from '../components/PremiumActionButtons';
import InviteFriendsModal from '../components/InviteFriendsModal';
import DepositModal from '../components/modals/DepositModal';
import WithdrawModal from '../components/modals/WithdrawModal';
import { useAuth } from '../contexts/AuthContext'; // 1. Importa o hook de autenticação
import { useNavigate } from 'react-router-dom';

const PremiumDashboardPage: React.FC = () => {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  const { user } = useAuth(); // 2. Pega os dados do usuário logado
  const navigate = useNavigate();

  // Funções para abrir os modais
  const handleDeposit = () => setShowDepositModal(true);
  const handleWithdraw = () => setShowWithdrawModal(true);
  const handleInviteFriends = () => setShowInviteModal(true);

  // Formata os números para o padrão brasileiro
  const formatCurrency = (value: number | undefined) => {
    if (value === undefined) return 'R$ 0,00';
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div className="min-h-screen bg-[#1e1e1e] text-white pb-20">
      <PremiumHeader
        userName={user?.name || 'Usuário'}
        notificationCount={0}
      />

      <main className="flex-grow">
        {/* 3. Usa os dados reais do usuário */}
        <PremiumBalanceCard
          balance={formatCurrency(user?.balance)}
          pnl={formatCurrency(user?.pnl)}
          isPositivePnl={(user?.pnl ?? 0) >= 0}
          onDeposit={handleDeposit}
          onWithdraw={handleWithdraw}
        />

        <StatsCards
          totalBet={formatCurrency(user?.totalBet)}
          totalWins={user?.totalWins ?? 0}
          winRate={user?.winRate ?? 0}
        />

        <PremiumActionButtons
          onInviteFriends={handleInviteFriends}
        />
      </main>

      <InviteFriendsModal isOpen={showInviteModal} onClose={() => setShowInviteModal(false)} />
      <DepositModal isOpen={showDepositModal} onClose={() => setShowDepositModal(false)} />
      <WithdrawModal isOpen={showWithdrawModal} onClose={() => setShowWithdrawModal(false)} availableBalance={formatCurrency(user?.balance)} />
    </div>
  );
};

export default PremiumDashboardPage;
