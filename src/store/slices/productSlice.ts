import { createSlice, type PayloadAction, createAsyncThunk } from '@reduxjs/toolkit'
import apiClient from '../../services/api'

export interface Product {
  id: string
  name: string
  price: number
  image: string
  description: string
  category: string
  inStock: boolean
  rating: number
  reviews: number
  featured?: boolean
  brand?: string
  specifications?: string
  weight?: string
  dimensions?: string
  color?: string
  material?: string
}

interface ProductState {
  products: Product[]
  filteredProducts: Product[]
  searchQuery: string
  selectedCategory: string
  loading: boolean
  error: string | null
}

// Async thunks for API calls
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (_, { rejectWithValue }) => {
    try {
      const response: any = await apiClient.getProducts()
      console.log('API Response:', response)
      // Handle different response formats
      const items = Array.isArray(response) ? response : (Array.isArray(response?.products) ? response.products : [])
      console.log('Items after processing:', items)
      // Normalize API response to frontend format
      const normalized = items.map((p: any) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        image: p.image_url || '', // Map image_url to image
        description: p.description || '',
        category: p.category,
        inStock: typeof p.inStock === 'boolean' ? p.inStock : p.in_stock,
        rating: p.rating || 0,
        reviews: p.reviews || 0,
        specifications: p.specification || '',
        material: p.material || ''
      }))
      console.log('Normalized products:', normalized)
      return normalized
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }
)

export const fetchProduct = createAsyncThunk(
  'products/fetchProduct',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await apiClient.getProduct(id)
      const p = response.product || response
      // Normalize API response to frontend format
      return {
        id: p.id,
        name: p.name,
        price: p.price,
        image: p.image_url || '',
        description: p.description || '',
        category: p.category,
        inStock: typeof p.inStock === 'boolean' ? p.inStock : p.in_stock,
        rating: p.rating || 0,
        reviews: p.reviews || 0,
        specifications: p.specification || '',
        material: p.material || ''
      }
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }
)

export const createProduct = createAsyncThunk(
  'products/createProduct',
  async (productData: Partial<Product>, { rejectWithValue }) => {
    try {
      const product = await apiClient.createProduct(productData)
      return product
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }
)

export const updateProduct = createAsyncThunk(
  'products/updateProduct',
  async ({ id, productData }: { id: string; productData: Partial<Product> }, { rejectWithValue }) => {
    try {
      const product = await apiClient.updateProduct(id, productData)
      return product
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }
)

export const deleteProduct = createAsyncThunk(
  'products/deleteProduct',
  async (id: string, { rejectWithValue }) => {
    try {
      await apiClient.deleteProduct(id)
      return id
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }
)

const initialState: ProductState = {
  products: [],
  filteredProducts: [],
  searchQuery: '',
  selectedCategory: 'All',
  loading: false,
  error: null,
}

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setProducts: (state, action: PayloadAction<Product[]>) => {
      state.products = action.payload
      state.filteredProducts = action.payload
    },
    
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload
      state.filteredProducts = state.products.filter(product =>
        product.name.toLowerCase().includes(action.payload.toLowerCase()) ||
        product.description.toLowerCase().includes(action.payload.toLowerCase())
      )
    },
    
    setCategory: (state, action: PayloadAction<string>) => {
      state.selectedCategory = action.payload
      let filtered = state.products
      
      if (action.payload !== 'All') {
        filtered = state.products.filter(product => product.category === action.payload)
      }
      
      if (state.searchQuery) {
        filtered = filtered.filter(product =>
          product.name.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
          product.description.toLowerCase().includes(state.searchQuery.toLowerCase())
        )
      }
      
      state.filteredProducts = filtered
    },
    
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch products
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false
        state.products = action.payload
        state.filteredProducts = action.payload
        state.error = null
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // Fetch single product
      .addCase(fetchProduct.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchProduct.fulfilled, (state, action) => {
        state.loading = false
        const existingIndex = state.products.findIndex(p => p.id === action.payload.id)
        if (existingIndex >= 0) {
          state.products[existingIndex] = action.payload
        } else {
          state.products.push(action.payload)
        }
        state.error = null
      })
      .addCase(fetchProduct.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // Create product
      .addCase(createProduct.fulfilled, (state, action) => {
        state.products.push(action.payload)
        state.filteredProducts = state.products
      })
      // Update product
      .addCase(updateProduct.fulfilled, (state, action) => {
        const index = state.products.findIndex(p => p.id === action.payload.id)
        if (index >= 0) {
          state.products[index] = action.payload
          state.filteredProducts = state.products
        }
      })
      // Delete product
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.products = state.products.filter(p => p.id !== action.payload)
        state.filteredProducts = state.filteredProducts.filter(p => p.id !== action.payload)
      })
  },
})

export const { setProducts, setSearchQuery, setCategory, setLoading, setError } = productSlice.actions
export default productSlice.reducer
