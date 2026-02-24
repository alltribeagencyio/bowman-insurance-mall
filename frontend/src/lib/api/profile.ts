import { apiClient } from './client'

// NotificationPreferences matches backend NotificationPreference model exactly
export interface NotificationPreferences {
  email_policy_updates: boolean
  email_payment_reminders: boolean
  email_claim_updates: boolean
  email_marketing: boolean
  sms_policy_updates: boolean
  sms_payment_reminders: boolean
  sms_claim_updates: boolean
  whatsapp_enabled: boolean
  in_app_enabled: boolean
}

export interface PasswordChangeInput {
  old_password: string
  new_password: string
}

export interface ProfileUpdateInput {
  first_name?: string
  last_name?: string
  phone?: string
  id_number?: string
  kra_pin?: string
}

// Update user profile
export const updateUserProfile = async (data: ProfileUpdateInput) => {
  const response = await apiClient.patch('auth/profile/', data)
  return response.data
}

// Change password — backend PasswordChangeSerializer requires new_password2
export const changePassword = async (data: PasswordChangeInput) => {
  const response = await apiClient.post('auth/change-password/', {
    old_password: data.old_password,
    new_password: data.new_password,
    new_password2: data.new_password,
  })
  return response.data
}

// Get notification preferences
export const getNotificationPreferences = async (): Promise<NotificationPreferences> => {
  const response = await apiClient.get('auth/notification-preferences/')
  return response.data
}

// Update notification preferences
export const updateNotificationPreferences = async (
  preferences: Partial<NotificationPreferences>
): Promise<NotificationPreferences> => {
  const response = await apiClient.patch('auth/notification-preferences/', preferences)
  return response.data
}

// Enable 2FA — stub: backend endpoint not yet implemented
export const enable2FA = async () => {
  const response = await apiClient.post('auth/2fa/enable/')
  return response.data
}

// Disable 2FA — stub: backend endpoint not yet implemented
export const disable2FA = async () => {
  const response = await apiClient.post('auth/2fa/disable/')
  return response.data
}

// Verify 2FA code — stub: backend endpoint not yet implemented
export const verify2FA = async (code: string) => {
  const response = await apiClient.post('auth/2fa/verify/', { code })
  return response.data
}

// Request account deletion
export const requestAccountDeletion = async (reason?: string) => {
  const response = await apiClient.post('auth/delete-account/', { reason })
  return response.data
}
