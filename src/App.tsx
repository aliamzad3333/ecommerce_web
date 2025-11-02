import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from './store/store'
import Layout from './components/templates/Layout'
import AdminLayout from './components/templates/AdminLayout'
import ProtectedRoute from './components/atoms/ProtectedRoute'
import Home from './pages/Home'
import LandingPage from './pages/LandingPage'
import ProductDetails from './pages/ProductDetails'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import OrderConfirmation from './pages/OrderConfirmation'
import MyOrders from './pages/MyOrders'
import Login from './pages/Login'
import Register from './pages/Register'
import AdminLogin from './pages/admin/AdminLogin'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminOrdersEnhanced from './pages/admin/AdminOrdersEnhanced'
import AdminProducts from './pages/admin/AdminProducts'
import AdminMessages from './pages/admin/AdminMessages'
import AdminSliderSettings from './pages/admin/AdminSliderSettings'
import { usePageTitle } from './hooks/usePageTitle'

function AppContent() {
  usePageTitle()
  
  return (
    <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/shop" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="product/:id" element={<ProductDetails />} />
              <Route path="cart" element={<Cart />} />
              <Route path="checkout" element={
                <ProtectedRoute>
                  <Checkout />
                </ProtectedRoute>
              } />
              <Route path="order-confirmation/:orderId" element={
                <ProtectedRoute>
                  <OrderConfirmation />
                </ProtectedRoute>
              } />
              <Route path="my-orders" element={
                <ProtectedRoute>
                  <MyOrders />
                </ProtectedRoute>
              } />
            </Route>
          
          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={
            <ProtectedRoute requireAdmin={true}>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<AdminDashboard />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="orders" element={<AdminOrdersEnhanced />} />
            <Route path="messages" element={<AdminMessages />} />
            <Route path="slider" element={<AdminSliderSettings />} />
          </Route>
        </Routes>
  )
}

function App() {
  return (
    <Provider store={store}>
      <Router basename="/">
        <AppContent />
      </Router>
    </Provider>
  )
}

export default App