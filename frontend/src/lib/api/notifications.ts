import { apiClient } from './client'

export interface Notification {
  id: string
  type: 'policy_update' | 'payment_reminder' | 'claim_update' | 'renewal_reminder' | 'document_verified' | 'general'
  title: string
  message: string
  read: boolean
  created_at: string
  related_object?: {
    type: 'policy' | 'claim' | 'payment'
    id: string
  }
  action_url?: string
}

export interface NotificationCount {
  count: number
}

export interface NotificationFilters {
  type?: string
  read?: boolean
  limit?: number
  offset?: number
}

// Get all notifications
export const getNotifications = async (filters?: NotificationFilters): Promise<Notification[]> => {
  const response = await apiClient.get('/notifications/', {
    params: filters
  })
  return response.data
}

// Get unread notifications only
export const getUnreadNotifications = async (): Promise<Notification[]> => {
  const response = await apiClient.get('/notifications/unread/')
  return response.data
}

// Get unread notification count
export const getUnreadCount = async (): Promise<number> => {
  const response = await apiClient.get('/notifications/unread_count/')
  return response.data.count
}

// Mark notification as read
export const markAsRead = async (id: string): Promise<void> => {
  await apiClient.post(`/notifications/${id}/mark_as_read/`)
}

// Mark all notifications as read
export const markAllAsRead = async (): Promise<void> => {
  await apiClient.post('/notifications/mark_all_read/')
}

// Delete notification
export const deleteNotification = async (id: string): Promise<void> => {
  await apiClient.delete(`/notifications/${id}/`)
}

// Poll for new notifications (helper function for real-time updates)
export const pollNotifications = async (
  callback: (count: number) => void,
  interval: number = 30000 // 30 seconds
): (() => void) => {
  let isActive = true

  const poll = async () => {
    if (!isActive) return

    try {
      const count = await getUnreadCount()
      callback(count)
    } catch (error) {
      console.error('Error polling notifications:', error)
    }

    if (isActive) {
      setTimeout(poll, interval)
    }
  }

  // Start polling
  poll()

  // Return cleanup function
  return () => {
    isActive = false
  }
}
