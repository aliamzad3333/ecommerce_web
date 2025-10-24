import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

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

const initialState: ProductState = {
  products: [
    {
      id: '1',
      name: 'Premium Wireless Headphones',
      price: 299.99,
      image: '/api/placeholder/300/300',
      description: 'High-quality wireless headphones with noise cancellation',
      category: 'Electronics',
      inStock: true,
      rating: 4.8,
      reviews: 124,
      featured: true,
    },
    {
      id: '2',
      name: 'Smart Fitness Watch',
      price: 199.99,
      image: '/api/placeholder/300/300',
      description: 'Track your fitness with this advanced smartwatch',
      category: 'Electronics',
      inStock: true,
      rating: 4.6,
      reviews: 89,
      featured: true,
    },
    {
      id: '3',
      name: 'Organic Cotton T-Shirt',
      price: 29.99,
      image: '/api/placeholder/300/300',
      description: 'Comfortable and sustainable cotton t-shirt',
      category: 'Clothing',
      inStock: true,
      rating: 4.4,
      reviews: 67,
      featured: false,
    },
    {
      id: '4',
      name: 'Stainless Steel Water Bottle',
      price: 24.99,
      image: '/api/placeholder/300/300',
      description: 'Keep your drinks cold for 24 hours',
      category: 'Accessories',
      inStock: true,
      rating: 4.7,
      reviews: 156,
      featured: false,
    },
    {
      id: '5',
      name: 'Wireless Charging Pad',
      price: 49.99,
      image: '/api/placeholder/300/300',
      description: 'Fast wireless charging for your devices',
      category: 'Electronics',
      inStock: false,
      rating: 4.5,
      reviews: 78,
      featured: false,
    },
    {
      id: '6',
      name: 'Leather Backpack',
      price: 149.99,
      image: '/api/placeholder/300/300',
      description: 'Premium leather backpack for daily use',
      category: 'Accessories',
      inStock: true,
      rating: 4.9,
      reviews: 203,
      featured: true,
    },
  ],
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
})

export const { setProducts, setSearchQuery, setCategory, setLoading, setError } = productSlice.actions
export default productSlice.reducer
