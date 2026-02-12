'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, FileText, Clock, CheckCircle2, AlertCircle, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { getUserClaims, type Claim } from '@/lib/api/claims'

export default function ClaimsPage() {
  const [allClaims, setAllClaims] = useState<Claim[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  // Fetch user claims on mount
  useEffect(() => {
    const fetchClaims = async () => {
      try {
        setIsLoading(true)
        const data = await getUserClaims()
        setAllClaims(data)
      } catch (error) {
        console.error('Error fetching claims:', error)
        toast.error('Failed to load claims. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchClaims()
  }, [])


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
      case 'submitted':
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
            <Clock className="h-3 w-3" />
            {status === 'submitted' ? 'Submitted' : 'Pending Review'}
          </span>
        )
      case 'under_review':
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
            <AlertCircle className="h-3 w-3" />
            {status === 'under_review' ? 'Under Review' : 'Processing'}
          </span>
        )
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
            <AlertCircle className="h-3 w-3" />
            Rejected
          </span>
        )
      case 'settled':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
            <CheckCircle2 className="h-3 w-3" />
            Settled
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
        {isLoading ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Loader2 className="h-16 w-16 text-primary mx-auto mb-4 animate-spin" />
              <h3 className="text-xl font-semibold mb-2">Loading Claims...</h3>
              <p className="text-muted-foreground">
                Please wait while we fetch your claims
              </p>
            </CardContent>
          </Card>
        ) : claims.length === 0 ? (
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
                            <h3 className="font-semibold text-sm">{claim.claim_number}</h3>
                            {getStatusBadge(claim.status)}
                          </div>
                          <p className="text-sm text-muted-foreground truncate">{claim.policy.policy_type}</p>
                        </div>

                        {/* Middle Section - Info Grid */}
                        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Policy: </span>
                            <span className="font-medium">{claim.policy.policy_number}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Type: </span>
                            <span className="font-medium">{claim.type}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Date: </span>
                            <span className="font-medium">{new Date(claim.submitted_at).toLocaleDateString()}</span>
                          </div>
                        </div>

                        {/* Right Section - Amount and Action */}
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="font-bold text-lg">
                              KES {parseFloat(claim.amount_claimed).toLocaleString()}
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
