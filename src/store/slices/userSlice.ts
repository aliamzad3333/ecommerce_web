import { createSlice, type PayloadAction, createAsyncThunk } from '@reduxjs/toolkit'
import apiClient from '../../services/api'

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  isAdmin: boolean
}

interface UserState {
  currentUser: User | null
  isAuthenticated: boolean
  loading: boolean
  error: string | null
}

const initialState: UserState = {
  currentUser: null,
  isAuthenticated: false,
  loading: false,
  error: null,
}

// Async thunks for API calls
export const loginUser = createAsyncThunk(
  'user/login',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await apiClient.login(email, password)
      return response.user
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }
)

export const registerUser = createAsyncThunk(
  'user/register',
  async (userData: { name: string; email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await apiClient.register(userData)
      return response.user
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }
)

export const getCurrentUser = createAsyncThunk(
  'user/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const user = await apiClient.getProfile()
      return user
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }
)

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.currentUser = action.payload
      state.isAuthenticated = true
      state.error = null
    },
    
    logout: (state) => {
      apiClient.logout()
      state.currentUser = null
      state.isAuthenticated = false
      state.error = null
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
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false
        state.currentUser = action.payload
        state.isAuthenticated = true
        state.error = null
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false
        state.currentUser = action.payload
        state.isAuthenticated = true
        state.error = null
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // Get current user
      .addCase(getCurrentUser.pending, (state) => {
        state.loading = true
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.loading = false
        state.currentUser = action.payload
        state.isAuthenticated = true
      })
      .addCase(getCurrentUser.rejected, (state) => {
        state.loading = false
        state.isAuthenticated = false
        state.currentUser = null
      })
  },
})

export const { setUser, logout, setLoading, setError } = userSlice.actions
export default userSlice.reducer
