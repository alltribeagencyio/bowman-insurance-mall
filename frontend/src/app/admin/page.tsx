'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Users,
  Shield,
  DollarSign,
  FileText,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react'
import { toast } from 'sonner'
import { getAdminDashboard } from '@/lib/api/admin'
import type { AdminDashboardData } from '@/lib/api/admin'

export default function AdminDashboard() {
  const [data, setData] = useState<AdminDashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setIsLoading(true)
    try {
      const dashboardData = await getAdminDashboard()
      setData(dashboardData)
    } catch (error: any) {
      console.error('Failed to load dashboard data:', error)
      toast.error(error.response?.data?.message || 'Failed to load dashboard data')
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffMs = now.getTime() - time.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)

    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return time.toLocaleDateString()
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline', icon: React.ReactNode }> = {
      completed: { variant: 'default', icon: <CheckCircle className="h-3 w-3" /> },
      active: { variant: 'default', icon: <CheckCircle className="h-3 w-3" /> },
      pending: { variant: 'secondary', icon: <Clock className="h-3 w-3" /> },
      failed: { variant: 'destructive', icon: <XCircle className="h-3 w-3" /> }
    }

    const { variant, icon } = variants[status] || variants.pending

    return (
      <Badge variant={variant} className="gap-1">
        {icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Failed to load dashboard data</p>
          <Button variant="outline" onClick={loadDashboardData} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back! Here's what's happening with your insurance marketplace.
        </p>
      </div>

      {/* Metrics cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.metrics.total_users.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3 text-green-600" />
              <span className="text-green-600">+{data.metrics.users_growth}%</span>
              from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Policies</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.metrics.active_policies.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3 text-green-600" />
              <span className="text-green-600">+{data.metrics.policies_growth}%</span>
              from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.metrics.total_revenue)}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3 text-green-600" />
              <span className="text-green-600">+{data.metrics.revenue_growth}%</span>
              from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Claims</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{data.metrics.pending_claims}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <TrendingDown className="h-3 w-3 text-green-600" />
              <span className="text-green-600">{data.metrics.claims_change}</span>
              from yesterday
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent transactions */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>Latest payment transactions</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/admin/transactions">
                  View All
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.recent_transactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{transaction.user.name}</p>
                    <p className="text-xs text-muted-foreground">{transaction.policy?.policy_number || 'N/A'}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm font-medium">{formatCurrency(transaction.amount)}</p>
                      <p className="text-xs text-muted-foreground">{formatTimeAgo(transaction.created_at)}</p>
                    </div>
                    {getStatusBadge(transaction.status)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent users */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Users</CardTitle>
                <CardDescription>New user registrations</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/admin/users">
                  View All
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.recent_users.map((user) => (
                <div key={user.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm">
                      {user.first_name[0]}{user.last_name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{user.first_name} {user.last_name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground mb-1">{formatTimeAgo(user.created_at)}</p>
                    {getStatusBadge(user.status)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending tasks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-500" />
            Pending Tasks & Alerts
          </CardTitle>
          <CardDescription>Items that require your attention</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.pending_tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className={`h-2 w-2 rounded-full mt-2 ${
                    task.priority === 'high' ? 'bg-red-500' : task.priority === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                  }`} />
                  <div>
                    <p className="font-medium">{task.title}</p>
                    <p className="text-sm text-muted-foreground">{task.description}</p>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatTimeAgo(task.created_at)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
