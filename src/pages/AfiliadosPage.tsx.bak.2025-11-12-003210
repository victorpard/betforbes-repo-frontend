import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import InviteFriendsModal from '../components/InviteFriendsModal';
import { useAffiliateStats } from '../hooks/useAffiliateStats';

const AfiliadosPage: React.FC = () => {
  const navigate = useNavigate();
  const [showInviteModal, setShowInviteModal] = useState(false);
  const { stats, referrals, loading, error } = useAffiliateStats();

  const totalCommissions = stats?.totalEarnings || 0;
  // Estimativa (5%) apenas para exibição; quando tiver valor real de volume, troque aqui:
  const totalVolume = totalCommissions * 20;
  const activeAffiliates = stats?.activeReferrals || 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1e1e1e] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-golden text-4xl mb-4">⏳</div>
          <p className="text-silver">Carregando dados...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#1e1e1e] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-golden text-black px-4 py-2 rounded-lg"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  const makeInitials = (name?: string | null, email?: string) => {
    const base = (name && name.trim()) || email || '';
    const parts = base.split(/\s+/).filter(Boolean);
    const first = parts[0]?.[0] || '';
    const last = parts.length > 1 ? parts[parts.length - 1]?.[0] || '' : (base[1] || '');
    return (first + last).toUpperCase().slice(0, 2) || 'U';
  };

  return (
    <div className="min-h-screen bg-[#1e1e1e] text-white">
      {/* Header */}
      <header className="flex justify-between items-center p-4 pt-8">
        <button
          onClick={() => navigate('/')}
          className="text-golden text-2xl hover:scale-110 transition-transform"
          aria-label="Voltar"
        >
          ←
        </button>
        <h1 className="text-golden text-2xl font-bold">Afiliados</h1>
        <div className="w-8" />
      </header>

      <div className="px-4 mt-4">
        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-[#2a2a2a] rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">👥</span>
              <span className="text-silver text-xs">ATIVOS</span>
            </div>
            <p className="text-silver text-sm">Afiliados Ativos</p>
            <p className="text-[#27c93f] text-2xl font-bold">{activeAffiliates}</p>
          </div>

          <div className="bg-[#2a2a2a] rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">💰</span>
              <span className="text-silver text-xs">GANHOS</span>
            </div>
            <p className="text-silver text-sm">Comissões Totais</p>
            <p className="text-golden text-2xl font-bold">
              R$ {totalCommissions.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        {/* Performance (estimativa baseada em 5%) */}
        <div className="bg-[#2a2a2a] rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white text-lg font-semibold">Performance Geral</h3>
            <span className="text-2xl">📊</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-silver text-sm">Volume Total Gerado</p>
              <p className="text-golden text-lg font-bold">
                R$ {totalVolume.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div>
              <p className="text-silver text-sm">Taxa de Comissão</p>
              <p className="text-[#27c93f] text-lg font-bold">5%</p>
            </div>
          </div>
        </div>

        {/* Botão: Convidar */}
        <button
          onClick={() => setShowInviteModal(true)}
          className="w-full bg-gradient-to-r from-golden to-yellow-600 hover:from-yellow-500 hover:to-golden text-black font-bold py-4 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-3 shadow-lg mb-6"
        >
          <span className="text-2xl">👥</span>
          <span className="text-lg">Convidar Novos Amigos</span>
          <span className="text-xl">💰</span>
        </button>

        {/* Lista: Meus Afiliados */}
        <div className="mb-6">
          <h3 className="text-golden text-lg font-semibold mb-4">
            Meus Afiliados ({referrals.length})
          </h3>

          {referrals.length === 0 ? (
            <div className="bg-[#2a2a2a] rounded-lg p-6 text-center">
              <div className="text-4xl mb-4">👥</div>
              <p className="text-silver mb-2">Nenhum afiliado ainda</p>
              <p className="text-silver text-sm">Convide amigos para começar a ganhar comissões!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {referrals.map((referral) => {
                const initials = makeInitials(referral.name, referral.email);
                return (
                  <div key={referral.id} className="bg-[#2a2a2a] rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-golden to-yellow-600 rounded-full flex items-center justify-center">
                          <span className="text-black font-bold text-sm">{initials}</span>
                        </div>
                        <div>
                          <p className="text-white font-semibold">
                            {referral.name || '—'}
                          </p>
                          <p className="text-silver text-sm">{referral.email}</p>
                        </div>
                      </div>
                      <div
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          referral.isVerified
                            ? 'bg-[#27c93f] bg-opacity-20 text-[#27c93f]'
                            : 'bg-[#e74c3c] bg-opacity-20 text-[#e74c3c]'
                        }`}
                      >
                        {referral.isVerified ? 'Ativo' : 'Pendente'}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-silver text-xs">Status</p>
                        <p className="text-white font-semibold">
                          {referral.isVerified ? 'Verificado' : 'Pendente'}
                        </p>
                      </div>
                      <div>
                        <p className="text-silver text-xs">Comissão</p>
                        <p className="text-[#27c93f] font-semibold text-sm">
                          R$ {(referral.totalEarnings || 0).toLocaleString('pt-BR', {
                            minimumFractionDigits: 2,
                          })}
                        </p>
                      </div>
                      <div>
                        <p className="text-silver text-xs">Cadastro</p>
                        <p className="text-silver font-semibold text-sm">
                          {new Date(referral.createdAt).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-[#3a3a3a]">
                      <p className="text-silver text-xs">
                        Membro desde: {new Date(referral.createdAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Como funciona */}
        <div className="bg-[#2a2a2a] rounded-lg p-4 mb-20">
          <h3 className="text-golden text-lg font-semibold mb-4">Como Funciona</h3>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <span className="text-[#27c93f] text-lg">1.</span>
              <div>
                <p className="text-white font-semibold">Convide Amigos</p>
                <p className="text-silver text-sm">Compartilhe seu link de convite exclusivo</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-[#27c93f] text-lg">2.</span>
              <div>
                <p className="text-white font-semibold">Eles Apostam</p>
                <p className="text-silver text-sm">Seus amigos fazem apostas na plataforma</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-[#27c93f] text-lg">3.</span>
              <div>
                <p className="text-white font-semibold">Você Ganha</p>
                <p className="text-silver text-sm">Receba 5% de comissão vitalícia automaticamente</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Convite (mostra link real) */}
      <InviteFriendsModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
      />
    </div>
  );
};

export default AfiliadosPage;
