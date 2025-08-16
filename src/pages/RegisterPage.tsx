import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Check, X } from 'lucide-react';
import { saveReferral, getReferral } from '@/utils/referral';

const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { register, user, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Captura ?ref= na URL e persiste (não altera UI)
  useEffect(() => {
    const ref = new URLSearchParams(location.search).get('ref');
    if (ref) saveReferral(ref);
  }, [location.search]);

  // Interceptor LOCAL: injeta referralCode no POST /auth/register
  useEffect(() => {
    const id = axios.interceptors.request.use((config) => {
      try {
        const method = (config.method || 'get').toLowerCase();
        const url = String(config.url || '');
        if (method === 'post' && /\/auth\/register(?:$|\?)/.test(url)) {
          const ref = getReferral();
          if (ref) {
            const data: any = (config as any).data;
            if (typeof FormData !== 'undefined' && data instanceof FormData) {
              if (!data.has('referralCode')) data.set('referralCode', ref);
            } else if (data && typeof data === 'object') {
              if (!('referralCode' in data)) data.referralCode = ref;
            } else if (typeof data === 'string') {
              try {
                const obj = JSON.parse(data);
                if (!obj.referralCode) obj.referralCode = ref;
                (config as any).data = obj; // axios serializa
              } catch {
                (config as any).data = { referralCode: ref };
              }
            } else {
              (config as any).data = { referralCode: ref };
            }
          }
        }
      } catch {}
      return config;
    });
    return () => axios.interceptors.request.eject(id);
  }, []);

  // Função para verificar requisitos individuais da senha
  const getPasswordRequirements = (pwd: string) => {
    return {
      minLength: pwd.length >= 8,
      hasUppercase: /[A-Z]/.test(pwd),
      hasLowercase: /[a-z]/.test(pwd),
      hasNumber: /\d/.test(pwd),
      hasSpecialChar: /[!@#$%^&*()_+{}\[\]:;"'<>,.?/~\\-]/.test(pwd)
    };
  };

  // Função para calcular a força da senha (0-100)
  const getPasswordStrength = (pwd: string) => {
    const requirements = getPasswordRequirements(pwd);
    const metRequirements = Object.values(requirements).filter(Boolean).length;
    return (metRequirements / 5) * 100;
  };

  // Função para obter a cor da barra de força
  const getStrengthColor = (strength: number) => {
    if (strength < 40) return '#e74c3c'; // Vermelho
    if (strength < 80) return '#f39c12'; // Laranja
    return '#27ae60'; // Verde
  };

  const validatePassword = (pwd: string) => {
    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+{}\[\]:;"'<>,.?/~\\-]).{8,}$/;
    return regex.test(pwd);
  };

  useEffect(() => {
    if (!isLoading && user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, isLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    if (!validatePassword(password)) {
      setError(
        'A senha deve ter pelo menos 8 caracteres, incluindo letra maiúscula, minúscula, número e um caractere especial (!, @, #...)'
      );
      return;
    }

    try {
      // Mantém sua assinatura atual de register; confirmPassword é tratado no backend/contexto
      await register(name, email, password);
      setSuccessMessage(
        '✅ Cadastro efetuado com sucesso! Verifique seu e-mail para ativar a conta.'
      );
    } catch (err: any) {
      setError(err.message || 'Erro ao registrar. Tente novamente.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#1e1e1e]">
        <div className="text-white">Carregando...</div>
      </div>
    );
  }

  if (user) return null;

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#1e1e1e] px-4 py-8">
      <Card className="w-full max-w-sm bg-[#2a2a2a] text-white border-none shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center text-[#FFD700]">BETFORBES</CardTitle>
          <CardDescription className="text-gray-400 text-center">
            Crie sua conta para começar a usar a plataforma
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {error && (
            <div className="bg-[#e74c3c] bg-opacity-20 border border-[#e74c3c] rounded-lg p-3">
              <p className="text-[#e74c3c] text-sm">⚠️ {error}</p>
            </div>
          )}
          {successMessage && (
            <div className="bg-green-700 bg-opacity-20 border border-green-600 rounded-lg p-3">
              <p className="text-green-400 text-sm">✅ {successMessage}</p>
            </div>
          )}
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-gray-300">Nome</Label>
              <Input
                id="name"
                type="text"
                placeholder="Seu nome completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="bg-[#3a3a3a] border-gray-600 text-white placeholder-gray-400 h-12"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-gray-300">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-[#3a3a3a] border-gray-600 text-white placeholder-gray-400 h-12"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password" className="text-gray-300">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-[#3a3a3a] border-gray-600 text-white placeholder-gray-400 h-12 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {/* Indicador de força da senha */}
              {password && (
                <div className="mt-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-400">Força da senha:</span>
                    <span className="text-xs" style={{ color: getStrengthColor(getPasswordStrength(password)) }}>
                      {getPasswordStrength(password) < 40 ? 'Fraca' :
                       getPasswordStrength(password) < 80 ? 'Média' : 'Forte'}
                    </span>
                  </div>
                  <div className="w-full bg-gray-600 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${getPasswordStrength(password)}%`,
                        backgroundColor: getStrengthColor(getPasswordStrength(password))
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Requisitos da senha */}
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
                    const requirements = getPasswordRequirements(password);
                    const isMet = requirements[key as keyof typeof requirements];
                    return (
                      <div key={key} className="flex items-center gap-2">
                        {isMet ? (
                          <Check size={14} className="text-green-400" />
                        ) : (
                          <X size={14} className="text-red-400" />
                        )}
                        <span className={`text-xs ${isMet ? 'text-green-400' : 'text-red-400'}`}>
                          {label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirmPassword" className="text-gray-300">Confirmar Senha</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="bg-[#3a3a3a] border-gray-600 text-white placeholder-gray-400 h-12 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {/* Indicador de confirmação de senha */}
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
              className="w-full bg-[#FFD700] text-black hover:bg-[#e6c200] font-semibold h-12"
              disabled={isLoading}
            >
              {isLoading ? 'Criando conta...' : 'Criar conta'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <div className="text-sm text-gray-400 text-center">
            Já tem uma conta?{' '}
            <Link to="/login" className="text-[#FFD700] hover:underline">
              Faça login
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default RegisterPage;
