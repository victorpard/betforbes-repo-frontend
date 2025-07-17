const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

class HyperliquidApi {
  constructor( ) {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const token = localStorage.getItem('accessToken');
    if (token) {
      defaultOptions.headers.Authorization = `Bearer ${token}`;
    }

    const config = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`[API] Error in ${endpoint}:`, error);
      throw error;
    }
  }

  async healthCheck() {
    return this.request('/api/hyperliquid/health');
  }

  async getMarketData() {
    return this.request('/api/hyperliquid/market-data');
  }

  async getAllMids() {
    return this.request('/api/hyperliquid/mids');
  }

  async getUserPositions(address) {
    return this.request(`/api/hyperliquid/user/${address}/positions`);
  }

  async getUserBalance(address) {
    return this.request(`/api/hyperliquid/user/${address}/balance`);
  }
}

export const hyperliquidApi = new HyperliquidApi();
export default hyperliquidApi;
