'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, FileText, Clock, CheckCircle2, AlertCircle } from 'lucide-react'

export default function ClaimsPage() {
  // Mock claims data
  const [claims] = useState([
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
  ])

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
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/10 to-background py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 max-w-6xl mx-auto">
            <div>
              <h1 className="text-4xl font-bold mb-2">My Claims</h1>
              <p className="text-muted-foreground text-lg">
                Track and manage all your insurance claims
              </p>
            </div>
            <Button size="lg" asChild>
              <Link href="/claims/new">
                <Plus className="h-5 w-5 mr-2" />
                File New Claim
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Claims List */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {claims.length === 0 ? (
              <Card>
                <CardContent className="py-16 text-center">
                  <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Claims Yet</h3>
                  <p className="text-muted-foreground mb-6">
                    You haven't filed any insurance claims
                  </p>
                  <Button asChild>
                    <Link href="/claims/new">
                      <Plus className="h-4 w-4 mr-2" />
                      File Your First Claim
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {claims.map((claim) => (
                  <Card key={claim.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <CardTitle className="text-lg">{claim.claimNumber}</CardTitle>
                            {getStatusBadge(claim.status)}
                          </div>
                          <CardDescription className="text-base">
                            {claim.policyName}
                          </CardDescription>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold">
                            KES {claim.amount.toLocaleString()}
                          </div>
                          <p className="text-sm text-muted-foreground">Claim Amount</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Policy Number</p>
                          <p className="font-medium">{claim.policyNumber}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Claim Type</p>
                          <p className="font-medium">{claim.type}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Date Submitted</p>
                          <p className="font-medium">{claim.dateSubmitted}</p>
                        </div>
                      </div>
                      <div className="mb-4">
                        <p className="text-sm text-muted-foreground mb-1">Description</p>
                        <p className="text-sm">{claim.description}</p>
                      </div>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
