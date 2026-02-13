import { apiClient } from './client'

export interface DashboardStats {
  policies: {
    total: number
    active: number
    expiringSoon: number
    expired: number
  }
  payments: {
    pendingAmount: number
    pendingCount: number
    overdueAmount: number
    overdueCount: number
    nextPaymentDate: string | null
    nextPaymentAmount: number | null
  }
  claims: {
    total: number
    pending: number
    approved: number
    rejected: number
  }
}

export interface ActivityEvent {
  id: string
  type: 'payment' | 'policy' | 'claim'
  title: string
  description: string
  timestamp: string
  icon?: string
  iconColor?: string
  bgColor?: string
}

export interface Recommendation {
  id: string
  priority: 'high' | 'medium' | 'low'
  title: string
  description: string
  action: string
  link: string
}

export interface UpcomingPayment {
  id: string
  policy: {
    id: string
    policy_number: string
    policy_type: string
  }
  amount: number
  due_date: string
  is_overdue: boolean
}

export interface ExpiringPolicy {
  id: string
  policy_number: string
  policy_type: string
  end_date: string
  days_remaining: number
}

export interface DashboardData {
  stats: DashboardStats
  recentActivity: ActivityEvent[]
  recommendations: Recommendation[]
  upcomingPayments: UpcomingPayment[]
  expiringPolicies: ExpiringPolicy[]
}

// Simple cache for dashboard data
let dashboardCache: { data: DashboardData; timestamp: number } | null = null
const CACHE_DURATION = 60000 // 1 minute

// Get dashboard overview data
export const getDashboardData = async (forceRefresh = false): Promise<DashboardData> => {
  // Check cache first
  if (!forceRefresh && dashboardCache) {
    const now = Date.now()
    if (now - dashboardCache.timestamp < CACHE_DURATION) {
      return dashboardCache.data
    }
  }

  const response = await apiClient.get('dashboard/')
  const data = response.data

  // Update cache
  dashboardCache = {
    data,
    timestamp: Date.now()
  }

  return data
}

// Clear dashboard cache
export const clearDashboardCache = () => {
  dashboardCache = null
}

// Get dashboard statistics
export const getDashboardStats = async (): Promise<DashboardStats> => {
  const response = await apiClient.get('dashboard/stats/')
  return response.data
}

// Get recent activity
export const getRecentActivity = async (limit: number = 10): Promise<ActivityEvent[]> => {
  const response = await apiClient.get('dashboard/activity/', {
    params: { limit },
  })
  return response.data
}

// Get recommendations
export const getRecommendations = async (): Promise<Recommendation[]> => {
  const response = await apiClient.get('dashboard/recommendations/')
  return response.data
}

// Get upcoming payments
export const getUpcomingPayments = async (limit: number = 5): Promise<UpcomingPayment[]> => {
  const response = await apiClient.get('dashboard/upcoming-payments/', {
    params: { limit },
  })
  return response.data
}

// Get expiring policies
export const getExpiringPolicies = async (days: number = 30): Promise<ExpiringPolicy[]> => {
  const response = await apiClient.get('dashboard/expiring-policies/', {
    params: { days },
  })
  return response.data
}
