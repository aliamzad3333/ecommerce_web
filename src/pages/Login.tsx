import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'
import { loginUser } from '../store/slices/userSlice'
import { useAppDispatch } from '../hooks/redux'

const Login = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user starts typing
    if (error) setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const result = await dispatch(loginUser({
        email: formData.email,
        password: formData.password
      })).unwrap()

      // Redirect based on user role
      if (result.isAdmin) {
        navigate('/admin/dashboard', { replace: true })
      } else {
        // For regular users, go to landing page
        navigate('/', { replace: true })
      }
    } catch (error: any) {
      // Set simple error message
      const errorMessage = error?.message || 'Invalid username and password'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Login Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Bro Shop BD Link */}
          <div className="text-center mb-6">
            <Link 
              to="/" 
              className="text-4xl font-bold text-gray-900 hover:text-pink-600 transition-colors inline-block cursor-pointer"
            >
              Bro Shop BD
            </Link>
          </div>
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-2">
                Email Address
              </label>
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-purple-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors"
                  placeholder="Enter your email"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <div className="w-6 h-6 bg-pink-100 rounded-full flex items-center justify-center">
                    <span className="text-pink-600 text-sm">👆</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-900 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-purple-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors"
                  placeholder="Enter your password"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Remember Me and Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-600">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-gray-600 hover:text-pink-600">
                  Forgot password?
                </a>
              </div>
            </div>

            {/* Login Button */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gray-900 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  'Login'
                )}
              </button>
            </div>

            {/* Create Account Button */}
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-3">
                Don't have an account?
              </p>
              <button
                type="button"
                onClick={() => navigate('/register')}
                className="w-full bg-pink-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 transition-colors"
              >
                Create an Account
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Login
