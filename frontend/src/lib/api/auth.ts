import { apiClient } from './client'

export interface User {
  id: string
  email: string
  first_name: string
  last_name: string
  phone: string
  role: 'customer' | 'staff' | 'admin'
  is_active: boolean
  created_at: string
}

export interface RegisterInput {
  email: string
  password: string
  password2: string
  first_name: string
  last_name: string
  phone: string
}

export interface LoginInput {
  email: string
  password: string
}

export interface AuthResponse {
  user: User
  tokens: {
    access: string
    refresh: string
  }
}

export interface PasswordResetRequest {
  email: string
}

export interface PasswordResetConfirm {
  uid: string
  token: string
  new_password: string
}

// Register new user
export const register = async (data: RegisterInput): Promise<AuthResponse> => {
  const response = await apiClient.post('/auth/register/', data)

  // Store tokens
  if (response.data.tokens) {
    localStorage.setItem('access_token', response.data.tokens.access)
    localStorage.setItem('refresh_token', response.data.tokens.refresh)
  }

  return response.data
}

// Login user
export const login = async (data: LoginInput): Promise<AuthResponse> => {
  const response = await apiClient.post('/auth/login/', data)

  // Store tokens
  if (response.data.tokens) {
    localStorage.setItem('access_token', response.data.tokens.access)
    localStorage.setItem('refresh_token', response.data.tokens.refresh)
  }

  return response.data
}

// Logout user
export const logout = async (): Promise<void> => {
  try {
    await apiClient.post('/auth/logout/')
  } catch (error) {
    console.error('Logout error:', error)
  } finally {
    // Clear tokens regardless of API response
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
  }
}

// Get current user profile
export const getProfile = async (): Promise<User> => {
  const response = await apiClient.get('/auth/profile/')
  return response.data
}

// Verify token
export const verifyToken = async (): Promise<{ valid: boolean }> => {
  try {
    const response = await apiClient.get('/auth/verify/')
    return response.data
  } catch (error) {
    return { valid: false }
  }
}

// Request password reset
export const requestPasswordReset = async (data: PasswordResetRequest): Promise<{ message: string; uid?: string; token?: string }> => {
  const response = await apiClient.post('/auth/password-reset/request/', data)
  return response.data
}

// Confirm password reset
export const confirmPasswordReset = async (data: PasswordResetConfirm): Promise<{ message: string }> => {
  const response = await apiClient.post('/auth/password-reset/confirm/', data)
  return response.data
}

// Refresh access token
export const refreshAccessToken = async (): Promise<{ access: string }> => {
  const refresh_token = localStorage.getItem('refresh_token')

  if (!refresh_token) {
    throw new Error('No refresh token available')
  }

  const response = await apiClient.post('/auth/token/refresh/', {
    refresh: refresh_token
  })

  // Update access token
  if (response.data.access) {
    localStorage.setItem('access_token', response.data.access)
  }

  return response.data
}

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('access_token')
}

// Get stored access token
export const getAccessToken = (): string | null => {
  return localStorage.getItem('access_token')
}

// Get stored refresh token
export const getRefreshToken = (): string | null => {
  return localStorage.getItem('refresh_token')
}
