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
    options: RequestInit = {},
    requiresAuth: boolean = true
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(requiresAuth && this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    }
    
    // Log request for debugging
    if (endpoint.includes('/orders') && options.method === 'POST') {
      console.log('🔍 API Request Details:')
      console.log('   URL:', url)
      console.log('   Headers:', config.headers)
      console.log('   Body (raw string):', options.body)
      
      // Parse and verify tax field
      try {
        const bodyObj = JSON.parse(options.body as string)
        console.log('   Body parsed:')
        console.log('     - tax exists:', 'tax' in bodyObj)
        console.log('     - tax value:', bodyObj.tax)
        console.log('     - tax type:', typeof bodyObj.tax)
        console.log('     - Tax (capital) exists:', 'Tax' in bodyObj)
      } catch (e) {
        console.error('   Failed to parse body')
      }
    }

    const startTime = Date.now()
    
    try {
      const response = await fetch(url, config)
      
      const duration = Date.now() - startTime
      if (duration > 2000) {
        console.warn(`Slow API request: ${endpoint} took ${duration}ms`)
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('❌ API Error Response:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        })
        throw new Error(errorData.error || errorData.details || errorData.message || 'Request failed')
      }

      return await response.json()
    } catch (error: any) {
      console.error('API request failed:', error)
      throw error
    }
  }

  // Authentication APIs
  async login(email: string, password: string) {
    const response = await this.request<{ token: string; role: string; user_id?: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }, false) // Don't require auth for login
    
    this.setToken(response.token)
    
    // Transform the response to match expected format
    return {
      token: response.token,
      user: {
        id: response.user_id || 'temp-id',
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
  async createOrder(orderData: {
    items: Array<{ 
      product_id: string;
      quantity: number;
    }>;
    shipping_address: {
      full_name: string;
      address_line1: string;
      city: string;
      state: string;
      postal_code?: string;
      country: string;
      phone: string;
    };
    payment_method: 'cash' | 'card' | 'online';
    subtotal: number;
    shipping_cost: number;
    tax: number;
    total: number;
  }) {
    return this.request<{
      message: string;
      order: {
        id: string;
        status: string;
        order_notes: string;
        shipping_address: any;
        total: number;
        [key: string]: any;
      };
    }>('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    }, false) // No authentication required for order creation (guest checkout)
  }

  async getOrders(params?: { page?: number; limit?: number; status?: string }) {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.status) queryParams.append('status', params.status)
    
    const query = queryParams.toString()
    return this.request<{
      orders: any[];
      total: number;
      page: number;
      limit: number;
      status_count?: Record<string, number>;
    }>(`/orders${query ? `?${query}` : ''}`)
  }

  async getOrder(id: string) {
    return this.request<{ 
      order: {
        order_id: string;
        guest_name: string;
        user_id: string;
        items: Array<{
          product_id: string;
          product_name: string;
          quantity: number;
          price: number;
          subtotal: number;
        }>;
        shipping_address: {
          full_name: string;
          address_line1: string;
          city: string;
          state: string;
          postal_code: string;
          country: string;
          phone: string;
        };
        subtotal: number;
        shipping_cost: number;
        tax: number;
        total: number;
        status: string;
        payment_method: string;
        payment_status: string;
        order_notes: string;
        admin_notes: string;
        order_placed_date: string;
        created_at: string;
        updated_at: string;
      }
    }>(`/orders/${id}`)
  }

  // Health Check
  async healthCheck() {
    return this.request<{ status: string; message: string }>('/health')
  }

  // Admin APIs
  async getAdminDashboard() {
    return this.request<any>('/admin/dashboard')
  }

  async getAdminUsers() {
    return this.request<any[]>('/admin/users')
  }

  async updateOrderStatus(orderId: string, status: string) {
    const requestBody = { status }
    console.log('📤 Update Status API Call:')
    console.log('   Endpoint:', `/admin/orders/${orderId}/status`)
    console.log('   Method: PATCH')
    console.log('   Body:', JSON.stringify(requestBody))
    console.log('   Token present:', !!this.token)
    
    return this.request<{
      message: string;
      order: {
        order_id: string;
        status: string;
        order_notes: string;
        admin_notes: string;
        shipping_address: any;
        updated_at: string;
        shipped_at: string | null;
        delivered_at: string | null;
        [key: string]: any;
      };
    }>(`/admin/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify(requestBody),
    })
  }

  async getAdminOrders(params?: { 
    page?: number; 
    limit?: number; 
    status?: string;
    from_date?: string;
    to_date?: string;
  }) {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.status) queryParams.append('status', params.status)
    if (params?.from_date) queryParams.append('from_date', params.from_date)
    if (params?.to_date) queryParams.append('to_date', params.to_date)
    
    const query = queryParams.toString()
    return this.request<{
      orders: any[];
      total: number;
      page: number;
      limit: number;
      status_count?: Record<string, number>;
    }>(`/orders${query ? `?${query}` : ''}`)
  }
}

// Export singleton instance
export const apiClient = new ApiClient(ENV.API_BASE_URL)
export default apiClient
