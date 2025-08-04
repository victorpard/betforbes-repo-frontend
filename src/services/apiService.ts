const BASE = import.meta.env.VITE_API_URL?.replace(/\/$/, '') || '';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  referral?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: any;
    tokens: {
      accessToken: string;
      refreshToken: string;
    };
  };
}

class ApiService {
  defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  setAuthHeader(token: string) {
    this.defaultHeaders = {
      ...this.defaultHeaders,
      Authorization: `Bearer ${token}`,
    };
  }

  clearAuthData() {
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  private async handleResponse(res: Response) {
    const text = await res.text();
    let json;
    try {
      json = JSON.parse(text);
    } catch {
      throw { message: 'Resposta inválida do servidor', status: res.status };
    }
    if (!res.ok) {
      throw { ...(json || {}), status: res.status };
    }
    return json;
  }

  async login(payload: LoginRequest) {
    const res = await fetch(`${BASE}/api/auth/login`, {
      method: 'POST',
      headers: this.defaultHeaders,
      body: JSON.stringify(payload),
      credentials: 'include',
    });
    return this.handleResponse(res);
  }

  async register(payload: RegisterRequest) {
    const res = await fetch(`${BASE}/api/auth/register`, {
      method: 'POST',
      headers: this.defaultHeaders,
      body: JSON.stringify(payload),
      credentials: 'include',
    });
    return this.handleResponse(res);
  }

  async validateToken() {
    const res = await fetch(`${BASE}/api/auth/validate-token`, {
      method: 'GET',
      headers: this.defaultHeaders,
      credentials: 'include',
    });
    return this.handleResponse(res);
  }

  async logout() {
    const res = await fetch(`${BASE}/api/auth/logout`, {
      method: 'POST',
      headers: this.defaultHeaders,
      credentials: 'include',
    });
    return this.handleResponse(res);
  }
}

export const apiService = new ApiService();
