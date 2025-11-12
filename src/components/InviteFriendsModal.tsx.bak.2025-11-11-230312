import React, { useEffect, useMemo, useState } from 'react';
import api from '@/services/api';

interface InviteFriendsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const InviteFriendsModal: React.FC<InviteFriendsModalProps> = ({ isOpen, onClose }) => {
  const [referralCode, setReferralCode] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const origin =
    typeof window !== 'undefined' ? window.location.origin : 'https://www.betforbes.com';

  // carrega o code real do backend
  useEffect(() => {
    let alive = true;
    async function load() {
      if (!isOpen) return;
      setError(null);
      setLoading(true);
      try {
        const { data } = await api.get('/affiliate/link');
        if (!alive) return;

        // formatos aceitos: { success, data: { referralCode, referralLink } }
        const code =
          data?.data?.referralCode ??
          data?.referralCode ??
          '';

        if (data?.success && code) {
          setReferralCode(code);
        } else {
          setError('Erro ao carregar link');
        }
      } catch (e: any) {
        setError('Erro ao buscar link de afiliado');
      } finally {
        if (alive) setLoading(false);
      }
    }
    load();
    return () => {
      alive = false;
    };
  }, [isOpen]);

  const inviteLink = useMemo(() => {
    return referralCode ? `${origin}/cadastro?ref=${referralCode}` : '';
  }, [origin, referralCode]);

  const handleCopyLink = async () => {
    if (!inviteLink) return;
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      setError('Falha ao copiar link');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4">
      <div className="bg-[#2a2a2a] rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-golden text-2xl font-bold">Convidar Amigos</h2>
          <button onClick={onClose} className="text-silver hover:text-white text-2xl">✕</button>
        </div>

        {/* Título */}
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">👥</div>
          <h3 className="text-white text-xl font-semibold mb-2">Ganhe Comissões Vitalícias!</h3>
        </div>

        {/* Explicação */}
        <div className="bg-[#1e1e1e] rounded-lg p-4 mb-6">
          <p className="text-silver text-sm leading-relaxed">
            <span className="text-golden font-semibold">Convide amigos</span>, acompanhe seus afiliados e
            <span className="text-[#27c93f] font-semibold"> ganhe comissões vitalícias</span> a cada aposta feita por eles.
          </p>

          <div className="mt-4 space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-[#27c93f]">✓</span>
              <span className="text-silver text-sm">5% de comissão em todas as apostas</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-[#27c93f]">✓</span>
              <span className="text-silver text-sm">Pagamentos automáticos</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-[#27c93f]">✓</span>
              <span className="text-silver text-sm">Sem limite de convites</span>
            </div>
          </div>
        </div>

        {/* Link de Convite */}
        <div className="mb-6">
          <label className="text-silver text-sm block mb-2">Seu Link de Convite:</label>

          {!inviteLink && !loading && error && (
            <div className="bg-[#e74c3c]/20 border border-[#e74c3c] rounded-lg p-3 mb-3">
              <p className="text-[#e74c3c] text-sm">⚠️ {error}</p>
            </div>
          )}

          <div className="flex space-x-2">
            <input
              type="text"
              value={inviteLink || (loading ? 'Carregando…' : '')}
              readOnly
              placeholder={loading ? 'Carregando…' : '—'}
              className="flex-1 bg-[#1e1e1e] text-white p-3 rounded-lg border border-[#3a3a3a] text-sm"
            />
            <button
              onClick={handleCopyLink}
              disabled={!inviteLink || loading}
              className={`px-4 py-3 rounded-lg font-semibold text-sm transition-colors ${
                copied
                  ? 'bg-[#27c93f] text-white'
                  : inviteLink
                    ? 'bg-golden text-black hover:bg-yellow-600'
                    : 'bg-[#3a3a3a] text-gray-400 cursor-not-allowed'
              }`}
            >
              {copied ? '✓ Copiado!' : 'Copiar'}
            </button>
          </div>
        </div>

        {/* Botões de Compartilhamento */}
        <div className="space-y-3">
          <button
            onClick={() => {
              if (!inviteLink) return;
              const msg = `🎯 Venha apostar comigo no BetForbes! 💰\n\n` +
                          `Ganhe dinheiro apostando em criptomoedas com a plataforma mais confiável.\n\n` +
                          `🚀 Use meu link e comece agora: ${inviteLink}`;
              window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
            }}
            disabled={!inviteLink}
            className={`w-full font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2 ${
              inviteLink ? 'bg-[#25D366] hover:bg-[#1da851] text-white'
                         : 'bg-[#3a3a3a] text-gray-400 cursor-not-allowed'
            }`}
          >
            <span className="text-xl">📱</span>
            <span>Compartilhar no WhatsApp</span>
          </button>

          <button
            onClick={handleCopyLink}
            disabled={!inviteLink}
            className={`w-full font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2 ${
              inviteLink ? 'bg-[#3a3a3a] hover:bg-[#4a4a4a] text-white'
                         : 'bg-[#3a3a3a] text-gray-400 cursor-not-allowed'
            }`}
          >
            <span className="text-xl">🔗</span>
            <span>Copiar Link</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default InviteFriendsModal;
