'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api/client'
import type { User } from '@/types'

interface AuthTokens {
  access: string
  refresh: string
}

interface AuthContextType {
  user: User | null
  tokens: AuthTokens | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => Promise<void>
  updateProfile: (data: Partial<User>) => Promise<void>
  refreshToken: () => Promise<void>
}

interface RegisterData {
  email: string
  password: string
  password2: string
  first_name: string
  last_name: string
  phone: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [tokens, setTokens] = useState<AuthTokens | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedTokens = localStorage.getItem('auth_tokens')
        const storedUser = localStorage.getItem('user')

        if (storedTokens && storedUser) {
          const parsedTokens = JSON.parse(storedTokens)
          const parsedUser = JSON.parse(storedUser)

          setTokens(parsedTokens)
          setUser(parsedUser)

          // Verify token is still valid
          try {
            const response = await apiClient.get('/auth/verify/')
            setUser(response.data.user)
          } catch (error) {
            // Token invalid, clear auth
            localStorage.removeItem('auth_tokens')
            localStorage.removeItem('user')
            setTokens(null)
            setUser(null)
          }
        }
      } catch (error) {
        console.error('Failed to load user:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadUser()
  }, [])

  // Save tokens to localStorage whenever they change
  useEffect(() => {
    if (tokens) {
      localStorage.setItem('auth_tokens', JSON.stringify(tokens))
    } else {
      localStorage.removeItem('auth_tokens')
    }
  }, [tokens])

  // Save user to localStorage whenever they change
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user))
    } else {
      localStorage.removeItem('user')
    }
  }, [user])

  const login = useCallback(async (email: string, password: string) => {
    try {
      // Test users for demo (remove when backend is connected)
      const TEST_USERS: Record<string, { user: User, tokens: AuthTokens }> = {
        'admin@bowman.co.ke': {
          user: {
            id: '1',
            email: 'admin@bowman.co.ke',
            first_name: 'Admin',
            last_name: 'User',
            phone: '+254700000000',
            is_staff: true,
            is_verified: true,
            role: 'admin',
            created_at: new Date().toISOString(),
          },
          tokens: {
            access: 'test_admin_access_token',
            refresh: 'test_admin_refresh_token',
          },
        },
        'customer@test.com': {
          user: {
            id: '2',
            email: 'customer@test.com',
            first_name: 'John',
            last_name: 'Doe',
            phone: '+254711111111',
            is_staff: false,
            is_verified: true,
            role: 'customer',
            created_at: new Date().toISOString(),
          },
          tokens: {
            access: 'test_customer_access_token',
            refresh: 'test_customer_refresh_token',
          },
        },
      }

      // Check test users first
      if (TEST_USERS[email] && (password === 'Admin123!' || password === 'Customer123!')) {
        const testData = TEST_USERS[email]
        setUser(testData.user)
        setTokens(testData.tokens)

        // Redirect based on role
        if (testData.user.is_staff || testData.user.role === 'admin') {
          router.push('/admin')
        } else {
          router.push('/dashboard')
        }
        return
      }

      // If not a test user, try real API
      const response = await apiClient.post('/auth/login/', {
        email,
        password,
      })

      const { user: userData, tokens: tokenData } = response.data

      setUser(userData)
      setTokens(tokenData)

      // Redirect based on user role
      if (userData.is_staff || userData.role === 'admin') {
        router.push('/admin')
      } else {
        router.push('/dashboard')
      }
    } catch (error: any) {
      console.error('Login failed:', error)
      throw new Error(error.response?.data?.message || 'Invalid email or password')
    }
  }, [router])

  const register = useCallback(async (data: RegisterData) => {
    try {
      const response = await apiClient.post('/auth/register/', data)

      const { user: userData, tokens: tokenData } = response.data

      setUser(userData)
      setTokens(tokenData)

      router.push('/dashboard')
    } catch (error: any) {
      console.error('Registration failed:', error)
      throw new Error(error.response?.data?.message || 'Registration failed')
    }
  }, [router])

  const logout = useCallback(async () => {
    try {
      if (tokens?.refresh) {
        await apiClient.post('/auth/logout/', {
          refresh_token: tokens.refresh,
        })
      }
    } catch (error) {
      console.error('Logout failed:', error)
    } finally {
      setUser(null)
      setTokens(null)
      localStorage.removeItem('auth_tokens')
      localStorage.removeItem('user')
      router.push('/')
    }
  }, [tokens, router])

  const updateProfile = useCallback(async (data: Partial<User>) => {
    try {
      const response = await apiClient.patch('/auth/profile/', data)
      setUser(response.data)
    } catch (error: any) {
      console.error('Profile update failed:', error)
      throw new Error(error.response?.data?.message || 'Profile update failed')
    }
  }, [])

  const refreshToken = useCallback(async () => {
    try {
      if (!tokens?.refresh) {
        throw new Error('No refresh token available')
      }

      const response = await apiClient.post('/auth/token/refresh/', {
        refresh: tokens.refresh,
      })

      const newTokens = {
        access: response.data.access,
        refresh: tokens.refresh,
      }

      setTokens(newTokens)
    } catch (error) {
      console.error('Token refresh failed:', error)
      // If refresh fails, logout user
      await logout()
      throw error
    }
  }, [tokens, logout])

  const value: AuthContextType = {
    user,
    tokens,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateProfile,
    refreshToken,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
