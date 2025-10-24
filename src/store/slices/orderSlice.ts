import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export interface OrderItem {
  id: string
  name: string
  price: number
  quantity: number
  image: string
}

export interface ShippingAddress {
  firstName: string
  lastName: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
  phone: string
  email?: string
}

export interface Order {
  id: string
  items: OrderItem[]
  total: number
  shippingAddress: ShippingAddress
  paymentMethod: string
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
  orderDate: string
  trackingNumber?: string
}

interface OrderState {
  orders: Order[]
  currentOrder: Order | null
  loading: boolean
  error: string | null
}

const initialState: OrderState = {
  orders: [],
  currentOrder: null,
  loading: false,
  error: null,
}

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    addOrder: (state, action: PayloadAction<Order>) => {
      state.orders.unshift(action.payload)
      state.currentOrder = action.payload
    },
    
    updateOrderStatus: (state, action: PayloadAction<{ orderId: string; status: Order['status'] }>) => {
      const order = state.orders.find(order => order.id === action.payload.orderId)
      if (order) {
        order.status = action.payload.status
      }
    },
    
    setOrders: (state, action: PayloadAction<Order[]>) => {
      state.orders = action.payload
    },
    
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
  },
})

export const { addOrder, updateOrderStatus, setOrders, setLoading, setError } = orderSlice.actions
export default orderSlice.reducer
