const API_BASE_URL = 'http://130.94.40.85/api'

// API Client with JWT token handling
class ApiClient {
  private baseURL: string
  private token: string | null = null

  constructor(baseURL: string) {
    this.baseURL = baseURL
    this.token = localStorage.getItem('authToken')
  }

  setToken(token: string | null) {
    this.token = token
    if (token) {
      localStorage.setItem('authToken', token)
    } else {
      localStorage.removeItem('authToken')
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  }

  // Authentication APIs
  async login(email: string, password: string) {
    const response = await this.request<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    
    this.setToken(response.token)
    return response
  }

  async register(userData: { name: string; email: string; password: string }) {
    const response = await this.request<{ token: string; user: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
    
    this.setToken(response.token)
    return response
  }

  async logout() {
    this.setToken(null)
  }

  async getProfile() {
    return this.request<any>('/profile')
  }

  // Product APIs
  async getProducts() {
    return this.request<any[]>('/products')
  }

  async getProduct(id: string) {
    return this.request<any>(`/products/${id}`)
  }

  async createProduct(productData: any) {
    return this.request<any>('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    })
  }

  async updateProduct(id: string, productData: any) {
    return this.request<any>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    })
  }

  async deleteProduct(id: string) {
    return this.request<void>(`/products/${id}`, {
      method: 'DELETE',
    })
  }

  // Order APIs
  async createOrder(orderData: any) {
    return this.request<any>('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    })
  }

  async getOrders() {
    return this.request<any[]>('/orders')
  }

  async getOrder(id: string) {
    return this.request<any>(`/orders/${id}`)
  }

  // Admin APIs
  async getAdminDashboard() {
    return this.request<any>('/admin/dashboard')
  }

  async getAdminOrders() {
    return this.request<any[]>('/admin/orders')
  }

  async getAdminUsers() {
    return this.request<any[]>('/admin/users')
  }

  async updateOrderStatus(orderId: string, status: string) {
    return this.request<any>(`/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    })
  }
}

// Export singleton instance
export const apiClient = new ApiClient(API_BASE_URL)
export default apiClient
