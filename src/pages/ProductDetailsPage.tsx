import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { 
  TruckIcon,
  ShieldCheckIcon,
  MinusIcon,
  PlusIcon,
  CheckCircleIcon,
  PhoneIcon,
  UserIcon,
  MapPinIcon,
  LockClosedIcon
} from '@heroicons/react/24/solid'
import { PhoneIcon as PhoneOutlineIcon, ArrowRightOnRectangleIcon, ShoppingCartIcon } from '@heroicons/react/24/outline'
import { addToCart } from '../store/slices/cartSlice'
import { logout } from '../store/slices/userSlice'
import { apiClient } from '../services/api'
import LoadingOverlay from '../components/molecules/LoadingOverlay'
import OrderConfirmationModal from '../components/molecules/OrderConfirmationModal'
import CartFlyout from '../components/molecules/CartFlyout'
import type { RootState } from '../store/store'

const ProductDetailsPage = () => {
  const { slug } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { currentUser, isAuthenticated } = useSelector((state: RootState) => state.user)
  const { itemCount } = useSelector((state: RootState) => state.cart)
  
  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [isAddedToCart, setIsAddedToCart] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  
  const handleLogout = () => {
    dispatch(logout())
    navigate('/')
  }
  
  // Checkout form state
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    shippingMethod: 'dhaka'
  })
  const [deliveryCharge, setDeliveryCharge] = useState(50)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showOrderConfirmation, setShowOrderConfirmation] = useState(false)
  const [orderConfirmationData, setOrderConfirmationData] = useState<any>(null)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const fetchProductBySlug = async () => {
      try {
        setLoading(true)
        
        // Fetch all products and find by name matching slug
        const response = await apiClient.getProducts({ limit: 1000 })
        const products = response.products || []
        
        // Convert slug back to match product name
        const productName = slug?.replace(/-/g, ' ') || ''
        
        // Find product by matching name (case-insensitive)
        const foundProduct = products.find((p: any) => 
          p.name.toLowerCase() === productName.toLowerCase()
        )
        
        if (foundProduct) {
          // Normalize product data
          const normalizedProduct = {
            id: foundProduct.id,
            name: foundProduct.name,
            price: foundProduct.price,
            offer_price: foundProduct.offer_price || null,
            image: foundProduct.image_url || '',
            description: foundProduct.description || '',
            category: foundProduct.category,
            inStock: typeof foundProduct.in_stock === 'boolean' ? foundProduct.in_stock : true,
            rating: foundProduct.rating || 4.5,
            reviews: foundProduct.reviews || 0,
            specifications: foundProduct.specification || foundProduct.specifications || '',
            material: foundProduct.material || ''
          }
          
          setProduct(normalizedProduct)
        } else {
          setProduct(null)
        }
      } catch (error) {
        console.error('Failed to fetch product:', error)
        setProduct(null)
      } finally {
        setLoading(false)
      }
    }

    if (slug) {
      fetchProductBySlug()
    }
  }, [slug])

  const handleAddToCart = () => {
    if (product) {
      dispatch(addToCart({
        id: product.id,
        name: product.name,
        price: product.offer_price || product.price,  // Use offer price if available
        image: product.image,
        description: product.description
      }))
      setIsAddedToCart(true)
      setTimeout(() => setIsAddedToCart(false), 3000)
      
      // Scroll to the order form at the bottom
      setTimeout(() => {
        const formSection = document.getElementById('order-form')
        if (formSection) {
          formSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }, 500)
    }
  }

  const incrementQuantity = () => setQuantity(prev => prev + 1)
  const decrementQuantity = () => setQuantity(prev => prev > 1 ? prev - 1 : 1)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleShippingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setFormData(prev => ({ ...prev, shippingMethod: value }))
    if (value === 'dhaka' || value === 'chittagong') {
      setDeliveryCharge(50)
    } else {
      setDeliveryCharge(100)
    }
  }

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.phone || !formData.address) {
      setErrorMessage('দয়া করে সকল তথ্য পূরণ করুন')
      return
    }

    if (!product) {
      setErrorMessage('পণ্য পাওয়া যায়নি')
      return
    }

    setIsSubmitting(true)
    setErrorMessage('')
    
    try {
      const productPrice = product.offer_price || product.price
      const subtotal = productPrice * quantity
      const shippingCost = deliveryCharge
      const tax = 0
      const grandTotal = subtotal + shippingCost + tax
      
      const orderData = {
        items: [{
          product_id: product.id,
          quantity: quantity
        }],
        shipping_address: {
          full_name: formData.name,
          address_line1: formData.address,
          city: formData.shippingMethod === 'dhaka' ? 'Dhaka' : formData.shippingMethod === 'chittagong' ? 'Chittagong' : 'Other',
          state: 'Bangladesh',
          postal_code: '',
          country: 'Bangladesh',
          phone: formData.phone
        },
        payment_method: 'cash' as const,
        subtotal: parseFloat(subtotal.toFixed(2)),
        shipping_cost: parseFloat(shippingCost.toFixed(2)),
        tax: parseFloat('0.00'),
        total: parseFloat(grandTotal.toFixed(2))
      }
      
      const response = await apiClient.createOrder(orderData)
      
      console.log('✅ Order created successfully:', response)
      
      // Prepare order confirmation data
      const orderId = response.order?.order_id || response.order?.id || 'unknown'
      const confirmationData = {
        id: orderId,
        order_number: response.order?.order_number || orderId,
        items: response.order?.items || [{
          product_name: product.name,
          quantity: quantity
        }],
        total: response.order?.total || grandTotal,
        shipping_address: {
          full_name: response.order?.shipping_address?.full_name || formData.name,
          phone: response.order?.shipping_address?.phone || formData.phone,
          address_line1: response.order?.shipping_address?.address_line1 || formData.address,
          city: response.order?.shipping_address?.city || (formData.shippingMethod === 'dhaka' ? 'Dhaka' : 'Outside Dhaka')
        },
        guest_name: response.order?.guest_name,
        status: response.order?.status,
        order_placed_date: response.order?.order_placed_date || response.order?.created_at
      }
      
      // Reset form
      setFormData({
        name: '',
        phone: '',
        address: '',
        shippingMethod: 'dhaka'
      })
      setDeliveryCharge(50)
      setQuantity(1)
      setErrorMessage('')
      
      // Stop loading
      setIsSubmitting(false)
      
      // Show confirmation modal
      setOrderConfirmationData(confirmationData)
      setShowOrderConfirmation(true)
      
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' })
      
    } catch (error: any) {
      console.error('Order submission failed:', error)
      setErrorMessage(error.message || 'অর্ডার সম্পন্ন হয়নি। আবার চেষ্টা করুন।')
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50">
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-4">
            <div className="absolute inset-0 border-4 border-pink-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-pink-600 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <p className="text-gray-600 text-lg font-medium">পণ্য লোড হচ্ছে...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">পণ্য পাওয়া যায়নি</h2>
          <button
            onClick={() => navigate('/')}
            className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-3 rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all transform hover:scale-105 font-semibold"
          >
            হোমে ফিরে যান
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      {/* Navigation Bar */}
      <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="url(#gradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="url(#gradientFill)"/>
                  <path d="M9 22V12H15V22" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style={{stopColor:"#ec4899", stopOpacity:1}} />
                      <stop offset="100%" style={{stopColor:"#9333ea", stopOpacity:1}} />
                    </linearGradient>
                    <linearGradient id="gradientFill" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style={{stopColor:"#fce7f3", stopOpacity:0.3}} />
                      <stop offset="100%" style={{stopColor:"#f3e8ff", stopOpacity:0.3}} />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold">BRO SHOP BD</h1>
                <p className="text-sm text-pink-100">Buy It</p>
              </div>
            </Link>

            {/* Cart and User Authentication */}
            <div className="flex items-center space-x-4">
              {/* Cart Icon */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="flex items-center space-x-2 hover:opacity-80 transition-opacity relative"
              >
                <div className="relative">
                  <ShoppingCartIcon className="h-8 w-8" />
                  {itemCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                      {itemCount > 99 ? '99+' : itemCount}
                    </span>
                  )}
                </div>
                <span className="text-sm">My Cart</span>
              </button>

              {/* User Authentication */}
              {isAuthenticated ? (
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-2">
                    <UserIcon className="h-6 w-6" />
                    <span className="text-sm">{currentUser?.name}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-1 text-sm hover:text-pink-200 transition-colors"
                  >
                    <ArrowRightOnRectangleIcon className="h-5 w-5" />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center space-x-1 text-sm hover:text-pink-200 transition-colors"
                >
                  <UserIcon className="h-5 w-5" />
                  <span>Login</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Product Details */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 p-8 lg:p-12">
            {/* Left Side - Images */}
            <div className="space-y-6">
              {/* Main Image */}
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-pink-100 to-purple-100 group">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      if (!target.src.includes('data:image/svg')) {
                        target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2U1ZTdlYiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5YTliYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4='
                      }
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-9xl">🧸</span>
                  </div>
                )}

                {/* Stock Badge */}
                {product.inStock ? (
                  <div className="absolute top-4 left-4 bg-green-500 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 shadow-lg">
                    <CheckCircleIcon className="h-5 w-5" />
                    In Stock
                  </div>
                ) : (
                  <div className="absolute top-4 left-4 bg-red-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                    Out of Stock
                  </div>
                )}
              </div>
            </div>

            {/* Right Side - Product Info */}
            <div className="space-y-6">
              {/* Product Title */}
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-3">{product.name}</h1>
              </div>

              {/* Price */}
              <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-6">
                {product.offer_price && product.offer_price < product.price ? (
                  <>
                    <div className="flex items-baseline gap-3 flex-wrap">
                      <span className="text-5xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                        ৳{product.offer_price.toFixed(2)}
                      </span>
                      <span className="text-2xl text-gray-500 line-through">
                        ৳{product.price.toFixed(2)}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center gap-3">
                      <span className="inline-block bg-red-500 text-white px-4 py-2 rounded-full text-sm font-bold animate-pulse-once">
                        🔥 সাশ্রয় করুন ৳{(product.price - product.offer_price).toFixed(2)}
                      </span>
                      <span className="inline-block bg-green-500 text-white px-4 py-2 rounded-full text-sm font-bold">
                        {Math.round(((product.price - product.offer_price) / product.price) * 100)}% ছাড়
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="flex items-baseline gap-3">
                    <span className="text-5xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                      ৳{product.price.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>

              {/* Description - render each point on its own line */}
              {product.description && (
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">পণ্যের বিবরণ</h3>
                  <div className="space-y-2 text-gray-700">
                    {product.description
                      // Split by newline only, as per API contract
                      .split(/\r?\n/g)
                      .map((line: string) => line.trim())
                      .filter((line: string) => line.length > 0)
                      .map((point: string, index: number) => (
                        <div key={index} className="flex items-start gap-2">
                          {index > 0 && (
                            <CheckCircleIcon className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                          )}
                          <span>{point}</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Removed Specifications and Material sections per request */}

              {/* Quantity Selector */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">পরিমাণ</h3>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border-2 border-gray-300 rounded-lg overflow-hidden">
                    <button
                      onClick={decrementQuantity}
                      className="p-3 hover:bg-gray-100 transition-colors"
                      disabled={quantity <= 1}
                    >
                      <MinusIcon className="h-5 w-5 text-gray-600" />
                    </button>
                    <span className="px-8 py-3 text-xl font-bold text-gray-900 min-w-[80px] text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={incrementQuantity}
                      className="p-3 hover:bg-gray-100 transition-colors"
                    >
                      <PlusIcon className="h-5 w-5 text-gray-600" />
                    </button>
                  </div>
                  
                  <div className="text-gray-600">
                    <span className="font-semibold">মোট:</span> ৳{((product.offer_price || product.price) * quantity).toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Add to Cart Button */}
              <div className="space-y-4">
                <button
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                  className={`w-full py-4 px-8 rounded-xl font-bold text-lg transition-all duration-200 flex items-center justify-center gap-3 ${
                    product.inStock
                      ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700 transform hover:scale-105 shadow-lg hover:shadow-xl'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <ShoppingCartIcon className="h-6 w-6" />
                  {product.inStock ? (isAddedToCart ? '✓ Added to Cart!' : 'Add to Cart') : 'Out of Stock'}
                </button>

                {isAddedToCart && (
                  <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg animate-slideDown">
                    <div className="flex items-center gap-3">
                      <CheckCircleIcon className="h-6 w-6 text-green-500" />
                      <p className="text-green-800 font-semibold">পণ্য সফলভাবে কার্টে যোগ করা হয়েছে!</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Features */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t border-gray-200">
                <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl">
                  <TruckIcon className="h-8 w-8 text-blue-600" />
                  <div>
                    <h4 className="font-semibold text-gray-900">বিনামূল্যে ডেলিভারি</h4>
                    <p className="text-sm text-gray-600">১০০০ টাকার বেশি অর্ডারে</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl">
                  <ShieldCheckIcon className="h-8 w-8 text-green-600" />
                  <div>
                    <h4 className="font-semibold text-gray-900">১০০% অথেনটিক</h4>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Order Now Section */}
        <div className="mt-12 bg-gradient-to-r from-pink-600 to-purple-600 rounded-3xl shadow-2xl p-8 md:p-12">
          <div className="border-t border-white/20 mb-8"></div>
          
          {/* Price Summary */}
          <div className="text-center mb-8">
            {product.offer_price && product.offer_price < product.price ? (
              <>
                <div className="mb-4">
                  <span className="text-white text-lg md:text-xl font-semibold">রেগুলার প্রাইস: </span>
                  <span className="text-white text-2xl md:text-3xl font-bold relative inline-block">
                    <span className="relative">
                      ৳{product.price.toFixed(2)} টাকা
                      <span className="absolute left-0 right-0 top-1/2 h-0.5 bg-green-400 transform -translate-y-1/2"></span>
                    </span>
                  </span>
                </div>
                <div>
                  <span className="text-white text-xl md:text-2xl font-semibold">অফার প্রাইস: </span>
                  <span className="text-white text-4xl md:text-5xl font-bold relative inline-block">
                    <span className="relative">
                      ৳{product.offer_price.toFixed(2)} টাকা
                      <span className="absolute left-0 right-0 bottom-0 h-1 bg-green-400"></span>
                    </span>
                  </span>
                </div>
              </>
            ) : (
              <div>
                <span className="text-white text-xl md:text-2xl font-semibold">দাম: </span>
                <span className="text-white text-4xl md:text-5xl font-bold">৳{product.price.toFixed(2)} টাকা</span>
              </div>
            )}
          </div>

          {/* Order Now Button - Scrolls to form */}
          <div className="max-w-md mx-auto mb-8">
            <button
              onClick={() => {
                const formSection = document.getElementById('order-form')
                formSection?.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }}
              disabled={!product.inStock}
              className={`w-full py-5 px-8 rounded-xl font-bold text-xl transition-all duration-200 ${
                product.inStock
                  ? 'bg-white text-pink-600 hover:bg-pink-50 transform hover:scale-105 shadow-lg hover:shadow-2xl'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {product.inStock ? 'অর্ডার করতে চাই' : 'স্টক নেই'}
            </button>
          </div>

          {/* Contact Info */}
          <div className="text-center space-y-6">
            <p className="text-white text-base md:text-lg font-medium px-4">
              সরাসরি যোগাযোগ করতে কল করুন সকাল ৮টা থেকে রাত ১২টা পর্যন্ত
            </p>
            <a
              href="tel:01718620866"
              className="inline-flex items-center gap-3 bg-white rounded-xl px-8 py-4 shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all"
            >
              <PhoneIcon className="h-6 w-6 text-red-600" />
              <span className="text-red-600 font-bold text-2xl">01718620866</span>
            </a>
          </div>
        </div>

        {/* Checkout Form Section */}
        <div id="order-form" className="mt-12 bg-white rounded-3xl shadow-2xl p-8 md:p-12">
          {/* Error Message */}
          {errorMessage && (
            <div className="mb-8 bg-red-50 border-l-4 border-red-500 p-6 rounded-xl">
              <p className="text-red-700 font-semibold">{errorMessage}</p>
            </div>
          )}

          {/* Form Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-3">
              অর্ডার করতে সঠিক তথ্য দিয়ে নিচের ফর্ম টি পূরণ করুন
            </h2>
            <p className="text-gray-600">ক্যাশ অন ডেলিভারিতে অর্ডার করুন</p>
          </div>

          <form onSubmit={handleOrderSubmit} className="space-y-6">
            {/* Customer Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column - Form */}
              <div className="space-y-6">
                <div>
                  <label className="block text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <UserIcon className="h-6 w-6 text-pink-600" />
                    আপনার নামঃ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="আপনার নাম লিখুন"
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all text-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <MapPinIcon className="h-6 w-6 text-pink-600" />
                    আপনার সম্পূর্ণ ঠিকানাঃ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="আপনার সম্পূর্ণ ঠিকানা লিখুন"
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all text-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <PhoneOutlineIcon className="h-6 w-6 text-pink-600" />
                    আপনার মোবাইল নাম্বারঃ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="আপনার মোবাইল নাম্বার লিখুন"
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all text-lg"
                    required
                  />
                </div>

                {/* Shipping Options */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <TruckIcon className="h-6 w-6 text-pink-600" />
                    শিপিং
                  </h3>
                  <div className="space-y-3">
                    <label className="flex items-center justify-between p-5 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-pink-500 hover:bg-pink-50 transition-all">
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="shippingMethod"
                          value="dhaka"
                          checked={formData.shippingMethod === 'dhaka'}
                          onChange={handleShippingChange}
                          className="h-5 w-5 text-pink-600 focus:ring-pink-500"
                        />
                        <span className="text-gray-900 font-medium">ঢাকা সিটির ভিতরে</span>
                      </div>
                      <span className="font-bold text-pink-600">Tk 50.00</span>
                    </label>

                    <label className="flex items-center justify-between p-5 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-pink-500 hover:bg-pink-50 transition-all">
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="shippingMethod"
                          value="chittagong"
                          checked={formData.shippingMethod === 'chittagong'}
                          onChange={handleShippingChange}
                          className="h-5 w-5 text-pink-600 focus:ring-pink-500"
                        />
                        <span className="text-gray-900 font-medium">চট্টগ্রাম সিটির ভিতরে</span>
                      </div>
                      <span className="font-bold text-pink-600">Tk 50.00</span>
                    </label>

                    <label className="flex items-center justify-between p-5 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-pink-500 hover:bg-pink-50 transition-all">
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="shippingMethod"
                          value="outside"
                          checked={formData.shippingMethod === 'outside'}
                          onChange={handleShippingChange}
                          className="h-5 w-5 text-pink-600 focus:ring-pink-500"
                        />
                        <span className="text-gray-900 font-medium">ঢাকা এবং চট্টগ্রাম সিটির বাহিরে</span>
                      </div>
                      <span className="font-bold text-pink-600">Tk 100.00</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Right Column - Order Summary */}
              <div>
                <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl p-6 sticky top-24">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <ShoppingCartIcon className="h-6 w-6 text-pink-600" />
                    আপনার অর্ডার
                  </h3>

                  {/* Product */}
                  <div className="space-y-4 mb-6">
                    <div className="flex gap-4 p-4 bg-white rounded-xl shadow-sm">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-20 h-20 object-cover rounded-lg"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjZTVlN2ViIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzlhOWJhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg=='
                        }}
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-2">{product.name}</h4>
                        <p className="text-gray-600">× {quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-pink-600">৳{((product.offer_price || product.price) * quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="space-y-3 border-t border-gray-300 pt-4">
                    <div className="flex justify-between text-gray-700">
                      <span>সাবটোটাল</span>
                      <span className="font-semibold">৳{((product.offer_price || product.price) * quantity).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-700">
                      <span>শিপিং</span>
                      <span className="font-semibold">৳{deliveryCharge.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xl font-bold text-gray-900 pt-3 border-t border-gray-300">
                      <span>মোট</span>
                      <span className="text-pink-600">৳{(((product.offer_price || product.price) * quantity) + deliveryCharge).toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Cash on Delivery */}
                  <div className="mt-6 p-4 bg-white rounded-xl">
                    <h4 className="font-bold text-gray-900 mb-2">ক্যাশ অন ডেলিভারি</h4>
                    <p className="text-sm text-gray-600">ডেলিভারির সময় নগদ অর্থ প্রদান করুন।</p>
                  </div>

                  {/* Privacy Policy */}
                  <p className="mt-4 text-xs text-gray-500 leading-relaxed">
                    আপনার ব্যক্তিগত তথ্য আপনার অর্ডার প্রক্রিয়া করতে, এই ওয়েবসাইট জুড়ে আপনার অভিজ্ঞতা সমর্থন করতে এবং আমাদের গোপনীয়তা নীতিতে বর্ণিত অন্যান্য উদ্দেশ্যে ব্যবহার করা হবে।
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={!product.inStock || isSubmitting}
                className={`w-full py-6 px-8 rounded-xl font-bold text-xl transition-all duration-200 flex items-center justify-center gap-3 ${
                  product.inStock && !isSubmitting
                    ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white hover:from-pink-700 hover:to-purple-700 transform hover:scale-105 shadow-lg hover:shadow-2xl'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <LockClosedIcon className="h-6 w-6" />
                {isSubmitting ? 'অর্ডার প্রসেস হচ্ছে...' : `অর্ডার করুন ৳${(((product.offer_price || product.price) * quantity) + deliveryCharge).toFixed(2)}`}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Loading Overlay */}
      {isSubmitting && <LoadingOverlay />}

      {/* Order Confirmation Modal */}
      <OrderConfirmationModal
        isOpen={showOrderConfirmation}
        onClose={() => {
          setShowOrderConfirmation(false)
          setOrderConfirmationData(null)
        }}
        orderData={orderConfirmationData}
      />

      {/* Cart Flyout */}
      <CartFlyout isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  )
}

export default ProductDetailsPage


