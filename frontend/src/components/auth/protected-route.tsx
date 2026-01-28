'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/auth-context'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAuth?: boolean
  requireAdmin?: boolean
  redirectTo?: string
}

export function ProtectedRoute({
  children,
  requireAuth = true,
  requireAdmin = false,
  redirectTo = '/login'
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      // Check authentication
      if (requireAuth && !isAuthenticated) {
        router.push(redirectTo)
        return
      }

      // Check admin role
      if (requireAdmin && isAuthenticated) {
        const isAdmin = user?.role === 'admin' || user?.role === 'staff' || user?.is_staff
        if (!isAdmin) {
          router.push('/dashboard') // Redirect non-admin users to dashboard
        }
      }
    }
  }, [isAuthenticated, isLoading, requireAuth, requireAdmin, user, redirectTo, router])

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  // If require auth and not authenticated, show nothing (redirect will happen)
  if (requireAuth && !isAuthenticated) {
    return null
  }

  // If require admin and not admin, show nothing (redirect will happen)
  if (requireAdmin && isAuthenticated) {
    const isAdmin = user?.role === 'admin' || user?.role === 'staff' || user?.is_staff
    if (!isAdmin) {
      return null
    }
  }

  return <>{children}</>
}
