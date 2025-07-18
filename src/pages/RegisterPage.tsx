import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'

const RegisterPage: React.FC = () => {
  // 🔍 Debug: verifica se o hook está chegando corretamente
  const auth = useAuth()
  console.log('🔍 RegisterPage: useAuth() =', auth)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const { register, isLoading } = auth
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const result = await register(name, email, password, confirmPassword)
    if (result.success) {
      navigate('/login', { replace: true })
    } else {
      setError(result.error || 'Falha ao cadastrar usuário')
    }
  }

  return (
    <div className="flex items-center justify-center h-screen w-full bg-[#1e1e1e] p-4">
      <Card className="w-full max-w-md bg-[#2a2a2a] text-white border-none shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-bold text-center text-[#FFD700]">
            BETFORBES
          </CardTitle>
          <CardDescription className="text-gray-400 text-center text-lg">
            Crie sua conta para começar a usar a plataforma
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          {error && (
            <div className="bg-[#e74c3c] bg-opacity-20 border border-[#e74c3c] rounded-lg p-4">
              <p className="text-[#e74c3c] text-sm">⚠️ {error}</p>
            </div>
          )}
          <form onSubmit={handleSubmit} className="grid gap-6">
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-gray-300 text-lg font-medium">
                Nome
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Seu nome"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                className="bg-[#3a3a3a] border-gray-600 text-white placeholder-gray-400 h-14 text-lg px-4"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-gray-300 text-lg font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="bg-[#3a3a3a] border-gray-600 text-white placeholder-gray-400 h-14 text-lg px-4"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password" className="text-gray-300 text-lg font-medium">
                Senha
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="bg-[#3a3a3a] border-gray-600 text-white placeholder-gray-400 h-14 text-lg px-4"
              />
            </div>
            <div className="grid gap-2">
              <Label
                htmlFor="confirmPassword"
                className="text-gray-300 text-lg font-medium"
              >
                Confirmar Senha
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
                className="bg-[#3a3a3a] border-gray-600 text-white placeholder-gray-400 h-14 text-lg px-4"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-[#FFD700] text-black hover:bg-[#e6c200] font-bold h-14 text-lg"
              disabled={isLoading}
            >
              {isLoading ? 'Cadastrando...' : 'Cadastrar'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center mt-4">
          <span className="text-sm text-gray-400">
            Já tem uma conta?{' '}
            <Link to="/login" className="text-[#FFD700] hover:underline font-medium">
              Entrar
            </Link>
          </span>
        </CardFooter>
      </Card>
    </div>
  )
}

export default RegisterPage
