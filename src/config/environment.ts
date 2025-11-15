// Environment configuration
export interface EnvironmentConfig {
  API_BASE_URL: string
  IS_DEVELOPMENT: boolean
  IS_PRODUCTION: boolean
  HOSTNAME: string
}

const getEnvironmentConfig = (): EnvironmentConfig => {
  const hostname = window.location.hostname
  const protocol = window.location.protocol
  const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1'
  const isProduction = hostname === '130.94.40.85'
  
  // Use full URL on server, relative URL locally (for dev server proxy)
  // For production, use the same protocol as the frontend to avoid mixed content issues
  const apiBaseURL = isLocalhost 
    ? '/api'  // Relative URL for local dev (vite proxy)
    : `${protocol}//${hostname}:8080/api`  // Full URL for production server with same protocol
  
  return {
    API_BASE_URL: apiBaseURL,
    IS_DEVELOPMENT: isLocalhost,
    IS_PRODUCTION: isProduction,
    HOSTNAME: hostname
  }
}

export const ENV = getEnvironmentConfig()

// Log environment info for debugging
console.log('🌍 Environment Config:', ENV)
console.log('🔧 Development Mode:', ENV.IS_DEVELOPMENT)
console.log('🚀 Production Mode:', ENV.IS_PRODUCTION)
