// Environment configuration
export interface EnvironmentConfig {
  API_BASE_URL: string
  IS_DEVELOPMENT: boolean
  IS_PRODUCTION: boolean
  HOSTNAME: string
}

const getEnvironmentConfig = (): EnvironmentConfig => {
  const hostname = window.location.hostname
  const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1'
  const isProduction = hostname === '130.94.40.85'
  
  return {
    API_BASE_URL: isLocalhost 
      ? 'http://localhost:8080/api' 
      : 'http://130.94.40.85/api',  // Use same domain, Nginx will proxy to Go backend
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
