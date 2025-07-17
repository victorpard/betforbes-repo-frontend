// Se VITE_API_URL estiver vazio (dev), cai em '', 
// em produção defina .env.production → VITE_API_URL=/api
const API_BASE_URL = import.meta.env.VITE_API_URL || ''

export interface LoginRequest { email: string; password: string }
export interface RegisterRequest { name: string; email: string; password: string }

interface BaseResponse {
  success: boolean
  message?: string
}

export interface AuthSuccessPayload {
  user: {
    id: string
    name: string
    email: string
    avatar?: string
    isPremium: boolean
    isAdmin: boolean
  }
  tokens: { accessToken: string; refreshToken: string }
}

export interface AuthResponse extends BaseResponse {
  data?: AuthSuccessPayload
}

export interface RegisterResponse extends BaseResponse {
  user?: { id: string; name: string; email: string }
  emailSent?: boolean
}

// Hyperliquid
export interface MidsResponse extends BaseResponse { data?: number[] }
export interface TickerResponse extends BaseResponse { data?: { symbol: string; price: number } }

class ApiService {
  private headers: HeadersInit = { 'Content-Type': 'application/json' }

  setAuthHeader(token: string) {
    this.headers = { ...this.headers, Authorization: `Bearer ${token}` }
  }

  clearAuthData() {
    this.headers = { 'Content-Type': 'application/json' }
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
  }

  private async handleResponse<T>(res: Response): Promise<T> {
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.message || `HTTP error ${res.status}`)
    }
    return res.json()
  }

  // Autenticação
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(credentials)
    })
    const data = await this.handleResponse<AuthResponse>(res)

    if (data.success && data.data?.tokens.accessToken) {
      localStorage.setItem('accessToken', data.data.tokens.accessToken)
      localStorage.setItem('refreshToken', data.data.tokens.refreshToken)
      this.setAuthHeader(data.data.tokens.accessToken)
    }

    return data
  }

  async register(userData: RegisterRequest): Promise<RegisterResponse> {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(userData)
    })
    return this.handleResponse<RegisterResponse>(res)
  }

  async validateToken(): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE_URL}/auth/validate`, {
      method: 'GET',
      headers: this.headers
    })
    return this.handleResponse<AuthResponse>(res)
  }

  async logout(): Promise<BaseResponse> {
    const res = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: this.headers
    })
    const data = await this.handleResponse<BaseResponse>(res)
    this.clearAuthData()
    return data
  }

  // Hyperliquid
  async fetchMids(): Promise<MidsResponse> {
    const res = await fetch(`${API_BASE_URL}/hyperliquid/mids`, {
      method: 'GET',
      headers: this.headers
    })
    return this.handleResponse<MidsResponse>(res)
  }

  async fetchTicker(symbol: string): Promise<TickerResponse> {
    const res = await fetch(`${API_BASE_URL}/hyperliquid/ticker/${symbol}`, {
      method: 'GET',
      headers: this.headers
    })
    return this.handleResponse<TickerResponse>(res)
  }
}

export const apiService = new ApiService()
