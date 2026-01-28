'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Shield,
  Search,
  Filter,
  Download,
  FileText,
  AlertCircle,
  Calendar,
  DollarSign,
  MoreVertical,
  RefreshCw,
  XCircle
} from 'lucide-react'
import { toast } from 'sonner'
import { ProtectedRoute } from '@/components/auth/protected-route'
import type { Policy } from '@/types'

// Mock data for development - will be replaced with API calls
const mockPolicies: Policy[] = [
  {
    id: '1',
    policy_number: 'POL-2026-001234',
    policy_type: {
      id: '1',
      name: 'Comprehensive Motor Insurance',
      description: 'Full coverage for your vehicle',
      base_premium: 15000,
      coverage_details: {},
      features: [],
      is_active: true,
      category: {
        id: '1',
        name: 'Motor Insurance',
        slug: 'motor',
        description: 'Vehicle insurance',
        icon: 'car'
      },
      insurance_company: {
        id: '1',
        name: 'Jubilee Insurance',
        logo: '',
        rating: 4.5,
        description: '',
        is_active: true
      }
    },
    insurance_company: {
      id: '1',
      name: 'Jubilee Insurance',
      logo: '',
      rating: 4.5,
      description: '',
      is_active: true
    },
    status: 'active',
    start_date: '2026-01-01',
    end_date: '2026-12-31',
    premium_amount: 15000,
    payment_frequency: 'monthly',
    created_at: '2026-01-01T00:00:00Z'
  },
  {
    id: '2',
    policy_number: 'POL-2026-001235',
    policy_type: {
      id: '2',
      name: 'Medical Insurance Plus',
      description: 'Comprehensive health coverage',
      base_premium: 25000,
      coverage_details: {},
      features: [],
      is_active: true,
      category: {
        id: '2',
        name: 'Medical Insurance',
        slug: 'medical',
        description: 'Health insurance',
        icon: 'heart'
      },
      insurance_company: {
        id: '2',
        name: 'AAR Insurance',
        logo: '',
        rating: 4.7,
        description: '',
        is_active: true
      }
    },
    insurance_company: {
      id: '2',
      name: 'AAR Insurance',
      logo: '',
      rating: 4.7,
      description: '',
      is_active: true
    },
    status: 'active',
    start_date: '2026-01-15',
    end_date: '2027-01-14',
    premium_amount: 25000,
    payment_frequency: 'annual',
    created_at: '2026-01-15T00:00:00Z'
  },
  {
    id: '3',
    policy_number: 'POL-2025-009876',
    policy_type: {
      id: '3',
      name: 'Home Insurance',
      description: 'Property protection',
      base_premium: 12000,
      coverage_details: {},
      features: [],
      is_active: true,
      category: {
        id: '3',
        name: 'Home Insurance',
        slug: 'home',
        description: 'Property insurance',
        icon: 'home'
      },
      insurance_company: {
        id: '3',
        name: 'Britam',
        logo: '',
        rating: 4.3,
        description: '',
        is_active: true
      }
    },
    insurance_company: {
      id: '3',
      name: 'Britam',
      logo: '',
      rating: 4.3,
      description: '',
      is_active: true
    },
    status: 'expired',
    start_date: '2025-01-01',
    end_date: '2025-12-31',
    premium_amount: 12000,
    payment_frequency: 'annual',
    created_at: '2025-01-01T00:00:00Z'
  }
]

function MyPoliciesContent() {
  const [policies, setPolicies] = useState<Policy[]>(mockPolicies)
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const getStatusBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'active':
        return 'default'
      case 'expired':
        return 'destructive'
      case 'pending':
        return 'secondary'
      case 'cancelled':
        return 'outline'
      default:
        return 'secondary'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Shield className="w-4 h-4 text-green-500" />
      case 'expired':
        return <XCircle className="w-4 h-4 text-red-500" />
      case 'pending':
        return <AlertCircle className="w-4 h-4 text-amber-500" />
      default:
        return <Shield className="w-4 h-4 text-gray-500" />
    }
  }

  const handleDownloadCertificate = (policyId: string) => {
    toast.success('Certificate download started')
    // TODO: Implement actual download
  }

  const handleRenewPolicy = (policyId: string) => {
    toast.success('Renewal process started')
    // TODO: Navigate to renewal flow
  }

  const filteredPolicies = policies.filter(policy => {
    const matchesSearch =
      searchQuery === '' ||
      policy.policy_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      policy.policy_type.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      policy.insurance_company.name.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus =
      statusFilter === 'all' || policy.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const stats = {
    total: policies.length,
    active: policies.filter(p => p.status === 'active').length,
    expiring: policies.filter(p => {
      const daysUntilExpiry = Math.floor(
        (new Date(p.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      )
      return daysUntilExpiry <= 30 && daysUntilExpiry > 0
    }).length,
    expired: policies.filter(p => p.status === 'expired').length
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Policies</h1>
          <p className="text-muted-foreground">
            Manage all your insurance policies in one place
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/policies">
            <Shield className="w-4 h-4 mr-2" />
            Browse Policies
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Policies</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              All your policies
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <Shield className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            <p className="text-xs text-muted-foreground">
              Currently active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
            <AlertCircle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{stats.expiring}</div>
            <p className="text-xs text-muted-foreground">
              Within 30 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expired</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.expired}</div>
            <p className="text-xs text-muted-foreground">
              Need renewal
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by policy number, type, or insurer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="expired">Expired</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Policies List */}
      {filteredPolicies.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Shield className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-semibold mb-2">No policies found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'You don\'t have any policies yet'}
            </p>
            <Button asChild>
              <Link href="/policies">Browse Available Policies</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredPolicies.map((policy) => (
            <Card key={policy.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-4 mb-3">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Shield className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-lg">
                            {policy.policy_type.name}
                          </h3>
                          {getStatusIcon(policy.status)}
                          <Badge variant={getStatusBadgeVariant(policy.status)}>
                            {policy.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          Policy No: {policy.policy_number}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Insurer: {policy.insurance_company.name}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 ml-16 text-sm">
                      <div>
                        <p className="text-muted-foreground">Premium</p>
                        <p className="font-medium">
                          KES {policy.premium_amount.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {policy.payment_frequency}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Start Date</p>
                        <p className="font-medium">
                          {new Date(policy.start_date).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">End Date</p>
                        <p className="font-medium">
                          {new Date(policy.end_date).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Days Remaining</p>
                        <p className="font-medium">
                          {Math.max(0, Math.floor(
                            (new Date(policy.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                          ))} days
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 lg:items-end">
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/policies/details/${policy.id}`}>
                          <FileText className="w-4 h-4 mr-2" />
                          View Details
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadCertificate(policy.id)}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Certificate
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {policy.status === 'expired' && (
                        <Button
                          size="sm"
                          onClick={() => handleRenewPolicy(policy.id)}
                        >
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Renew
                        </Button>
                      )}
                      {policy.status === 'active' && (
                        <>
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/claims/new?policy=${policy.id}`}>
                              File Claim
                            </Link>
                          </Button>
                          <Button size="sm" asChild>
                            <Link href={`/payment/${policy.id}`}>
                              <DollarSign className="w-4 h-4 mr-2" />
                              Pay
                            </Link>
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default function MyPoliciesPage() {
  return (
    <ProtectedRoute>
      <MyPoliciesContent />
    </ProtectedRoute>
  )
}
