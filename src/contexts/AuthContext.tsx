import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode
} from 'react'
import axios from 'axios'
import {
  apiService,
  AuthResponse,
  LoginRequest,
  RegisterRequest
} from '../services/apiService'
import { toast } from 'react-toastify'

/**
 * Configura baseURL e credenciais do axios
 */
axios.defaults.baseURL = import.meta.env.VITE_API_URL || '/'    // ex: "/api"
axios.defaults.withCredentials = true                           // se usar cookies/tokens

interface User {
  id: string
  name: string
  email: string
  avatar?: string
  isPremium: boolean
  isAdmin: boolean
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  clearError: () => void
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: false,
  isAuthenticated: false,
  error: null,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  clearError: () => {}
})

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children
}) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const isAuthenticated = !!user

  // 1) Ao montar, tenta reidratar e validar token
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('accessToken')
      if (!token) {
        apiService.clearAuthData()
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      apiService.setAuthHeader(token)
      try {
        const res = await apiService.validateToken()
        if (res.success && res.data?.user) {
          setUser(res.data.user)
        } else {
          apiService.clearAuthData()
          setUser(null)
        }
      } catch {
        apiService.clearAuthData()
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()
  }, [])

  // 2) Login: grava token, seta user e context
  const login = async (
    email: string,
    password: string
  ): Promise<void> => {
    setIsLoading(true)
    setError(null)

    try {
      const res = (await apiService.login({
        email,
        password
      } as LoginRequest)) as AuthResponse

      if (!res.success || !res.data?.tokens.accessToken) {
        throw new Error(res.message || 'Falha no login')
      }

      localStorage.setItem('accessToken', res.data.tokens.accessToken)
      localStorage.setItem('refreshToken', res.data.tokens.refreshToken)
      apiService.setAuthHeader(res.data.tokens.accessToken)

      setUser(res.data.user)
      toast.success('🎉 Login realizado com sucesso!')
    } catch (err: any) {
      setUser(null)
      const msg = err.response?.data?.message || err.message
      setError(msg)
      apiService.clearAuthData()
      toast.error(msg)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  // 3) Registro: dispara toast
  const register = async (
    name: string,
    email: string,
    password: string
  ): Promise<void> => {
    setIsLoading(true)
    setError(null)

    try {
      const res = (await apiService.register({
        name,
        email,
        password
      } as RegisterRequest)) as AuthResponse

      if (!res.success) {
        throw new Error(res.message || 'Falha no registro')
      }

      toast.success(
        '🎉 Registro realizado! Verifique seu e‑mail para ativar a conta.'
      )
    } catch (err: any) {
      setUser(null)
      const msg = err.response?.data?.message || err.message
      setError(msg)
      apiService.clearAuthData()
      toast.error(msg)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  // 4) Logout: limpa local e context
  const logout = async (): Promise<void> => {
    setIsLoading(true)
    try {
      await apiService.logout()
    } catch {
      /* mesmo com erro, limpa */
    } finally {
      apiService.clearAuthData()
      setUser(null)
      setIsLoading(false)
      toast.info('🚪 Você saiu da conta.')
    }
  }

  const clearError = () => setError(null)

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        error,
        login,
        register,
        logout,
        clearError
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
