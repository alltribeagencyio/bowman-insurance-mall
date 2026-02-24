import { apiClient } from './client'

export interface NotificationPreferences {
  email_enabled: boolean
  sms_enabled: boolean
  push_enabled: boolean
  policy_updates: boolean
  payment_reminders: boolean
  claim_updates: boolean
  renewal_reminders: boolean
  marketing: boolean
}

export interface PasswordChangeInput {
  old_password: string
  new_password: string
}

export interface ProfileUpdateInput {
  first_name?: string
  last_name?: string
  phone?: string
}

// Update user profile
export const updateUserProfile = async (data: ProfileUpdateInput) => {
  const response = await apiClient.patch('/users/profile/', data)
  return response.data
}

// Change password
export const changePassword = async (data: PasswordChangeInput) => {
  const response = await apiClient.post('/users/change-password/', data)
  return response.data
}

// Get notification preferences
export const getNotificationPreferences = async (): Promise<NotificationPreferences> => {
  const response = await apiClient.get('/users/notification-preferences/')
  return response.data
}

// Update notification preferences
export const updateNotificationPreferences = async (
  preferences: Partial<NotificationPreferences>
): Promise<NotificationPreferences> => {
  const response = await apiClient.patch('/users/notification-preferences/', preferences)
  return response.data
}

// Enable 2FA
export const enable2FA = async () => {
  const response = await apiClient.post('/users/2fa/enable/')
  return response.data
}

// Disable 2FA
export const disable2FA = async () => {
  const response = await apiClient.post('/users/2fa/disable/')
  return response.data
}

// Verify 2FA code
export const verify2FA = async (code: string) => {
  const response = await apiClient.post('/users/2fa/verify/', { code })
  return response.data
}

// Request account deletion
export const requestAccountDeletion = async (reason?: string) => {
  const response = await apiClient.post('/users/delete-account/', { reason })
  return response.data
}
