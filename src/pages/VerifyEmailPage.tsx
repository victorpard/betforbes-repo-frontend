import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const raw = searchParams.get('token');

    if (!raw) {
      toast.error('Token de verificação inválido.');
      navigate('/login', { replace: true });
      return;
    }

    const token = raw.trim().replace(/[\r\n]/g, '');
    const apiBase = import.meta.env.VITE_API_URL || '/api';

    (async () => {
      try {
        const res = await fetch(`${apiBase}/auth/verify-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        const data = await res.json().catch(() => ({}));

        if (res.ok && data?.success) {
          toast.success('E-mail verificado com sucesso! Faça login para continuar.');
        } else {
          // mensagens mais amigáveis por código, quando houver
          const msg =
            data?.code === 'TOKEN_ALREADY_USED'
              ? 'Este link já foi utilizado. Faça login ou solicite um novo e-mail.'
              : data?.code === 'TOKEN_EXPIRED'
              ? 'Link expirado. Solicite um novo e-mail de verificação.'
              : data?.message || 'Falha ao verificar e-mail.';
          toast.error(msg);
        }
      } catch {
        toast.error('Erro ao verificar e-mail. Tente novamente em instantes.');
      } finally {
        setLoading(false);
        setTimeout(() => navigate('/login', { replace: true }), 1800);
      }
    })();
  }, [searchParams, navigate]);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-900">
      <p className="text-white text-lg">
        {loading ? 'Verificando seu e-mail…' : 'Redirecionando para o login…'}
      </p>
    </div>
  );
};

export default VerifyEmailPage;
