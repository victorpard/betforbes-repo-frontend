import React, { useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

interface PrivateRouteProps {
  isAdminRoute?: boolean
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ isAdminRoute = false }) => {
  const { user, isLoading, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  // 👉 Só aqui, depois de extrair do hook
  console.log('🔒 [PrivateRoute]', { user, isLoading, isAuthenticated })

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated || !user) {
        localStorage.removeItem('betforbes_auth')
        localStorage.removeItem('betforbes_token')
        sessionStorage.clear()
        navigate('/login', { replace: true })
      } else if (isAdminRoute && !user.isAdmin) {
        navigate('/dashboard', { replace: true })
      }
    }
  }, [isLoading, isAuthenticated, user, isAdminRoute, navigate])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#1e1e1e]">
        <div className="text-white">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FFD700] mx-auto mb-4"></div>
          <p>Verificando autenticação...</p>
        </div>
      </div>
    )
  }

  return <Outlet />
}

export default PrivateRoute
