'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, FileText, Clock, CheckCircle2, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react'

export default function ClaimsPage() {
  // Mock claims data - expanded for pagination demo
  const allClaims = [
    {
      id: '1',
      claimNumber: 'CLM-2024-001',
      policyName: 'Comprehensive Motor Cover',
      policyNumber: 'POL-2024-001',
      type: 'Motor',
      dateSubmitted: '2024-01-15',
      status: 'approved',
      amount: 45000,
      description: 'Vehicle accident damage',
    },
    {
      id: '2',
      claimNumber: 'CLM-2024-002',
      policyName: 'Family Health Plan',
      policyNumber: 'POL-2024-002',
      type: 'Medical',
      dateSubmitted: '2024-01-20',
      status: 'pending',
      amount: 15000,
      description: 'Hospital admission',
    },
    {
      id: '3',
      claimNumber: 'CLM-2024-003',
      policyName: 'Home Plus',
      policyNumber: 'POL-2024-003',
      type: 'Home',
      dateSubmitted: '2024-01-10',
      status: 'processing',
      amount: 80000,
      description: 'Water damage to property',
    },
    {
      id: '4',
      claimNumber: 'CLM-2024-004',
      policyName: 'Travel Insurance',
      policyNumber: 'POL-2024-004',
      type: 'Travel',
      dateSubmitted: '2024-01-12',
      status: 'approved',
      amount: 25000,
      description: 'Lost luggage claim',
    },
    {
      id: '5',
      claimNumber: 'CLM-2024-005',
      policyName: 'Business Cover',
      policyNumber: 'POL-2024-005',
      type: 'Business',
      dateSubmitted: '2024-01-18',
      status: 'processing',
      amount: 120000,
      description: 'Equipment damage',
    },
  ]

  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  // Calculate pagination
  const totalPages = Math.ceil(allClaims.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const claims = allClaims.slice(startIndex, endIndex)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
            <CheckCircle2 className="h-3 w-3" />
            Approved
          </span>
        )
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
            <Clock className="h-3 w-3" />
            Pending Review
          </span>
        )
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
            <AlertCircle className="h-3 w-3" />
            Processing
          </span>
        )
      default:
        return null
    }
  }

  return (
    <div>
      {/* Page Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Claims</h1>
          <p className="text-muted-foreground">
            Track and manage all your insurance claims
          </p>
        </div>
        <Button size="lg" asChild>
          <Link href="/dashboard/claims/new">
            <Plus className="h-5 w-5 mr-2" />
            File New Claim
          </Link>
        </Button>
      </div>

      {/* Claims List */}
      <div>
        {claims.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Claims Yet</h3>
              <p className="text-muted-foreground mb-6">
                You haven't filed any insurance claims
              </p>
              <Button asChild>
                <Link href="/dashboard/claims/new">
                  <Plus className="h-4 w-4 mr-2" />
                  File Your First Claim
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {claims.map((claim) => (
                    <div
                      key={claim.id}
                      className="p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                        {/* Left Section */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="font-semibold text-sm">{claim.claimNumber}</h3>
                            {getStatusBadge(claim.status)}
                          </div>
                          <p className="text-sm text-muted-foreground truncate">{claim.policyName}</p>
                        </div>

                        {/* Middle Section - Info Grid */}
                        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Policy: </span>
                            <span className="font-medium">{claim.policyNumber}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Type: </span>
                            <span className="font-medium">{claim.type}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Date: </span>
                            <span className="font-medium">{claim.dateSubmitted}</span>
                          </div>
                        </div>

                        {/* Right Section - Amount and Action */}
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="font-bold text-lg">
                              KES {claim.amount.toLocaleString()}
                            </div>
                            <p className="text-xs text-muted-foreground">Claim Amount</p>
                          </div>
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">
                  Showing {startIndex + 1} to {Math.min(endIndex, allClaims.length)} of {allClaims.length} claims
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className="w-8 h-8 p-0"
                      >
                        {page}
                      </Button>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
