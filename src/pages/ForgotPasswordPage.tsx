import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      // mesmo quando o email não existe, o backend retorna 200 com mensagem neutra
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || `Erro HTTP ${res.status}`);
      }
      setDone(true);
    } catch (err: any) {
      setError(err.message ?? 'Erro ao enviar email de recuperação.');
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#1e1e1e] px-4">
        <div className="w-full max-w-sm bg-[#2a2a2a] text-white rounded-xl p-6 shadow">
          <h1 className="text-2xl font-bold text-center text-[#FFD700] mb-1">BETFORBES</h1>
          <p className="text-center text-gray-400 mb-4">Email enviado com sucesso</p>

          <div className="bg-emerald-600/20 border border-emerald-600 rounded-lg p-4 text-sm">
            <p className="text-emerald-500 text-center">
              ✅ Verifique seu e-mail para redefinir a senha.
            </p>
            <p className="text-gray-400 text-xs text-center mt-2">
              Se o e-mail existir, você receberá um link de recuperação.
            </p>
          </div>

          <Link to="/login" className="mt-4 block text-center">
            <button className="w-full bg-[#FFD700] text-black font-semibold rounded-lg py-2 hover:bg-[#e6c200]">
              Voltar ao Login
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#1e1e1e] px-4">
      <div className="w-full max-w-sm bg-[#2a2a2a] text-white rounded-xl p-6 shadow">
        <h1 className="text-2xl font-bold text-center text-[#FFD700] mb-1">BETFORBES</h1>
        <p className="text-center text-gray-400 mb-4">Recuperar senha</p>

        {error && (
          <div className="bg-red-500/20 border border-red-500 rounded-lg p-3 text-sm mb-3">
            <p className="text-red-400">⚠️ {error}</p>
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label htmlFor="email" className="block text-sm text-gray-300 mb-1">Email</label>
            <input
              id="email"
              type="email"
              placeholder="seuemail@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg bg-[#3a3a3a] border border-gray-600 px-3 py-2 text-white placeholder-gray-400 outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#FFD700] text-black font-semibold rounded-lg py-2 hover:bg-[#e6c200] disabled:opacity-60"
          >
            {loading ? 'Enviando…' : 'Enviar link de recuperação'}
          </button>
        </form>

        <div className="text-sm text-gray-400 text-center mt-3">
          Lembrou da senha?{' '}
          <Link to="/login" className="text-[#FFD700] hover:underline">Voltar ao login</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
