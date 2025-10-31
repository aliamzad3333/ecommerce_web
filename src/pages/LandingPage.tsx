import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import type { RootState } from '../store/store'
import { logout } from '../store/slices/userSlice'
import { fetchProducts } from '../store/slices/productSlice'
import { 
  ShoppingCartIcon, 
  MagnifyingGlassIcon,
  TruckIcon,
  ShieldCheckIcon,
  TagIcon,
  HeartIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon, StarIcon as StarSolidIcon } from '@heroicons/react/24/solid'
import { UserIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline'

const LandingPage = () => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [likedItems, setLikedItems] = useState<Set<string>>(new Set())
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { currentUser, isAuthenticated } = useSelector((state: RootState) => state.user)
  const { products, loading, error } = useSelector((state: RootState) => state.products)

  useEffect(() => {
    dispatch(fetchProducts() as any)
  }, [dispatch])

  const handleLogout = () => {
    dispatch(logout())
    navigate('/')
  }

  const toggleLike = (itemId: string) => {
    const newLikedItems = new Set(likedItems)
    if (newLikedItems.has(itemId)) {
      newLikedItems.delete(itemId)
    } else {
      newLikedItems.add(itemId)
    }
    setLikedItems(newLikedItems)
  }

  const babyProducts = products.length > 0 ? products : []

  const nextSlide = () => {
    if (babyProducts.length === 0) return
    setCurrentSlide((prev) => (prev + 1) % babyProducts.length)
  }

  const prevSlide = () => {
    if (babyProducts.length === 0) return
    setCurrentSlide((prev) => (prev - 1 + babyProducts.length) % babyProducts.length)
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <StarSolidIcon
        key={i}
        className={`h-4 w-4 ${i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}`}
      />
    ))
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
                <span className="text-2xl">👶</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold">BABYSHOP</h1>
                <p className="text-sm text-pink-100">BABY & KIDS STORE</p>
              </div>
            </div>

            {/* Search */}
            <div className="flex-1 max-w-md mx-8">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search baby products..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg text-gray-900 focus:ring-2 focus:ring-white focus:outline-none"
                />
                <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            {/* Cart and User */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <ShoppingCartIcon className="h-8 w-8" />
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    0
                  </span>
                </div>
                <span className="text-sm">My Cart</span>
              </div>

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

      {/* Navigation */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8 py-4">
            <Link to="/" className="text-pink-600 font-semibold border-b-2 border-pink-600 pb-1">
              Home
            </Link>
            <Link to="/about" className="text-gray-700 hover:text-pink-600 transition-colors">
              About Us
            </Link>
            <Link to="/products" className="text-gray-700 hover:text-pink-600 transition-colors">
              Baby Products
            </Link>
            <Link to="/shop" className="text-gray-700 hover:text-pink-600 transition-colors">
              Shop
            </Link>
            <Link to="/blog" className="text-gray-700 hover:text-pink-600 transition-colors">
              Blog
            </Link>
            <Link to="/faq" className="text-gray-700 hover:text-pink-600 transition-colors">
              FAQ
            </Link>
            <Link to="/contact" className="text-gray-700 hover:text-pink-600 transition-colors">
              Contact
            </Link>
          </nav>
        </div>
      </div>

      {/* Hero Slider */}
      <div className="relative bg-gradient-to-r from-pink-100 to-purple-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative">
            <div className="overflow-hidden rounded-2xl">
              <div 
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {babyProducts.length > 0 ? babyProducts.map((product) => (
                  <div key={product.id} className="w-full flex-shrink-0">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[400px]">
                      <div className="space-y-6 p-8">
                        <div className="space-y-2">
                          <span className="text-4xl font-bold text-pink-600">100%</span>
                          <span className="text-5xl font-bold text-purple-600">Safe</span>
                        </div>
                        <div className="space-y-2">
                          <p className="text-2xl font-semibold text-green-600">Quality & Care</p>
                          <p className="text-xl text-green-600">Guaranteed! Happy Baby.</p>
                        </div>
                        <p className="text-gray-600 text-lg">
                          Discover the finest collection of baby products, carefully selected for your little one's comfort and safety.
                        </p>
                        <Link
                          to="/shop"
                          className="inline-block bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-pink-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
                        >
                          SHOP NOW
                        </Link>
                      </div>
                      <div className="relative">
                        <div className="w-full h-96 bg-gradient-to-br from-pink-200 to-purple-200 rounded-2xl flex items-center justify-center">
                          <div className="text-8xl">🧸</div>
                        </div>
                        {/* Decorative elements */}
                        <div className="absolute -top-4 -left-4 w-8 h-8 bg-yellow-300 rounded-full"></div>
                        <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-pink-300 rounded-full"></div>
                        <div className="absolute top-1/2 -right-8 w-6 h-6 bg-purple-300 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="w-full flex-shrink-0">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[400px]">
                      <div className="space-y-6 p-8">
                        <div className="space-y-2">
                          <span className="text-4xl font-bold text-pink-600">100%</span>
                          <span className="text-5xl font-bold text-purple-600">Safe</span>
                        </div>
                        <div className="space-y-2">
                          <p className="text-2xl font-semibold text-green-600">Quality & Care</p>
                          <p className="text-xl text-green-600">Guaranteed! Happy Baby.</p>
                        </div>
                        <p className="text-gray-600 text-lg">
                          Discover the finest collection of baby products, carefully selected for your little one's comfort and safety.
                        </p>
                        <Link
                          to="/shop"
                          className="inline-block bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-pink-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
                        >
                          SHOP NOW
                        </Link>
                      </div>
                      <div className="relative">
                        <div className="w-full h-96 bg-gradient-to-br from-pink-200 to-purple-200 rounded-2xl flex items-center justify-center">
                          <div className="text-8xl">🧸</div>
                        </div>
                        <div className="absolute -top-4 -left-4 w-8 h-8 bg-yellow-300 rounded-full"></div>
                        <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-pink-300 rounded-full"></div>
                        <div className="absolute top-1/2 -right-8 w-6 h-6 bg-purple-300 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Navigation Arrows */}
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <ChevronLeftIcon className="h-6 w-6 text-gray-600" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <ChevronRightIcon className="h-6 w-6 text-gray-600" />
            </button>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center mt-6 space-x-2">
            {babyProducts.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-200 ${
                  index === currentSlide ? 'bg-pink-500' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Baby Products</h2>
            <p className="text-gray-600 text-lg">Carefully selected items for your little one</p>
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
                onClick={() => dispatch(fetchProducts() as any)}
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
              <div key={product.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300">
                {/* Product Image */}
                <div className="relative">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2U1ZTdlYiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5YTliYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4='
                      }}
                    />
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-pink-200 to-purple-200 flex items-center justify-center">
                      <span className="text-6xl">🧸</span>
                    </div>
                  )}
                  <button
                    onClick={() => toggleLike(product.id)}
                    className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    {likedItems.has(product.id) ? (
                      <HeartSolidIcon className="h-5 w-5 text-red-500" />
                    ) : (
                      <HeartIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                  <div className={`absolute top-2 right-12 w-3 h-3 rounded-full ${
                    product.inStock ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                </div>

                {/* Product Info */}
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{product.name}</h3>
                  <div className="flex items-center space-x-1 mb-3">
                    {renderStars(product.rating || 0)}
                    <span className="text-sm text-gray-600">({product.reviews || 0})</span>
                  </div>
                  
                  {/* Price */}
                  <div className="mb-4">
                    <span className="text-xl font-bold text-gray-900">${product.price}</span>
                  </div>

                  {/* Add to Cart Button */}
                  <button
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
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Free & Next Day Delivery</h3>
              <p className="text-gray-600">
                Get your baby essentials delivered to your doorstep with our fast and reliable delivery service.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldCheckIcon className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">100% Safety Guarantee</h3>
              <p className="text-gray-600">
                All our products are tested and certified safe for babies. Your little one's safety is our priority.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TagIcon className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Great Daily Deals</h3>
              <p className="text-gray-600">
                Save more on baby essentials with our daily discounts and special offers for new parents.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            {/* Logo & Contact */}
            <div className="md:col-span-1">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">👶</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">BABYSHOP</h3>
                  <p className="text-sm text-gray-500">BABY & KIDS STORE</p>
                </div>
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <p>📞 +1 (555) 123-4567</p>
                <p>📍 123 Baby Street, Kids City</p>
                <p>✉️ hello@babyshop.com</p>
                <p>🌐 www.babyshop.com</p>
              </div>
            </div>

            {/* Top Cities */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">TOP CITIES</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>New York</li>
                <li>Los Angeles</li>
                <li>Chicago</li>
                <li>Houston</li>
                <li>Phoenix</li>
              </ul>
            </div>

            {/* Categories */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">CATEGORIES</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>Baby Feeding</li>
                <li>Baby Clothing</li>
                <li>Baby Toys</li>
                <li>Baby Care</li>
                <li>Nursery Items</li>
              </ul>
            </div>

            {/* About Us */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">ABOUT US</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>Company Information</li>
                <li>Careers</li>
                <li>Store Locations</li>
                <li>Affiliate Program</li>
                <li>Copyright</li>
              </ul>
            </div>

            {/* Download App */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">DOWNLOAD APP</h4>
              <div className="space-y-3">
                <div className="bg-gray-100 p-3 rounded-lg text-center">
                  <p className="text-sm font-semibold text-gray-900">ANDROID APP</p>
                  <p className="text-xs text-gray-600">on Google Play</p>
                </div>
                <div className="bg-gray-100 p-3 rounded-lg text-center">
                  <p className="text-sm font-semibold text-gray-900">Download on the</p>
                  <p className="text-xs text-gray-600">App Store</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
