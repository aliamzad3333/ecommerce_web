import { useSelector } from 'react-redux'
import { Navigate, useLocation } from 'react-router-dom'
import type { RootState } from '../../store/store'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAdmin?: boolean
}

const ProtectedRoute = ({ children, requireAdmin = false }: ProtectedRouteProps) => {
  const { isAuthenticated, currentUser } = useSelector((state: RootState) => state.user)
  const location = useLocation()

  if (!isAuthenticated) {
    // Redirect to login page with return url
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (requireAdmin && !currentUser?.isAdmin) {
    // Redirect to home if user is not admin
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

export default ProtectedRoute
