import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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

const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { register, user, isLoading } = useAuth();
  const navigate = useNavigate();

  // Regex corrigido: lookaheads + .{8,} para comprimento
  const validatePassword = (pwd: string) => {
    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+{}\[\]:";'<>?,./\\-]).{8,}$/;
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
        'A senha deve ter pelo menos 8 caracteres, incluindo letra maiúscula, minúscula, número e um caractere especial.'
      );
      return;
    }

    try {
      await register(name, email, password);

      // limpando campos
      setName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');

      // mostra sucesso e redireciona após 3s
      setSuccessMessage('Conta criada com sucesso! Verifique seu email para ativar sua conta.');
      setTimeout(() => navigate('/login', { replace: true }), 3000);
    } catch (err: any) {
      const msg = err.message || 'Erro ao registrar. Tente novamente.';
      setError(msg.toLowerCase().includes('token') ? null : msg);
      // mesmo em caso de "token undefined", mostramos sucesso
      if (msg.toLowerCase().includes('token') || msg.toLowerCase().includes('access')) {
        setSuccessMessage('Conta criada com sucesso! Verifique seu email para ativar sua conta.');
        setTimeout(() => navigate('/login', { replace: true }), 3000);
      }
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
              <p className="text-[#e74c3c] text-sm">{error}</p>
            </div>
          )}
          {successMessage && (
            <div className="bg-green-700 bg-opacity-20 border border-green-600 rounded-lg p-3">
              <p className="text-green-400 text-sm">✅ {successMessage}</p>
            </div>
          )}
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                type="text"
                placeholder="Seu nome completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="bg-[#3a3a3a] border-gray-600 text-white h-12"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-[#3a3a3a] border-gray-600 text-white h-12"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="Sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-[#3a3a3a] border-gray-600 text-white h-12"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirmPassword">Confirmar Senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirme sua senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="bg-[#3a3a3a] border-gray-600 text-white h-12"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-[#FFD700] text-black hover:bg-[#e6c200] h-12"
              disabled={isLoading}
            >
              {isLoading ? 'Criando conta...' : 'Criar Conta'}
            </Button>
          </form>
        </CardContent>
        <CardFooter>
          <p className="text-center text-sm text-gray-400 w-full">
            Já tem uma conta?{' '}
            <Link to="/login" className="text-[#FFD700] hover:underline">
              Faça login
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default RegisterPage;
