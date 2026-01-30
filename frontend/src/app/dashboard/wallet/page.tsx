'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Wallet,
  Plus,
  Minus,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  TrendingUp,
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
  Download,
  Filter
} from 'lucide-react'
import { toast } from 'sonner'

// Mock wallet data
const mockWalletData = {
  balance: 45000,
  pendingWithdrawals: 0,
  totalDeposits: 100000,
  totalWithdrawals: 55000,
  transactions: [
    {
      id: '1',
      type: 'deposit',
      amount: 10000,
      description: 'M-Pesa Deposit',
      date: '2026-01-28T14:30:00Z',
      status: 'completed',
      reference: 'QC12345678'
    },
    {
      id: '2',
      type: 'withdrawal',
      amount: 5000,
      description: 'Withdrawal to M-Pesa',
      date: '2026-01-25T10:15:00Z',
      status: 'completed',
      reference: 'WD98765432'
    },
    {
      id: '3',
      type: 'payment',
      amount: 15000,
      description: 'Motor Insurance Premium Payment',
      date: '2026-01-20T16:45:00Z',
      status: 'completed',
      reference: 'PMT45678901'
    },
    {
      id: '4',
      type: 'deposit',
      amount: 20000,
      description: 'Bank Transfer',
      date: '2026-01-15T09:20:00Z',
      status: 'completed',
      reference: 'BT11223344'
    },
    {
      id: '5',
      type: 'commission',
      amount: 5000,
      description: 'Affiliate Commission - Referral Bonus',
      date: '2026-01-10T12:00:00Z',
      status: 'completed',
      reference: 'COM55667788'
    },
    {
      id: '6',
      type: 'withdrawal',
      amount: 10000,
      description: 'Withdrawal to Bank',
      date: '2026-01-05T14:30:00Z',
      status: 'pending',
      reference: 'WD99887766'
    },
  ]
}

export default function WalletPage() {
  const [walletData] = useState(mockWalletData)
  const [depositAmount, setDepositAmount] = useState('')
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [depositMethod, setDepositMethod] = useState('mpesa')
  const [withdrawMethod, setWithdrawMethod] = useState('mpesa')
  const [selectedTab, setSelectedTab] = useState('overview')

  const handleDeposit = () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      toast.error('Please enter a valid amount')
      return
    }

    toast.success(`Deposit of KES ${parseFloat(depositAmount).toLocaleString()} initiated via ${depositMethod.toUpperCase()}`)
    setDepositAmount('')
  }

  const handleWithdraw = () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      toast.error('Please enter a valid amount')
      return
    }

    if (parseFloat(withdrawAmount) > walletData.balance) {
      toast.error('Insufficient balance')
      return
    }

    toast.success(`Withdrawal request of KES ${parseFloat(withdrawAmount).toLocaleString()} submitted`)
    setWithdrawAmount('')
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
      case 'commission':
        return <ArrowDownRight className="h-4 w-4 text-green-600" />
      case 'withdrawal':
        return <ArrowUpRight className="h-4 w-4 text-red-600" />
      case 'payment':
        return <DollarSign className="h-4 w-4 text-blue-600" />
      default:
        return <DollarSign className="h-4 w-4" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-600"><CheckCircle2 className="h-3 w-3 mr-1" />Completed</Badge>
      case 'pending':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
      case 'failed':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Failed</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Wallet className="h-8 w-8" />
          Bowman Wallet
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage your wallet balance, deposits, and withdrawals
        </p>
      </div>

      {/* Wallet Balance Card */}
      <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90 mb-2">Available Balance</p>
              <h2 className="text-4xl font-bold">KES {walletData.balance.toLocaleString()}</h2>
            </div>
            <Wallet className="h-16 w-16 opacity-50" />
          </div>
          {walletData.pendingWithdrawals > 0 && (
            <div className="mt-4 pt-4 border-t border-primary-foreground/20">
              <p className="text-sm opacity-90">
                Pending Withdrawals: KES {walletData.pendingWithdrawals.toLocaleString()}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Deposits</CardTitle>
            <ArrowDownRight className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              KES {walletData.totalDeposits.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              All time deposits
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Withdrawals</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              KES {walletData.totalWithdrawals.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              All time withdrawals
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Balance</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              KES {(walletData.totalDeposits - walletData.totalWithdrawals).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Current wallet value
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="deposit">Deposit</TabsTrigger>
          <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Transaction History</CardTitle>
                  <CardDescription>All your wallet transactions</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {walletData.transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-full bg-muted">
                        {getTransactionIcon(transaction.type)}
                      </div>
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(transaction.date)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Ref: {transaction.reference}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold text-lg ${
                        transaction.type === 'deposit' || transaction.type === 'commission'
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}>
                        {transaction.type === 'deposit' || transaction.type === 'commission' ? '+' : '-'}
                        KES {transaction.amount.toLocaleString()}
                      </p>
                      {getStatusBadge(transaction.status)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Deposit Tab */}
        <TabsContent value="deposit" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Deposit Money</CardTitle>
              <CardDescription>Add funds to your Bowman Wallet</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="deposit-amount">Amount (KES)</Label>
                  <Input
                    id="deposit-amount"
                    type="number"
                    placeholder="Enter amount"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    min="1"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Payment Method</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      variant={depositMethod === 'mpesa' ? 'default' : 'outline'}
                      onClick={() => setDepositMethod('mpesa')}
                      className="h-auto py-4"
                    >
                      <div className="text-center">
                        <p className="font-semibold">M-Pesa</p>
                        <p className="text-xs opacity-75">Mobile Money</p>
                      </div>
                    </Button>
                    <Button
                      variant={depositMethod === 'bank' ? 'default' : 'outline'}
                      onClick={() => setDepositMethod('bank')}
                      className="h-auto py-4"
                    >
                      <div className="text-center">
                        <p className="font-semibold">Bank Transfer</p>
                        <p className="text-xs opacity-75">Direct Deposit</p>
                      </div>
                    </Button>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Quick Amounts</h4>
                  <div className="grid grid-cols-4 gap-2">
                    {[1000, 5000, 10000, 20000].map((amount) => (
                      <Button
                        key={amount}
                        variant="outline"
                        size="sm"
                        onClick={() => setDepositAmount(amount.toString())}
                      >
                        {amount / 1000}K
                      </Button>
                    ))}
                  </div>
                </div>

                <Button onClick={handleDeposit} className="w-full" size="lg">
                  <Plus className="h-4 w-4 mr-2" />
                  Deposit KES {depositAmount ? parseFloat(depositAmount).toLocaleString() : '0'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Withdraw Tab */}
        <TabsContent value="withdraw" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Withdraw Money</CardTitle>
              <CardDescription>
                Request withdrawal from your Bowman Wallet
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 bg-amber-50 dark:bg-amber-950 rounded-lg border border-amber-200 dark:border-amber-800">
                <p className="text-sm text-amber-900 dark:text-amber-100">
                  <strong>Available Balance:</strong> KES {walletData.balance.toLocaleString()}
                </p>
                <p className="text-xs text-amber-800 dark:text-amber-200 mt-1">
                  Withdrawals are processed within 1-2 business days
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="withdraw-amount">Amount (KES)</Label>
                  <Input
                    id="withdraw-amount"
                    type="number"
                    placeholder="Enter amount"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    min="1"
                    max={walletData.balance}
                  />
                  <p className="text-xs text-muted-foreground">
                    Minimum withdrawal: KES 100
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Withdrawal Method</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      variant={withdrawMethod === 'mpesa' ? 'default' : 'outline'}
                      onClick={() => setWithdrawMethod('mpesa')}
                      className="h-auto py-4"
                    >
                      <div className="text-center">
                        <p className="font-semibold">M-Pesa</p>
                        <p className="text-xs opacity-75">Instant Transfer</p>
                      </div>
                    </Button>
                    <Button
                      variant={withdrawMethod === 'bank' ? 'default' : 'outline'}
                      onClick={() => setWithdrawMethod('bank')}
                      className="h-auto py-4"
                    >
                      <div className="text-center">
                        <p className="font-semibold">Bank Account</p>
                        <p className="text-xs opacity-75">1-2 Days</p>
                      </div>
                    </Button>
                  </div>
                </div>

                <Button
                  onClick={handleWithdraw}
                  className="w-full"
                  size="lg"
                  variant="destructive"
                >
                  <Minus className="h-4 w-4 mr-2" />
                  Withdraw KES {withdrawAmount ? parseFloat(withdrawAmount).toLocaleString() : '0'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
