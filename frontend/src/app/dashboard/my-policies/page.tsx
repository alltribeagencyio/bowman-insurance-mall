'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Pagination } from '@/components/ui/pagination'
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
  XCircle,
  Loader2
} from 'lucide-react'
import { toast } from 'sonner'
import { ProtectedRoute } from '@/components/auth/protected-route'
import type { Policy } from '@/types'
import { getUserPolicies } from '@/lib/api/policies'

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
  const [policies, setPolicies] = useState<Policy[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  // Fetch user policies on mount
  useEffect(() => {
    const fetchPolicies = async () => {
      try {
        setIsLoading(true)
        const data = await getUserPolicies()
        setPolicies(data)
      } catch (error) {
        console.error('Error fetching policies:', error)
        toast.error('Failed to load policies. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchPolicies()
  }, [])

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

  const allFilteredPolicies = policies.filter(policy => {
    const matchesSearch =
      searchQuery === '' ||
      policy.policy_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      policy.policy_type.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      policy.insurance_company.name.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus =
      statusFilter === 'all' || policy.status === statusFilter

    return matchesSearch && matchesStatus
  })

  // Calculate pagination
  const totalPages = Math.ceil(allFilteredPolicies.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const filteredPolicies = allFilteredPolicies.slice(startIndex, endIndex)

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, statusFilter])

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
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
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
      {isLoading ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Loader2 className="w-12 h-12 mx-auto mb-4 text-primary animate-spin" />
            <h3 className="font-semibold mb-2">Loading policies...</h3>
            <p className="text-muted-foreground">
              Please wait while we fetch your policies
            </p>
          </CardContent>
        </Card>
      ) : allFilteredPolicies.length === 0 ? (
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
        <>
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {filteredPolicies.map((policy) => (
                  <div
                    key={policy.id}
                    className="p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Left Section */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {getStatusIcon(policy.status)}
                          <h3 className="font-semibold text-sm truncate">
                            {policy.policy_type.name}
                          </h3>
                          <Badge variant={getStatusBadgeVariant(policy.status)} className="flex-shrink-0">
                            {policy.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {policy.policy_number} • {policy.insurance_company.name}
                        </p>
                      </div>

                      {/* Middle Section - Key Info */}
                      <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Premium: </span>
                          <span className="font-medium">KES {policy.premium_amount.toLocaleString()}</span>
                          <span className="text-muted-foreground text-xs"> /{policy.payment_frequency}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Expires: </span>
                          <span className="font-medium">{new Date(policy.end_date).toLocaleDateString()}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Days left: </span>
                          <span className="font-medium">
                            {Math.max(0, Math.floor(
                              (new Date(policy.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                            ))}
                          </span>
                        </div>
                      </div>

                      {/* Right Section - Actions */}
                      <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/policies/details/${policy.id}`}>
                            <FileText className="w-4 h-4 mr-1" />
                            Details
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadCertificate(policy.id)}
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Certificate
                        </Button>
                        {policy.status === 'expired' && (
                          <Button
                            size="sm"
                            onClick={() => handleRenewPolicy(policy.id)}
                          >
                            <RefreshCw className="w-4 h-4 mr-1" />
                            Renew
                          </Button>
                        )}
                        {policy.status === 'active' && (
                          <Button size="sm" asChild>
                            <Link href={`/payment/${policy.id}`}>
                              Pay
                            </Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={allFilteredPolicies.length}
              itemsPerPage={itemsPerPage}
              itemName="policies"
            />
          )}
        </>
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
