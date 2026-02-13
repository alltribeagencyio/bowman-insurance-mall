'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth/auth-context'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import {
  FileText,
  CreditCard,
  Shield,
  AlertCircle,
  Settings,
  User,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  DollarSign,
  Calendar,
  ArrowRight,
  Bell,
  FileCheck,
  Activity,
  Zap,
  Wallet,
  Award,
  Star,
  Loader2
} from 'lucide-react'
import { toast } from 'sonner'
import { getDashboardData } from '@/lib/api/dashboard'

interface DashboardData {
  stats: {
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
  recentActivity: Array<{
    id: string
    type: string
    title: string
    description: string
    timestamp: string
    icon?: string
    iconColor?: string
    bgColor?: string
  }>
  recommendations: Array<{
    id: string
    priority: string
    title: string
    description: string
    action: string
    link: string
  }>
  upcomingPayments: Array<{
    id: string
    policy: {
      id: string
      policy_number: string
      policy_type: string
    }
    amount: number
    due_date: string
    is_overdue: boolean
  }>
  expiringPolicies: Array<{
    id: string
    policy_number: string
    policy_type: string
    end_date: string
    days_remaining: number
  }>
}

// Helper function to map icon strings to components
const getIconComponent = (iconName?: string) => {
  const iconMap: Record<string, any> = {
    DollarSign,
    Shield,
    CheckCircle2,
    FileText,
    FileCheck,
    Bell,
    Calendar,
    Activity,
    CreditCard,
    AlertCircle,
  }
  return iconMap[iconName || 'Activity'] || Activity
}

// Mock data for fallback - will use real API
const mockDashboardData = {
  policies: {
    total: 3,
    active: 2,
    expiringSoon: 0,
    expired: 1
  },
  payments: {
    pendingAmount: 20000,
    pendingCount: 2,
    overdueAmount: 0,
    overdueCount: 0,
    nextPaymentDate: '2026-02-01',
    nextPaymentAmount: 5000
  },
  claims: {
    total: 1,
    pending: 0,
    approved: 1,
    rejected: 0
  },
  wallet: {
    balance: 45000,
    pendingWithdrawals: 0
  },
  loyalty: {
    points: 2450,
    tier: 'Gold',
    pointsValue: 2450
  },
  recentActivity: [
    {
      id: '1',
      type: 'payment',
      title: 'Payment Received',
      description: 'Premium payment of KES 15,000 for Motor Insurance',
      timestamp: '2026-01-15T10:30:00Z',
      icon: 'DollarSign',
      iconColor: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900'
    },
    {
      id: '2',
      type: 'claim',
      title: 'Claim Approved',
      description: 'Your claim for KES 450,000 has been approved',
      timestamp: '2026-01-10T14:20:00Z',
      icon: 'CheckCircle2',
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900'
    },
    {
      id: '3',
      type: 'policy',
      title: 'Policy Activated',
      description: 'Medical Insurance Plus is now active',
      timestamp: '2026-01-15T09:00:00Z',
      icon: 'Shield',
      iconColor: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900'
    },
    {
      id: '4',
      type: 'document',
      title: 'Document Uploaded',
      description: 'Insurance Certificate added to your documents',
      timestamp: '2026-01-15T10:35:00Z',
      icon: 'FileCheck',
      iconColor: 'text-amber-600',
      bgColor: 'bg-amber-100 dark:bg-amber-900'
    }
  ],
  recommendations: [
    {
      id: '1',
      title: 'Complete Your Medical Insurance',
      description: 'Add dependents to maximize your medical coverage',
      action: 'Add Dependents',
      link: '/dashboard/profile?tab=dependents',
      priority: 'high'
    },
    {
      id: '2',
      title: 'Add Beneficiaries',
      description: 'Protect your loved ones by adding beneficiaries to your policies',
      action: 'Add Now',
      link: '/dashboard/profile?tab=beneficiaries',
      priority: 'medium'
    },
    {
      id: '3',
      title: 'Enable Auto-Pay',
      description: 'Never miss a payment deadline with automatic payments',
      action: 'Enable',
      link: '/dashboard/pending-payments',
      priority: 'medium'
    }
  ],
  upcomingPayments: [
    {
      id: '1',
      policyName: 'Comprehensive Motor Insurance',
      amount: 5000,
      dueDate: '2026-02-01',
      daysUntil: 5
    },
    {
      id: '2',
      policyName: 'Medical Insurance Plus',
      amount: 25000,
      dueDate: '2026-02-15',
      daysUntil: 19
    }
  ],
  expiringPolicies: []
}

function DashboardContent() {
  const { user } = useAuth()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Fetch dashboard data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const data = await getDashboardData()
        setDashboardData(data)
      } catch (error: any) {
        console.error('Error fetching dashboard data:', error)

        // Only show error toast for non-401 errors
        if (error.response?.status !== 401) {
          toast.error('Failed to load dashboard data')
        }

        // Use mock data as fallback
        setDashboardData({
          stats: mockDashboardData,
          recentActivity: mockDashboardData.recentActivity,
          recommendations: mockDashboardData.recommendations,
          upcomingPayments: mockDashboardData.upcomingPayments.map(p => ({
            id: p.id,
            policy: {
              id: p.id,
              policy_number: `POL-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
              policy_type: p.policyName
            },
            amount: p.amount,
            due_date: p.dueDate,
            is_overdue: p.daysUntil < 0
          })),
          expiringPolicies: mockDashboardData.expiringPolicies
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  // Get data from dashboard or use mock
  const stats = dashboardData?.stats || {
    policies: mockDashboardData.policies,
    payments: mockDashboardData.payments,
    claims: mockDashboardData.claims
  }

  const recentActivity = dashboardData?.recentActivity || mockDashboardData.recentActivity
  const recommendations = dashboardData?.recommendations || mockDashboardData.recommendations
  const upcomingPayments = dashboardData?.upcomingPayments || []

  const getTimeAgo = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffMs = now.getTime() - time.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 mx-auto mb-4 text-primary animate-spin" />
          <h3 className="text-xl font-semibold mb-2">Loading Dashboard...</h3>
          <p className="text-muted-foreground">
            Please wait while we fetch your data
          </p>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Welcome Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {user?.first_name}!
        </h1>
        <p className="text-muted-foreground">
          Here's what's happening with your insurance
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Policies
            </CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.policies.active}</div>
            <p className="text-xs text-muted-foreground">
              {stats.policies.total} total policies
            </p>
          </CardContent>
        </Card>

        <Link href="/dashboard/wallet">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Wallet Balance
              </CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">KES {(0).toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Coming soon
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/profile?tab=loyalty">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Loyalty Points
              </CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{(0).toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Coming soon
              </p>
            </CardContent>
          </Card>
        </Link>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Payments
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KES {stats.payments.pendingAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {stats.payments.pendingCount} payment{stats.payments.pendingCount !== 1 ? 's' : ''} due
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Claims
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.claims.pending}</div>
            <p className="text-xs text-muted-foreground">
              {stats.claims.total} total claim{stats.claims.total !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Account Status
            </CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Active</div>
            <p className="text-xs text-muted-foreground">
              {user?.is_verified ? 'Verified' : 'Pending verification'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
              <Link href="/policies">
                <Shield className="h-6 w-6" />
                <span>Browse Policies</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
              <Link href="/claims/new">
                <FileText className="h-6 w-6" />
                <span>File Claim</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
              <Link href="/dashboard/documents">
                <FileCheck className="h-6 w-6" />
                <span>My Documents</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Alerts Section */}
          {(stats.payments.overdueCount > 0 || stats.policies.expiringSoon > 0 || !user?.is_verified) && (
            <div className="space-y-4">
              {stats.payments.overdueCount > 0 && (
                <Card className="border-red-200 bg-red-50 dark:bg-red-950">
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <AlertCircle className="h-6 w-6 text-red-600 mt-1" />
                      <div className="flex-1">
                        <CardTitle className="text-red-900 dark:text-red-100">
                          Overdue Payments
                        </CardTitle>
                        <CardDescription className="mt-2 text-red-800 dark:text-red-200">
                          You have {stats.payments.overdueCount} overdue payment{stats.payments.overdueCount !== 1 ? 's' : ''} totaling KES {stats.payments.overdueAmount.toLocaleString()}
                        </CardDescription>
                      </div>
                      <Button variant="destructive" asChild>
                        <Link href="/dashboard/pending-payments">
                          Pay Now
                        </Link>
                      </Button>
                    </div>
                  </CardHeader>
                </Card>
              )}

              {stats.policies.expiringSoon > 0 && (
                <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950">
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <Clock className="h-6 w-6 text-amber-600 mt-1" />
                      <div className="flex-1">
                        <CardTitle className="text-amber-900 dark:text-amber-100">
                          Policies Expiring Soon
                        </CardTitle>
                        <CardDescription className="mt-2 text-amber-800 dark:text-amber-200">
                          {stats.policies.expiringSoon} polic{stats.policies.expiringSoon !== 1 ? 'ies' : 'y'} expiring within 30 days
                        </CardDescription>
                      </div>
                      <Button variant="outline" asChild>
                        <Link href="/dashboard/my-policies">
                          Renew
                        </Link>
                      </Button>
                    </div>
                  </CardHeader>
                </Card>
              )}

              {!user?.is_verified && (
                <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950">
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <AlertCircle className="h-6 w-6 text-blue-600 mt-1" />
                      <div className="flex-1">
                        <CardTitle className="text-blue-900 dark:text-blue-100">
                          Complete Your Profile
                        </CardTitle>
                        <CardDescription className="mt-2 text-blue-800 dark:text-blue-200">
                          Verify your account to unlock all features
                        </CardDescription>
                      </div>
                      <Button variant="outline" asChild>
                        <Link href="/dashboard/profile">
                          <Settings className="h-4 w-4 mr-2" />
                          Update Profile
                        </Link>
                      </Button>
                    </div>
                  </CardHeader>
                </Card>
              )}
            </div>
          )}

          {/* Upcoming Payments */}
          {upcomingPayments.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Upcoming Payments
                  </CardTitle>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/dashboard/pending-payments">
                      View All
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingPayments.map((payment) => {
                    const dueDate = new Date(payment.due_date)
                    const today = new Date()
                    const daysUntil = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

                    return (
                      <div key={payment.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                        <div>
                          <p className="font-medium">{payment.policy.policy_type}</p>
                          <p className="text-sm text-muted-foreground">
                            Due {dueDate.toLocaleDateString()}
                            {daysUntil <= 7 && (
                              <Badge variant="secondary" className="ml-2">
                                {daysUntil} day{daysUntil !== 1 ? 's' : ''}
                              </Badge>
                            )}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">KES {payment.amount.toLocaleString()}</p>
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/payment/${payment.id}`}>Pay</Link>
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/dashboard/my-policies">
                    View All
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </div>
              <CardDescription>
                Your latest transactions and updates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {recentActivity.map((activity) => {
                  const IconComponent = getIconComponent(activity.icon)
                  return (
                    <div key={activity.id} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`p-2 rounded-full ${activity.bgColor || 'bg-gray-100 dark:bg-gray-900'}`}>
                          <IconComponent className={`h-4 w-4 ${activity.iconColor || 'text-gray-600'}`} />
                        </div>
                        <div className="w-0.5 h-full bg-border mt-2" />
                      </div>
                      <div className="flex-1 pb-6 last:pb-0">
                        <div className="flex items-start justify-between mb-1">
                          <p className="font-medium">{activity.title}</p>
                          <span className="text-xs text-muted-foreground">
                            {getTimeAgo(activity.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {activity.description}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-amber-500" />
                For You
              </CardTitle>
              <CardDescription>
                Personalized recommendations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recommendations.map((rec) => (
                <div key={rec.id} className="space-y-2">
                  <div className="flex items-start gap-2">
                    {rec.priority === 'high' && (
                      <AlertCircle className="h-4 w-4 text-red-500 mt-0.5" />
                    )}
                    {rec.priority === 'medium' && (
                      <Bell className="h-4 w-4 text-amber-500 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{rec.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {rec.description}
                      </p>
                      <Button size="sm" variant="link" className="h-auto p-0 mt-2" asChild>
                        <Link href={rec.link}>
                          {rec.action}
                          <ArrowRight className="h-3 w-3 ml-1" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                  {rec.id !== recommendations[recommendations.length - 1].id && (
                    <div className="border-b" />
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Policy Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                My Policies
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Active</span>
                <Badge variant="default">{stats.policies.active}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Expiring Soon</span>
                <Badge variant="secondary">{stats.policies.expiringSoon}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Expired</span>
                <Badge variant="destructive">{stats.policies.expired}</Badge>
              </div>
              <Button className="w-full mt-4" asChild>
                <Link href="/dashboard/my-policies">
                  View All Policies
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Claims Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                My Claims
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Pending</span>
                <Badge variant="secondary">{stats.claims.pending}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Approved</span>
                <Badge variant="default">{stats.claims.approved}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Rejected</span>
                <Badge variant="destructive">{stats.claims.rejected}</Badge>
              </div>
              <Button className="w-full mt-4" variant="outline" asChild>
                <Link href="/claims/new">
                  File New Claim
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Support */}
          <Card className="bg-muted/50">
            <CardHeader>
              <CardTitle className="text-base">Need Help?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="text-muted-foreground">
                Our support team is available 24/7 to assist you.
              </p>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/support">Contact Support</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  )
}
