import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const pageTitles: Record<string, string> = {
  '/': 'Bro Shop BD',
  '/shop': 'Shop - Bro Shop BD',
  '/shop/cart': 'Cart - Bro Shop BD',
  '/shop/checkout': 'Checkout - Bro Shop BD',
  '/shop/my-orders': 'My Orders - Bro Shop BD',
  '/login': 'Login - Bro Shop BD',
  '/register': 'Register - Bro Shop BD',
  '/admin/login': 'Admin Login - Bro Shop BD',
  '/admin': 'Admin Dashboard - Bro Shop BD',
  '/admin/dashboard': 'Admin Dashboard - Bro Shop BD',
  '/admin/products': 'Admin Products - Bro Shop BD',
  '/admin/orders': 'Admin Orders - Bro Shop BD',
  '/admin/messages': 'Admin Messages - Bro Shop BD',
  '/admin/slider': 'Admin Slider Settings - Bro Shop BD',
}

export const usePageTitle = () => {
  const location = useLocation()

  useEffect(() => {
    const path = location.pathname
    
    // Check for product details route
    if (path.match(/^\/shop\/product\/.+/)) {
      document.title = 'Product Details - Bro Shop BD'
      return
    }
    
    // Check for order confirmation route
    if (path.match(/^\/shop\/order-confirmation\/.+/)) {
      document.title = 'Order Confirmation - Bro Shop BD'
      return
    }
    
    // Get title from map or use default
    const title = pageTitles[path] || 'Bro Shop BD'
    document.title = title
  }, [location.pathname])
}

