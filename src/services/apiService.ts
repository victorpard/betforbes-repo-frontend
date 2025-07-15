// API Service para integração com backend BetForbes
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

interface AuthResponse {
  success: boolean;
  data?: {
    user: {
      id: string;
      name: string;
      email: string;
      avatar?: string;
      isPremium: boolean;
      isAdmin: boolean;
    };
    tokens: {
      accessToken: string;
      refreshToken: string;
    };
  };
  message?: string;
}

interface ApiError {
  message: string;
  status: number;
}

class ApiService {
  // Headers padrão de todas as requisições
  private defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json'
  };

  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('accessToken');
    return {
      ...this.defaultHeaders,
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Erro de rede' }));
      throw {
        message: errorData.message || `Erro HTTP ${response.status}`,
        status: response.status,
      } as ApiError;
    }
    return response.json();
  }

  /** Define o header Authorization para futuras requisições */
  setAuthHeader(token: string) {
    this.defaultHeaders = {
      ...this.defaultHeaders,
      'Authorization': `Bearer ${token}`
    };
  }

  /** Limpa headers de auth e storage */
  clearAuthData(): void {
    this.defaultHeaders = {
      'Content-Type': 'application/json'
    };
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  // Login
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(credentials),
    });
    const data = await this.handleResponse<AuthResponse>(response);

    if (data.success && data.data?.tokens.accessToken) {
      localStorage.setItem('accessToken', data.data.tokens.accessToken);
      localStorage.setItem('refreshToken', data.data.tokens.refreshToken);
      this.setAuthHeader(data.data.tokens.accessToken);
    }

    return data;
  }

  // Registro
  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(userData),
    });
    const data = await this.handleResponse<AuthResponse>(response);

    if (data.success && data.data?.tokens.accessToken) {
      localStorage.setItem('accessToken', data.data.tokens.accessToken);
      localStorage.setItem('refreshToken', data.data.tokens.refreshToken);
      this.setAuthHeader(data.data.tokens.accessToken);
    }

    return data;
  }

  // Validar token
  async validateToken(): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/validate`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<AuthResponse>(response);
  }

  // Refresh token
  async refreshToken(): Promise<AuthResponse> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw { message: 'Refresh token não encontrado', status: 401 } as ApiError;
    }

    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    const data = await this.handleResponse<AuthResponse>(response);

    if (data.success && data.data?.tokens.accessToken) {
      localStorage.setItem('accessToken', data.data.tokens.accessToken);
      localStorage.setItem('refreshToken', data.data.tokens.refreshToken);
      this.setAuthHeader(data.data.tokens.accessToken);
    }

    return data;
  }

  // Logout
  async logout(): Promise<void> {
    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    }).catch(console.error)
      .finally(() => this.clearAuthData());
  }

  // Verificar token
  hasValidToken(): boolean {
    const token = localStorage.getItem('accessToken');
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp > Date.now() / 1000;
    } catch {
      return false;
    }
  }

  // Perfil
  async getUserProfile(): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/user/profile`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<AuthResponse>(response);
  }
}

export const apiService = new ApiService();
export type { LoginRequest, RegisterRequest, AuthResponse, ApiError };
