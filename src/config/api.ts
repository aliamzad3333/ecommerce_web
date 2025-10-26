// Environment configuration for API endpoints
const getApiBaseUrl = () => {
  // Check if we're running locally (development)
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:8080/api'
  }
  
  // Check if we're running on the server (production)
  if (window.location.hostname === '130.94.40.85') {
    return 'http://130.94.40.85:8080/api'
  }
  
  // Fallback for other environments
  return 'http://130.94.40.85:8080/api'
}

export const API_BASE_URL = getApiBaseUrl()

// Log the API URL for debugging
console.log('🌐 API Base URL:', API_BASE_URL)
console.log('🏠 Hostname:', window.location.hostname)
