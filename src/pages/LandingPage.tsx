import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import type { RootState } from '../store/store'
import { logout } from '../store/slices/userSlice'
import { fetchProducts } from '../store/slices/productSlice'
import apiClient from '../services/api'
import { addToCart } from '../store/slices/cartSlice'
import CartFlyout from '../components/molecules/CartFlyout'
import { 
  ShoppingCartIcon, 
  MagnifyingGlassIcon,
  TruckIcon,
  ShieldCheckIcon,
  TagIcon
} from '@heroicons/react/24/outline'
import { UserIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline'

const LandingPage = () => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [allProducts, setAllProducts] = useState<any[]>([])
  const [sliderData, setSliderData] = useState<{
    slides: Array<{
      id: string;
      image_url: string;
      order: number;
    }>;
    settings: {
      slide_duration: number;
      auto_play: boolean;
      show_indicators: boolean;
      show_controls: boolean;
    };
  }>({
    slides: [],
    settings: {
      slide_duration: 5,
      auto_play: true,
      show_indicators: false,
      show_controls: false
    }
  })
  const [sliderLoading, setSliderLoading] = useState(true)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { currentUser, isAuthenticated } = useSelector((state: RootState) => state.user)
  const { products, loading, error } = useSelector((state: RootState) => state.products)
  const { itemCount } = useSelector((state: RootState) => state.cart)

  // Handle click outside to close search
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        if (!searchTerm) {
          setIsSearchOpen(false)
        }
      }
    }

    if (isSearchOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isSearchOpen, searchTerm])

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 500)
    return () => clearTimeout(timer)
  }, [searchTerm])

  // Fetch slider data from API
  useEffect(() => {
    const loadSliderData = async () => {
      try {
        setSliderLoading(true)
        const data = await apiClient.getSliderData()
        
        // Validate data structure and ensure slides/settings exist
        if (data && Array.isArray(data.slides) && data.settings) {
          setSliderData({
            slides: data.slides || [], // Already relative paths from backend
            settings: data.settings || {
              slide_duration: 5,
              auto_play: true,
              show_indicators: false,
              show_controls: false
            }
          })
        } else {
          // Set default empty structure if API returns invalid data
          setSliderData({
            slides: [],
            settings: {
              slide_duration: 5,
              auto_play: true,
              show_indicators: false,
              show_controls: false
            }
          })
        }
      } catch (error) {
        console.error('Failed to load slider data:', error)
        // Fallback to empty structure if API fails
        setSliderData({
          slides: [],
          settings: {
            slide_duration: 5,
            auto_play: true,
            show_indicators: false,
            show_controls: false
          }
        })
      } finally {
        setSliderLoading(false)
      }
    }

    loadSliderData()
  }, [])

  // Reset slide index when slides change
  useEffect(() => {
    if (sliderData.slides && sliderData.slides.length > 0) {
      setCurrentSlide(0)
    }
  }, [sliderData.slides.length])

  // Auto-advance slides based on duration from API (convert seconds to milliseconds)
  useEffect(() => {
    if (!sliderData.settings.auto_play || !sliderData.slides || sliderData.slides.length === 0) return

    const durationMs = sliderData.settings.slide_duration * 1000
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliderData.slides.length)
    }, durationMs)

    return () => clearInterval(interval)
  }, [sliderData.slides.length, sliderData.settings.auto_play, sliderData.settings.slide_duration])

  // Fetch all products once on mount
  useEffect(() => {
    const filters: any = {
      limit: 100,
      page: 1
    }
    dispatch(fetchProducts(filters) as any)
  }, [dispatch])

  // Store all products when fetched
  useEffect(() => {
    if (products.length > 0 && allProducts.length === 0) {
      setAllProducts(products)
    }
  }, [products, allProducts.length])

  // Filter products client-side based on search
  const filteredProducts = debouncedSearchTerm.trim()
    ? (allProducts.length > 0 ? allProducts : products).filter((product) =>
        product.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase().trim())
      )
    : (allProducts.length > 0 ? allProducts : products)

  const handleLogout = () => {
    dispatch(logout())
    navigate('/')
  }

  const babyProducts = filteredProducts.length > 0 ? filteredProducts : []

  const handleAddToCart = (product: typeof babyProducts[0]) => {
    if (!product.inStock) return
    
    dispatch(addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      description: product.category
    }))
    
    // Open cart flyout when item is added
    setIsCartOpen(true)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-3">
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
            </div>

            {/* Search, Cart and User */}
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative flex items-center" ref={searchRef}>
                {!isSearchOpen && !searchTerm ? (
                  <button
                    onClick={() => setIsSearchOpen(true)}
                    className="p-2 rounded-lg hover:bg-white/20 transition-colors"
                    aria-label="Search"
                  >
                    <MagnifyingGlassIcon className="h-6 w-6" />
                  </button>
                ) : (
                  <div className="bg-white rounded-lg shadow-xl p-2 min-w-[250px] md:min-w-[300px] max-w-[400px]">
                    <div className="relative flex items-center">
                      <MagnifyingGlassIcon className="absolute left-3 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search products by name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        autoFocus={isSearchOpen}
                        className="w-full pl-10 pr-10 py-2 rounded-lg text-gray-900 border border-purple-200 focus:ring-2 focus:ring-pink-500 focus:outline-none"
                      />
                      {searchTerm && (
                        <button
                          onClick={() => {
                            setSearchTerm('')
                            setIsSearchOpen(false)
                          }}
                          className="absolute right-3 text-gray-400 hover:text-gray-600"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={() => setIsCartOpen(true)}
                className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
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


      {/* Hero Slider */}
      <div className="relative w-full">
        <div className="relative w-full">
          <div className="overflow-hidden w-full">
            <div 
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {sliderLoading ? (
                <div className="w-full flex-shrink-0">
                  <div className="relative w-full h-[400px] md:h-[500px]">
                    <div className="w-full h-full bg-gradient-to-br from-pink-200 to-purple-200 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
                    </div>
                  </div>
                </div>
              ) : sliderData.slides && sliderData.slides.length > 0 ? (
                sliderData.slides.map((slide) => (
                  <div key={slide.id} className="w-full flex-shrink-0">
                    <div className="relative w-full h-[400px] md:h-[500px]">
                      <img
                        src={slide.image_url}
                        alt={`Slide ${slide.order}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2U1ZTdlYiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5YTliYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4='
                        }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="w-full flex-shrink-0">
                  <div className="relative w-full h-[400px] md:h-[500px]">
                    <div className="w-full h-full bg-gradient-to-br from-pink-200 to-purple-200 flex items-center justify-center">
                      <div className="text-8xl">🧸</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-extrabold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent hover:from-pink-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 inline-block mb-6">
              ALL PRODUCT
            </h2>

            {/* Search Results Count */}
            {debouncedSearchTerm && !loading && (
              <div className="mb-4">
                {filteredProducts.length > 0 ? (
                  <p className="text-lg text-gray-700">
                    Found <span className="font-bold text-pink-600">{filteredProducts.length}</span> product{filteredProducts.length !== 1 ? 's' : ''} for "<span className="font-semibold">{debouncedSearchTerm}</span>"
                  </p>
                ) : (
                  <p className="text-lg text-gray-600">
                    No products found for "<span className="font-semibold">{debouncedSearchTerm}</span>"
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
              <p className="mt-4 text-gray-600">Loading products...</p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="text-center py-12">
              <p className="text-red-600 mb-4">Error loading products: {error}</p>
              <button
                onClick={() => dispatch(fetchProducts({}) as any)}
                className="bg-pink-600 text-white px-6 py-2 rounded-lg hover:bg-pink-700"
              >
                Retry
              </button>
            </div>
          )}

          {/* Products Grid */}
          {!loading && !error && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {babyProducts.map((product) => (
              <div 
                key={product.id} 
                onClick={() => navigate(`/product/${encodeURIComponent(product.name.toLowerCase().replace(/\s+/g, '-'))}`)}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer group"
              >
                {/* Product Image */}
                <div className="relative overflow-hidden">
                  {product.image ? (
                    <img
                      key={`${product.id}-${product.image}`}
                      src={product.image}
                      alt={product.name}
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        // Prevent infinite loops
                        if (!target.src.includes('data:image/svg')) {
                          target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2U1ZTdlYiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5YTliYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4='
                        }
                      }}
                    />
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-pink-200 to-purple-200 flex items-center justify-center">
                      <span className="text-6xl">🧸</span>
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 group-hover:text-pink-600 transition-colors">{product.name}</h3>
                  
                  {/* Price */}
                  <div className="mb-4">
                    {product.offer_price && product.offer_price < product.price ? (
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-bold text-pink-600">৳{product.offer_price.toFixed(2)}</span>
                          <span className="text-sm text-gray-500 line-through">৳{product.price.toFixed(2)}</span>
                        </div>
                        <span className="inline-block bg-red-500 text-white px-2 py-0.5 rounded text-xs font-semibold">
                          {Math.round(((product.price - product.offer_price) / product.price) * 100)}% OFF
                        </span>
                      </div>
                    ) : (
                      <span className="text-xl font-bold text-gray-900">৳{product.price.toFixed(2)}</span>
                    )}
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation() // Prevent card click when clicking add to cart
                      handleAddToCart(product)
                    }}
                    disabled={!product.inStock}
                    className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 ${
                      product.inStock
                        ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700 transform hover:scale-105'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                  </button>
                </div>
              </div>
            ))}
            </div>
          )}
        </div>
      </div>

      {/* Service Benefits */}
      <div className="py-16 bg-gradient-to-r from-pink-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TruckIcon className="h-8 w-8 text-pink-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">বিনামূল্যে এবং পরের দিন ডেলিভারি</h3>
              <p className="text-gray-600">
                আমাদের দ্রুত এবং নির্ভরযোগ্য ডেলিভারি পরিষেবার মাধ্যমে আপনার শিশুর প্রয়োজনীয় জিনিসগুলি আপনার দরজায় পৌঁছে দিন।
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldCheckIcon className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">১০০% নিরাপত্তা গ্যারান্টি</h3>
              <p className="text-gray-600">
                আমাদের সমস্ত পণ্য পরীক্ষিত এবং শিশুদের জন্য নিরাপদ হিসেবে সার্টিফাইড। আপনার ছোট্টটির নিরাপত্তা আমাদের অগ্রাধিকার।
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TagIcon className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">চমৎকার দৈনিক অফার</h3>
              <p className="text-gray-600">
                নতুন অভিভাবকদের জন্য আমাদের দৈনিক ছাড় এবং বিশেষ অফারের মাধ্যমে শিশুর প্রয়োজনীয় জিনিসে আরও বেশি সাশ্রয় করুন।
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-purple-900 via-pink-900 to-purple-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Logo & Brand */}
            <div className="mb-4">
              <h3 className="text-2xl md:text-3xl font-extrabold mb-1 bg-gradient-to-r from-pink-300 via-purple-300 to-pink-300 bg-clip-text text-transparent hover:from-pink-400 hover:via-purple-400 hover:to-pink-400 transition-all duration-300 cursor-pointer transform hover:scale-105 inline-block">
                BRO SHOP BD
              </h3>
              <p className="text-purple-200 text-sm font-semibold">BABY & KIDS STORE</p>
            </div>

            {/* Contact Information */}
            <div className="flex flex-wrap justify-center items-center gap-3 mb-4 text-sm">
              {/* Phone */}
              <a 
                href="tel:+8801521330152" 
                className="group bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 hover:bg-white/20 transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-pink-500/50 border border-white/20 hover:border-pink-400"
              >
                <span className="mr-2">📞</span>
                <span className="text-white font-medium group-hover:text-pink-300 transition-colors">+88 01521330152</span>
              </a>

              {/* Location */}
              <a 
                href="https://maps.google.com/?q=Konapara,Demra,Dhaka" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 hover:bg-white/20 transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-purple-500/50 border border-white/20 hover:border-purple-400"
              >
                <span className="mr-2">📍</span>
                <span className="text-white font-medium group-hover:text-purple-300 transition-colors">Konapara, Demra, Dhaka</span>
              </a>

              {/* Email */}
              <a 
                href="mailto:hello@broshopbd.com" 
                className="group bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 hover:bg-white/20 transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-pink-500/50 border border-white/20 hover:border-pink-400"
              >
                <span className="mr-2">✉️</span>
                <span className="text-white font-medium group-hover:text-pink-300 transition-colors">hello@broshopbd.com</span>
              </a>

              {/* Website */}
              <a 
                href="https://www.broshopbd.xyx" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 hover:bg-white/20 transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-purple-500/50 border border-white/20 hover:border-purple-400"
              >
                <span className="mr-2">🌐</span>
                <span className="text-white font-medium group-hover:text-purple-300 transition-colors">www.broshopbd.xyx</span>
              </a>
            </div>

            {/* Copyright */}
            <div className="pt-3 border-t border-white/20">
              <p className="text-purple-200 text-xs">
                © {new Date().getFullYear()} BRO SHOP BD. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* Cart Flyout */}
      <CartFlyout isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  )
}

export default LandingPage
