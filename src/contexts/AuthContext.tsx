import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiService, AuthResponse, LoginRequest, RegisterRequest } from '../services/apiService';
import { toast } from 'react-toastify';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  isPremium: boolean;
  isAdmin: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: false,
  isAuthenticated: false,
  error: null,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  clearError: () => {},
});

/** Helpers: aceitam formatos diferentes de resposta (top-level ou data.tokens) */
function extractTokens(res: AuthResponse | any): { accessToken: string | null; refreshToken: string | null } {
  const accessToken =
    res?.data?.tokens?.accessToken ??
    res?.data?.accessToken ??
    res?.data?.token ??
    res?.accessToken ??
    res?.token ??
    null;

  const refreshToken =
    res?.data?.tokens?.refreshToken ??
    res?.data?.refreshToken ??
    res?.refreshToken ??
    null;

  return { accessToken, refreshToken };
}

function extractUser(res: AuthResponse | any): User | null {
  return (res?.data?.user ?? res?.user ?? null) as User | null;
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = !!user;

  /** Persistência leve do usuário (UX mais rápida no F5) */
  const saveUserData = (userData: User) => {
    try {
      localStorage.setItem('betforbes_user', JSON.stringify(userData));
      setUser(userData);
      console.log('✅ AuthContext: Dados do usuário salvos no localStorage');
    } catch (err) {
      console.error('❌ AuthContext: Erro ao salvar dados do usuário', err);
    }
  };

  const loadUserData = (): User | null => {
    try {
      const raw = localStorage.getItem('betforbes_user');
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      console.log('✅ AuthContext: Dados do usuário carregados do localStorage', parsed);
      return parsed;
    } catch (err) {
      console.error('❌ AuthContext: Erro ao carregar dados do usuário', err);
      localStorage.removeItem('betforbes_user');
      return null;
    }
  };

  const clearAllAuthData = () => {
    setUser(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('betforbes_user');
    apiService.clearAuthData();
    console.log('🧹 AuthContext: Todos os dados de autenticação foram limpos');
  };

  /** Inicialização: reidrata token, renova se preciso e valida no servidor */
  useEffect(() => {
    const initializeAuth = async () => {
      console.log('🔄 AuthContext: Inicializando autenticação...');

      // migração de chave antiga (se ainda existir)
      const legacy = localStorage.getItem('token');
      if (legacy && !localStorage.getItem('accessToken')) {
        localStorage.setItem('accessToken', legacy);
        localStorage.removeItem('token');
      }

      const storedToken = localStorage.getItem('accessToken');
      const savedUser = loadUserData();

      console.log('AuthContext: savedUser:', savedUser);
      console.log('AuthContext: storedToken:', storedToken ? 'presente' : 'ausente');

      if (!storedToken) {
        console.log('🔴 AuthContext: Nenhum token encontrado');
        clearAllAuthData();
        setIsLoading(false);
        return;
      }

      // mostra user salvo enquanto valida, pra evitar flicker
      if (savedUser) setUser(savedUser);

      setIsLoading(true);
      try {
        apiService.setAuthHeader(storedToken);

        // 1) Se token local estiver expirado, tenta refresh
        if (!apiService.hasValidToken()) {
          console.log('🔄 AuthContext: Token expirado localmente, tentando refresh...');
          const refreshResponse = await apiService.refreshToken(); // pode vir só tokens
          const { accessToken: newAT, refreshToken: newRT } = extractTokens(refreshResponse);
          if (!newAT) throw new Error('Falha ao renovar token');

          localStorage.setItem('accessToken', newAT);
          if (newRT) localStorage.setItem('refreshToken', newRT);
          apiService.setAuthHeader(newAT);
          console.log('✅ AuthContext: Token renovado localmente');
        }

        // 2) Valida no servidor (usa /api/auth/validate)
        const response = await apiService.validateToken();
        const serverUser = response?.data?.user ?? response?.user ?? null;

        if (serverUser) {
          saveUserData(serverUser);
          console.log('✅ AuthContext: Token válido no servidor');
        } else {
          console.log('🔴 AuthContext: Token inválido no servidor');
          clearAllAuthData();
        }
      } catch (err) {
        console.error('❌ AuthContext: Erro na validação/refresh', err);
        clearAllAuthData();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  /** Sync entre abas */
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'accessToken' && !e.newValue) {
        console.log('🔄 AuthContext: Token removido em outra aba, fazendo logout');
        clearAllAuthData();
      } else if (e.key === 'betforbes_user' && e.newValue) {
        try {
          setUser(JSON.parse(e.newValue));
          console.log('🔄 AuthContext: Dados do usuário atualizados de outra aba');
        } catch (err) {
          console.error('❌ AuthContext: Erro ao sincronizar dados do usuário', err);
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  /** LOGIN */
  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('🔐 AuthContext: Iniciando login...');
      const res = (await apiService.login({ email, password } as LoginRequest)) as AuthResponse;
      console.log('📦 AuthContext: Resposta do login:', res);

      const { accessToken, refreshToken } = extractTokens(res);
      const u = extractUser(res);
      if (!accessToken) throw new Error(res?.message || 'Falha no login');

      localStorage.setItem('accessToken', accessToken);
      if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
      apiService.setAuthHeader(accessToken);

      if (u) saveUserData(u);
      toast.success('🎉 Login realizado com sucesso!');
      console.log('✅ AuthContext: Login bem-sucedido');
    } catch (err: any) {
      console.error('❌ AuthContext: Erro no login:', err);
      clearAllAuthData();
      const msg = err?.response?.data?.message || err?.message || 'Erro ao fazer login';
      setError(msg);
      toast.error(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /** REGISTER */
  const register = async (name: string, email: string, password: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('📝 AuthContext: Iniciando registro...');
      const res = (await apiService.register({ name, email, password } as RegisterRequest)) as AuthResponse;
      console.log('📦 AuthContext: Resposta do registro:', res);

      const { accessToken, refreshToken } = extractTokens(res);
      const u = extractUser(res);
      if (!accessToken) throw new Error(res?.message || 'Falha no registro');

      localStorage.setItem('accessToken', accessToken);
      if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
      apiService.setAuthHeader(accessToken);

      if (u) saveUserData(u);
      toast.success('🎉 Registro realizado com sucesso!');
      console.log('✅ AuthContext: Registro bem-sucedido');
    } catch (err: any) {
      console.error('❌ AuthContext: Erro no registro:', err);
      clearAllAuthData();
      const msg = err?.response?.data?.message || err?.message || 'Erro ao registrar';
      setError(msg);
      toast.error(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /** LOGOUT */
  const logout = async (): Promise<void> => {
    try {
      console.log('🔒 AuthContext: Logout iniciado');
      await apiService.logout().catch(() => {}); // best-effort
    } catch (err) {
      console.error('❌ AuthContext: Erro no logout', err);
    } finally {
      clearAllAuthData();
      toast.info('Você saiu da conta.');
    }
  };

  const clearError = () => setError(null);

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
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  return context;
};
