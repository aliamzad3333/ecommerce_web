import { ENV } from '../config/environment'

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
        // Handle all errors with simple user-friendly message
        throw new Error('Invalid username and password')
      }

      return await response.json()
    } catch (error) {
      console.error('API request failed:', error)
      
      // Handle all errors with simple user-friendly message
      throw new Error('Invalid username and password')
    }
  }

  // Authentication APIs
  async login(email: string, password: string) {
    const response = await this.request<{ token: string; role: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    
    this.setToken(response.token)
    
    // Transform the response to match expected format
    return {
      token: response.token,
      user: {
        id: 'temp-id', // You might want to decode this from JWT token
        email: email,
        name: email.split('@')[0], // Extract name from email
        isAdmin: response.role === 'admin'
      }
    }
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

  // Product APIs - Public
  async getProducts(params?: { 
    category?: string; 
    page?: number; 
    limit?: number; 
    in_stock?: boolean;
    search?: string;
  }) {
    const queryParams = new URLSearchParams()
    if (params?.category) queryParams.append('category', params.category)
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.in_stock !== undefined) queryParams.append('in_stock', params.in_stock.toString())
    if (params?.search) queryParams.append('search', params.search)
    
    const query = queryParams.toString()
    return this.request<any>(`/products${query ? `?${query}` : ''}`)
  }

  async getProduct(id: string) {
    return this.request<any>(`/products/${id}`)
  }

  async getProductCategories() {
    return this.request<string[]>('/products/categories')
  }

  // Slider APIs - Public
  async getSliderData() {
    return this.request<{
      slides: Array<{
        id: string;
        image_url: string;
        order: number;
        created_at: string;
        updated_at: string;
      }>;
      settings: {
        slide_duration: number; // Duration in seconds
        auto_play: boolean;
        show_indicators: boolean;
        show_controls: boolean;
        updated_at: string;
      };
      total_slides: number;
    }>('/sliders')
  }

  // Slider APIs - Admin Only
  async getAdminSliders() {
    return this.request<{
      sliders: Array<{
        id: string;
        image_url: string;
        order: number;
        created_at: string;
        updated_at: string;
      }>;
      total_slides: number;
    }>('/admin/sliders')
  }

  async getSliderSettings() {
    return this.request<{
      slide_duration: number;
      auto_play: boolean;
      show_indicators: boolean;
      show_controls: boolean;
      updated_at: string;
    }>('/admin/slider-settings')
  }

  async updateSliderSettings(data: {
    slide_duration?: number;
    auto_play?: boolean;
    show_indicators?: boolean;
    show_controls?: boolean;
  }) {
    return this.request<any>('/admin/slider-settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async uploadSliderImage(imageFile: File) {
    const formData = new FormData()
    formData.append('image', imageFile)
    
    const url = `${this.baseURL}/admin/sliders/image`
    const config: RequestInit = {
      method: 'POST',
      headers: {
        // Remove Content-Type to let browser set it with boundary for FormData
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      },
      body: formData,
    }

    try {
      const response = await fetch(url, config)
      if (!response.ok) {
        throw new Error('Failed to upload image')
      }
      return await response.json()
    } catch (error) {
      console.error('Image upload failed:', error)
      throw new Error('Failed to upload image')
    }
  }

  async deleteSlider(id: string) {
    return this.request<any>(`/admin/sliders/${id}`, {
      method: 'DELETE',
    })
  }

  // Product APIs - Admin Only
  async createProduct(productData: any) {
    return this.request<any>('/admin/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    })
  }

  async updateProduct(id: string, productData: any) {
    return this.request<any>(`/admin/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    })
  }

  async deleteProduct(id: string) {
    return this.request<void>(`/admin/products/${id}`, {
      method: 'DELETE',
    })
  }

  async uploadProductImage(id: string, imageFile: File) {
    const formData = new FormData()
    formData.append('image', imageFile)
    
    return this.request<{ imageUrl: string }>(`/admin/products/${id}/image`, {
      method: 'POST',
      body: formData,
      headers: {
        // Remove Content-Type to let browser set it with boundary for FormData
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      },
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

  // Health Check
  async healthCheck() {
    return this.request<{ status: string; message: string }>('/health')
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
export const apiClient = new ApiClient(ENV.API_BASE_URL)
export default apiClient
