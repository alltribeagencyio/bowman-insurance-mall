'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  AlertCircle,
  Calendar,
  DollarSign,
  CreditCard,
  CheckCircle,
  Clock,
  Bell,
  Settings,
  ArrowRight,
  Wallet
} from 'lucide-react'
import { toast } from 'sonner'
import { ProtectedRoute } from '@/components/auth/protected-route'

interface PaymentSchedule {
  id: string
  transaction: {
    id: string
    transaction_number: string
    policy: {
      id: string
      policy_number: string
      policy_type: {
        name: string
      }
    }
  }
  schedule_type: 'installment' | 'recurring' | 'one_time'
  amount: number
  due_date: string
  status: 'pending' | 'paid' | 'overdue' | 'cancelled'
  installment_number?: number
  total_installments?: number
  is_auto_pay: boolean
  reminder_sent: boolean
  created_at: string
}

// Mock data - will be replaced with API calls
const mockSchedules: PaymentSchedule[] = [
  {
    id: '1',
    transaction: {
      id: 'txn-1',
      transaction_number: 'TXN-2026-001234',
      policy: {
        id: '1',
        policy_number: 'POL-2026-001234',
        policy_type: {
          name: 'Comprehensive Motor Insurance'
        }
      }
    },
    schedule_type: 'installment',
    amount: 5000,
    due_date: '2026-02-01',
    status: 'pending',
    installment_number: 2,
    total_installments: 12,
    is_auto_pay: false,
    reminder_sent: true,
    created_at: '2026-01-01T00:00:00Z'
  },
  {
    id: '2',
    transaction: {
      id: 'txn-2',
      transaction_number: 'TXN-2026-001235',
      policy: {
        id: '2',
        policy_number: 'POL-2026-001235',
        policy_type: {
          name: 'Medical Insurance Plus'
        }
      }
    },
    schedule_type: 'recurring',
    amount: 25000,
    due_date: '2026-02-15',
    status: 'pending',
    is_auto_pay: true,
    reminder_sent: false,
    created_at: '2026-01-15T00:00:00Z'
  },
  {
    id: '3',
    transaction: {
      id: 'txn-3',
      transaction_number: 'TXN-2026-001200',
      policy: {
        id: '3',
        policy_number: 'POL-2025-009876',
        policy_type: {
          name: 'Home Insurance'
        }
      }
    },
    schedule_type: 'installment',
    amount: 3000,
    due_date: '2026-01-25',
    status: 'overdue',
    installment_number: 1,
    total_installments: 4,
    is_auto_pay: false,
    reminder_sent: true,
    created_at: '2025-12-25T00:00:00Z'
  },
  {
    id: '4',
    transaction: {
      id: 'txn-4',
      transaction_number: 'TXN-2026-001201',
      policy: {
        id: '1',
        policy_number: 'POL-2026-001234',
        policy_type: {
          name: 'Comprehensive Motor Insurance'
        }
      }
    },
    schedule_type: 'installment',
    amount: 5000,
    due_date: '2026-03-01',
    status: 'pending',
    installment_number: 3,
    total_installments: 12,
    is_auto_pay: false,
    reminder_sent: false,
    created_at: '2026-01-01T00:00:00Z'
  }
]

function PendingPaymentsContent() {
  const [schedules, setSchedules] = useState<PaymentSchedule[]>(mockSchedules)
  const [isLoading, setIsLoading] = useState(false)
  // Mock wallet balance - in production, this would come from API/context
  const [walletBalance, setWalletBalance] = useState(45000)

  const getDaysUntilDue = (dueDate: string): number => {
    return Math.floor(
      (new Date(dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    )
  }

  const getDueDateStatus = (dueDate: string, status: string) => {
    if (status === 'overdue') return { label: 'Overdue', color: 'text-red-600' }

    const days = getDaysUntilDue(dueDate)
    if (days < 0) return { label: 'Overdue', color: 'text-red-600' }
    if (days === 0) return { label: 'Due Today', color: 'text-amber-600' }
    if (days === 1) return { label: 'Due Tomorrow', color: 'text-amber-600' }
    if (days <= 7) return { label: `Due in ${days} days`, color: 'text-amber-600' }
    return { label: `Due in ${days} days`, color: 'text-muted-foreground' }
  }

  const getStatusBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'pending':
        return 'secondary'
      case 'overdue':
        return 'destructive'
      case 'paid':
        return 'default'
      default:
        return 'outline'
    }
  }

  const handlePayNow = (schedule: PaymentSchedule) => {
    // Navigate to payment page for this policy
    window.location.href = `/payment/${schedule.transaction.policy.id}?amount=${schedule.amount}&schedule_id=${schedule.id}`
  }

  const handlePayFromWallet = (schedule: PaymentSchedule) => {
    if (walletBalance < schedule.amount) {
      toast.error(`Insufficient wallet balance. You need KES ${(schedule.amount - walletBalance).toLocaleString()} more.`)
      return
    }

    // Deduct from wallet and update payment status
    setWalletBalance(prev => prev - schedule.amount)
    setSchedules(prev => prev.map(s =>
      s.id === schedule.id
        ? { ...s, status: 'paid' as const }
        : s
    ))

    toast.success(`Payment of KES ${schedule.amount.toLocaleString()} deducted from wallet. New balance: KES ${(walletBalance - schedule.amount).toLocaleString()}`)
  }

  const handleToggleAutoPay = (schedule: PaymentSchedule) => {
    const newAutoPayStatus = !schedule.is_auto_pay

    // Check wallet balance if enabling auto-pay
    if (newAutoPayStatus && walletBalance < schedule.amount) {
      toast.error(`Cannot enable auto-pay. Insufficient wallet balance. You need KES ${(schedule.amount - walletBalance).toLocaleString()} more.`)
      return
    }

    setSchedules(prev => prev.map(s =>
      s.id === schedule.id
        ? { ...s, is_auto_pay: newAutoPayStatus }
        : s
    ))

    if (newAutoPayStatus) {
      toast.success(`Auto-pay enabled. Payment will be automatically deducted from your wallet on ${new Date(schedule.due_date).toLocaleDateString()}`)
    } else {
      toast.success('Auto-pay disabled')
    }
  }

  const handleSetReminder = (scheduleId: string) => {
    toast.success('Payment reminder set')
    // TODO: Implement reminder API call
  }

  // Separate overdue and upcoming payments
  const overduePayments = schedules.filter(s => s.status === 'overdue')
  const upcomingPayments = schedules.filter(s => s.status === 'pending')
    .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())

  const stats = {
    total: schedules.filter(s => s.status === 'pending' || s.status === 'overdue').length,
    overdue: overduePayments.length,
    thisWeek: schedules.filter(s => {
      const days = getDaysUntilDue(s.due_date)
      return s.status === 'pending' && days >= 0 && days <= 7
    }).length,
    autoPay: schedules.filter(s => s.is_auto_pay && s.status === 'pending').length
  }

  const totalAmount = schedules
    .filter(s => s.status === 'pending' || s.status === 'overdue')
    .reduce((sum, s) => sum + s.amount, 0)

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Pending Payments</h1>
          <p className="text-muted-foreground">
            Manage your upcoming and overdue payments
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/dashboard/payments">
              <Clock className="w-4 h-4 mr-2" />
              Payment History
            </Link>
          </Button>
          <Button variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            Auto-Pay Settings
          </Button>
        </div>
      </div>

      {/* Wallet Balance Banner */}
      <Card className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <Wallet className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Available Wallet Balance</p>
                <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                  KES {walletBalance.toLocaleString()}
                </p>
              </div>
            </div>
            <Button variant="outline" asChild>
              <Link href="/dashboard/wallet">
                <Wallet className="w-4 h-4 mr-2" />
                Manage Wallet
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pending</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KES {totalAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total} payment{stats.total !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
            <p className="text-xs text-muted-foreground">
              Requires immediate attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Due This Week</CardTitle>
            <Calendar className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{stats.thisWeek}</div>
            <p className="text-xs text-muted-foreground">
              Within 7 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Auto-Pay Enabled</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.autoPay}</div>
            <p className="text-xs text-muted-foreground">
              Automated payments
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Overdue Payments Section */}
      {overduePayments.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <h2 className="text-2xl font-semibold text-red-600">
              Overdue Payments ({overduePayments.length})
            </h2>
          </div>

          <div className="space-y-4">
            {overduePayments.map((schedule) => {
              const dueStatus = getDueDateStatus(schedule.due_date, schedule.status)
              const daysOverdue = Math.abs(getDaysUntilDue(schedule.due_date))

              return (
                <Card key={schedule.id} className="border-red-200 bg-red-50/50 dark:bg-red-950/20">
                  <CardContent className="pt-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-4 mb-3">
                          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center flex-shrink-0">
                            <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <h3 className="font-semibold text-lg">
                                {schedule.transaction.policy.policy_type.name}
                              </h3>
                              <Badge variant={getStatusBadgeVariant(schedule.status)}>
                                {schedule.status}
                              </Badge>
                              {schedule.schedule_type === 'installment' && (
                                <Badge variant="outline">
                                  Installment {schedule.installment_number}/{schedule.total_installments}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-1">
                              Policy: {schedule.transaction.policy.policy_number}
                            </p>
                            <p className="text-sm text-red-600 font-medium">
                              {daysOverdue} day{daysOverdue !== 1 ? 's' : ''} overdue
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 ml-16 text-sm">
                          <div>
                            <p className="text-muted-foreground">Amount Due</p>
                            <p className="font-semibold text-lg">
                              KES {schedule.amount.toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Due Date</p>
                            <p className="font-medium">
                              {new Date(schedule.due_date).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Payment Type</p>
                            <p className="font-medium capitalize">
                              {schedule.schedule_type.replace('_', ' ')}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 lg:items-end">
                        <Button
                          onClick={() => handlePayFromWallet(schedule)}
                          size="lg"
                          className="w-full lg:w-auto"
                          disabled={walletBalance < schedule.amount}
                        >
                          <Wallet className="w-4 h-4 mr-2" />
                          Pay from Wallet
                        </Button>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePayNow(schedule)}
                            className="flex-1 lg:flex-none"
                          >
                            <DollarSign className="w-4 h-4 mr-2" />
                            Other Payment
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSetReminder(schedule.id)}
                            className="flex-1 lg:flex-none"
                          >
                            <Bell className="w-4 h-4" />
                          </Button>
                        </div>
                        {walletBalance < schedule.amount && (
                          <p className="text-xs text-red-600 text-right">
                            Insufficient wallet balance
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* Upcoming Payments Section */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">
          Upcoming Payments ({upcomingPayments.length})
        </h2>

        {upcomingPayments.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
              <h3 className="font-semibold mb-2">All caught up!</h3>
              <p className="text-muted-foreground mb-4">
                You have no upcoming payments at this time
              </p>
              <Button asChild variant="outline">
                <Link href="/dashboard/my-policies">View My Policies</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {upcomingPayments.map((schedule) => {
              const dueStatus = getDueDateStatus(schedule.due_date, schedule.status)

              return (
                <Card key={schedule.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-4 mb-3">
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            {schedule.is_auto_pay ? (
                              <CheckCircle className="w-6 h-6 text-green-500" />
                            ) : (
                              <CreditCard className="w-6 h-6 text-primary" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <h3 className="font-semibold text-lg">
                                {schedule.transaction.policy.policy_type.name}
                              </h3>
                              {schedule.schedule_type === 'installment' && (
                                <Badge variant="outline">
                                  Installment {schedule.installment_number}/{schedule.total_installments}
                                </Badge>
                              )}
                              {schedule.is_auto_pay && (
                                <Badge variant="default" className="bg-green-600">
                                  Auto-Pay
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-1">
                              Policy: {schedule.transaction.policy.policy_number}
                            </p>
                            <p className={`text-sm font-medium ${dueStatus.color}`}>
                              {dueStatus.label}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 ml-16 text-sm">
                          <div>
                            <p className="text-muted-foreground">Amount Due</p>
                            <p className="font-semibold text-lg">
                              KES {schedule.amount.toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Due Date</p>
                            <p className="font-medium">
                              {new Date(schedule.due_date).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Payment Type</p>
                            <p className="font-medium capitalize">
                              {schedule.schedule_type.replace('_', ' ')}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 lg:items-end">
                        {/* Auto-pay Toggle */}
                        <div className="flex items-center space-x-2 p-3 rounded-lg border bg-muted/50">
                          <Switch
                            id={`auto-pay-${schedule.id}`}
                            checked={schedule.is_auto_pay}
                            onCheckedChange={() => handleToggleAutoPay(schedule)}
                            disabled={walletBalance < schedule.amount}
                          />
                          <Label htmlFor={`auto-pay-${schedule.id}`} className="cursor-pointer text-sm">
                            {schedule.is_auto_pay ? (
                              <span className="text-green-600 font-medium">Auto-Pay Enabled</span>
                            ) : (
                              <span>Enable Auto-Pay</span>
                            )}
                          </Label>
                        </div>

                        {!schedule.is_auto_pay && (
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handlePayFromWallet(schedule)}
                              size="sm"
                              className="flex-1 lg:flex-none"
                              disabled={walletBalance < schedule.amount}
                            >
                              <Wallet className="w-4 h-4 mr-2" />
                              Pay from Wallet
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePayNow(schedule)}
                              className="flex-1 lg:flex-none"
                            >
                              <DollarSign className="w-4 h-4 mr-2" />
                              Other Payment
                            </Button>
                          </div>
                        )}

                        {!schedule.reminder_sent && !schedule.is_auto_pay && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSetReminder(schedule.id)}
                            className="w-full lg:w-auto"
                          >
                            <Bell className="w-4 h-4 mr-2" />
                            Set Reminder
                          </Button>
                        )}

                        {walletBalance < schedule.amount && (
                          <p className="text-xs text-amber-600 text-right">
                            Top up wallet to enable auto-pay
                          </p>
                        )}

                        {schedule.is_auto_pay && (
                          <p className="text-xs text-green-600 text-right">
                            Will be paid automatically on due date
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Installment Progress */}
                    {schedule.schedule_type === 'installment' && schedule.total_installments && schedule.installment_number && (
                      <div className="ml-16 mt-4 pt-4 border-t">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-muted-foreground">Payment Progress</span>
                          <span className="text-sm font-medium">
                            {schedule.installment_number - 1} of {schedule.total_installments} paid
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="bg-primary rounded-full h-2 transition-all"
                            style={{
                              width: `${((schedule.installment_number - 1) / schedule.total_installments) * 100}%`
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Help Section */}
      <Card className="mt-8 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-900">
        <CardHeader>
          <CardTitle className="text-base text-blue-900 dark:text-blue-100">
            Payment Tips
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
          <p>• <strong>Auto-Pay with Wallet:</strong> Enable auto-pay to automatically deduct payments from your Bowman Wallet on the due date</p>
          <p>• <strong>Pay from Wallet:</strong> Use your wallet balance for instant payments without transaction fees</p>
          <p>• <strong>Top Up Wallet:</strong> Deposit funds in advance to ensure sufficient balance for auto-pay</p>
          <p>• <strong>Set Reminders:</strong> Get notified before due dates to plan ahead</p>
          <p>• <strong>Pay Early:</strong> Avoid late fees and policy suspension by paying before the due date</p>
        </CardContent>
      </Card>
    </div>
  )
}

export default function PendingPaymentsPage() {
  return (
    <ProtectedRoute>
      <PendingPaymentsContent />
    </ProtectedRoute>
  )
}
