import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Check, X } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const ResetPasswordPage: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get('token');

  // Requisitos individuais da senha
  const getPasswordRequirements = (pwd: string) => ({
    minLength: pwd.length >= 8,
    hasUppercase: /[A-Z]/.test(pwd),
    hasLowercase: /[a-z]/.test(pwd),
    hasNumber: /\d/.test(pwd),
    hasSpecialChar: /[!@#$%^&*()_+{}\[\]:;"'<>,.?/~\\-]/.test(pwd)
  });

  // Força da senha
  const getPasswordStrength = (pwd: string) => {
    const req = getPasswordRequirements(pwd);
    const met = Object.values(req).filter(Boolean).length;
    return (met / 5) * 100;
  };

  const getStrengthColor = (strength: number) => {
    if (strength < 40) return '#e74c3c';
    if (strength < 80) return '#f39c12';
    return '#27ae60';
  };

  const validatePassword = (pwd: string) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+{}\[\]:;"'<>,.?/~\\-]).{8,}$/.test(
      pwd
    );

  useEffect(() => {
    if (!token) setError('Token de recuperação inválido ou ausente.');
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validatePassword(password)) {
      setError(
        'A senha deve ter pelo menos 8 caracteres, com maiúscula, minúscula, número e caractere especial.'
      );
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    if (!token) {
      setError('Token de recuperação inválido.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // ⚠️ não fazer trim() na senha!
        body: JSON.stringify({ token, password })
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || data?.success === false) {
        const code = data?.code as string | undefined;
        if (code === 'TOKEN_ALREADY_USED')
          throw new Error('Este link já foi utilizado. Solicite um novo.');
        if (code === 'TOKEN_EXPIRED')
          throw new Error('Link expirado. Solicite um novo e-mail de recuperação.');
        if (code === 'INVALID_TOKEN')
          throw new Error('Token de recuperação inválido.');
        throw new Error(data?.message || 'Falha ao redefinir a senha.');
      }

      // Limpa qualquer credencial antiga para evitar confusão de sessão
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('betforbes_user');

      setIsSubmitted(true);

      // Redireciona para login após 3s
      setTimeout(() => navigate('/login', { replace: true }), 3000);
    } catch (err: any) {
      setError(err?.message || 'Erro ao redefinir senha. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#1e1e1e] px-4">
        <Card className="w-full max-w-sm bg-[#2a2a2a] text-white border-none shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center text-[#FFD700]">
              BETFORBES
            </CardTitle>
            <CardDescription className="text-gray-400 text-center">
              Senha redefinida com sucesso
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="bg-[#27ae60] bg-opacity-20 border border-[#27ae60] rounded-lg p-4">
              <p className="text-[#27ae60] text-sm text-center">
                ✅ Sua senha foi redefinida com sucesso!
              </p>
              <p className="text-gray-400 text-xs text-center mt-2">
                Você será redirecionado para o login em alguns segundos...
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Link to="/login" className="w-full">
              <Button className="w-full bg-[#FFD700] text-black hover:bg-[#e6c200] font-semibold">
                Ir para Login
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#1e1e1e] px-4">
      <Card className="w-full max-w-sm bg-[#2a2a2a] text-white border-none shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center text-[#FFD700]">
            BETFORBES
          </CardTitle>
          <CardDescription className="text-gray-400 text-center">
            Redefinir senha
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="text-sm text-gray-400 text-center">
            Digite sua nova senha
          </div>

          {error && (
            <div className="bg-[#e74c3c] bg-opacity-20 border border-[#e74c3c] rounded-lg p-3">
              <p className="text-[#e74c3c] text-sm">⚠️ {error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="password" className="text-gray-300">
                Nova Senha
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  className="bg-[#3a3a3a] border-gray-600 text-white placeholder-gray-400 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {password && (
                <div className="mt-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-400">Força da senha:</span>
                    <span
                      className="text-xs"
                      style={{
                        color: getStrengthColor(getPasswordStrength(password))
                      }}
                    >
                      {getPasswordStrength(password) < 40
                        ? 'Fraca'
                        : getPasswordStrength(password) < 80
                        ? 'Média'
                        : 'Forte'}
                    </span>
                  </div>
                  <div className="w-full bg-gray-600 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${getPasswordStrength(password)}%`,
                        backgroundColor: getStrengthColor(
                          getPasswordStrength(password)
                        )
                      }}
                    />
                  </div>
                </div>
              )}

              {password && (
                <div className="mt-2 space-y-1">
                  <p className="text-xs text-gray-400 mb-2">Requisitos da senha:</p>
                  {Object.entries({
                    minLength: 'Mínimo 8 caracteres',
                    hasUppercase: '1 letra maiúscula',
                    hasLowercase: '1 letra minúscula',
                    hasNumber: '1 número',
                    hasSpecialChar: '1 caractere especial (!@#$%...)'
                  }).map(([key, label]) => {
                    const req = getPasswordRequirements(password);
                    const ok = req[key as keyof typeof req];
                    return (
                      <div key={key} className="flex items-center gap-2">
                        {ok ? (
                          <Check size={14} className="text-green-400" />
                        ) : (
                          <X size={14} className="text-red-400" />
                        )}
                        <span
                          className={`text-xs ${
                            ok ? 'text-green-400' : 'text-red-400'
                          }`}
                        >
                          {label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="confirmPassword" className="text-gray-300">
                Confirmar Nova Senha
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  className="bg-[#3a3a3a] border-gray-600 text-white placeholder-gray-400 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {confirmPassword && (
                <div className="flex items-center gap-2 mt-1">
                  {password === confirmPassword ? (
                    <>
                      <Check size={14} className="text-green-400" />
                      <span className="text-xs text-green-400">Senhas coincidem</span>
                    </>
                  ) : (
                    <>
                      <X size={14} className="text-red-400" />
                      <span className="text-xs text-red-400">Senhas não coincidem</span>
                    </>
                  )}
                </div>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-[#FFD700] text-black hover:bg-[#e6c200] font-semibold"
              disabled={isLoading || !token}
            >
              {isLoading ? 'Redefinindo...' : 'Redefinir senha'}
            </Button>

            {!token && (
              <div className="text-xs text-center text-gray-400">
                Sem token? <Link className="text-[#FFD700]" to="/forgot-password">Solicite um novo link</Link>
              </div>
            )}
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <div className="text-sm text-gray-400 text-center">
            Lembrou da senha?{' '}
            <Link to="/login" className="text-[#FFD700] hover:underline">
              Voltar ao login
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ResetPasswordPage;
