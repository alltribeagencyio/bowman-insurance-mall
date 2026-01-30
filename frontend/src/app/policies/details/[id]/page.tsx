'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Shield,
  FileText,
  Phone,
  Mail,
  Building2,
  Star,
  ChevronDown,
  ChevronUp,
  Download,
  Clock,
  DollarSign,
  Calendar,
  User,
  AlertCircle,
  RefreshCw,
  Ban,
  History,
  Users,
  FileCheck,
  Eye,
  Trash2
} from 'lucide-react'
import { toast } from 'sonner'

// Mock policy data - for browsing policies
const browsingPolicyData = {
  id: '1',
  name: 'Comprehensive Motor Cover',
  company: {
    name: 'Jubilee Insurance',
    logo: '/logos/jubilee.png',
    rating: 4.5,
    reviews: 1250,
  },
  category: 'Motor Insurance',
  premium: 15000,
  paymentFrequency: 'monthly',
  coverage: 2000000,
  description:
    'Our comprehensive motor insurance policy provides complete protection for your vehicle against accidents, theft, and third-party liabilities. Get peace of mind with our 24/7 claims support and nationwide coverage.',
  features: [
    'Accident damage cover up to vehicle value',
    'Third party liability cover',
    'Theft and vandalism protection',
    '24/7 roadside assistance',
    'Windscreen and glass cover',
    'Personal accident cover for driver',
    'Flood and natural disaster cover',
    'Courtesy car while in repair',
  ],
  exclusions: [
    'Wear and tear',
    'Mechanical or electrical breakdowns',
    'Driving under influence of alcohol',
    'Use of vehicle for racing',
    'Unroadworthy vehicles',
  ],
  requirements: [
    'Valid driving license',
    'Vehicle registration certificate (Logbook)',
    'Copy of National ID',
    'Vehicle valuation report (for vehicles above KES 2M)',
  ],
  terms: {
    minimumAge: 23,
    maximumAge: 70,
    excessAmount: 5000,
    claimProcessingTime: '7-14 business days',
  },
}

// Mock owned policy data - for my policies view
const ownedPolicyData = {
  ...browsingPolicyData,
  policy_number: 'POL-2026-001234',
  status: 'active',
  start_date: '2026-01-01',
  end_date: '2026-12-31',
  vehicle_details: {
    make: 'Toyota',
    model: 'Land Cruiser',
    year: 2024,
    registration: 'KCE 123A',
    value: 8500000
  },
  payment_history: [
    {
      id: '1',
      date: '2026-01-15',
      amount: 15000,
      status: 'completed',
      method: 'M-Pesa',
      transaction_number: 'TXN-2026-001234'
    },
    {
      id: '2',
      date: '2025-12-15',
      amount: 15000,
      status: 'completed',
      method: 'Card',
      transaction_number: 'TXN-2025-012543'
    },
    {
      id: '3',
      date: '2025-11-15',
      amount: 15000,
      status: 'completed',
      method: 'M-Pesa',
      transaction_number: 'TXN-2025-011234'
    }
  ],
  claims_history: [
    {
      id: '1',
      claim_number: 'CLM-2026-000456',
      date: '2026-01-10',
      type: 'Accident Damage',
      amount: 450000,
      status: 'approved',
      description: 'Rear-end collision damage to bumper and lights'
    }
  ],
  documents: [
    {
      id: '1',
      name: 'Insurance Certificate',
      type: 'certificate',
      file_type: 'PDF',
      size: 245600,
      uploaded_date: '2026-01-15T10:30:00Z',
      verified: true
    },
    {
      id: '2',
      name: 'Premium Payment Receipt - Jan 2026',
      type: 'receipt',
      file_type: 'PDF',
      size: 128000,
      uploaded_date: '2026-01-15T14:20:00Z',
      verified: true
    },
    {
      id: '3',
      name: 'Vehicle Logbook',
      type: 'other',
      file_type: 'PDF',
      size: 189000,
      uploaded_date: '2026-01-01T09:00:00Z',
      verified: true
    }
  ],
  beneficiaries: [
    {
      id: '1',
      name: 'Jane Doe',
      relationship: 'Spouse',
      percentage: 60,
      is_primary: true
    },
    {
      id: '2',
      name: 'John Doe Jr.',
      relationship: 'Child',
      percentage: 40,
      is_primary: false
    }
  ],
  timeline: [
    {
      date: '2026-01-15',
      event: 'Payment Received',
      description: 'Premium payment of KES 15,000 processed successfully',
      type: 'payment'
    },
    {
      date: '2026-01-10',
      event: 'Claim Approved',
      description: 'Claim CLM-2026-000456 approved for KES 450,000',
      type: 'claim'
    },
    {
      date: '2026-01-01',
      event: 'Policy Activated',
      description: 'Policy coverage started',
      type: 'policy'
    }
  ]
}

export default function PolicyDetailPage() {
  const params = useParams()
  const [showFullDescription, setShowFullDescription] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  // Check if this is a user's owned policy (from /dashboard/my-policies)
  // vs browsing policy (from /policies)
  const isOwnedPolicy = true // TODO: Determine based on route or policy ownership

  const policyData = isOwnedPolicy ? ownedPolicyData : browsingPolicyData

  const handleRenewPolicy = () => {
    toast.success('Renewal process started')
    // TODO: Navigate to renewal flow
  }

  const handleCancelPolicy = () => {
    if (confirm('Are you sure you want to cancel this policy? This action may affect your coverage.')) {
      toast.error('Policy cancellation is not yet implemented')
    }
  }

  const handleDownloadDocument = (docId: string, docName: string) => {
    toast.success(`Downloading ${docName}`)
    // TODO: Implement actual download
  }

  const handleDownloadAllDocuments = () => {
    toast.success('Preparing ZIP file with all documents')
    // TODO: Implement ZIP download
  }

  const getDaysRemaining = () => {
    if (!isOwnedPolicy) return 0
    const endDate = new Date(ownedPolicyData.end_date)
    const today = new Date()
    const days = Math.floor((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return Math.max(0, days)
  }

  const getStatusBadgeVariant = (status: string): "default" | "secondary" | "destructive" => {
    switch (status) {
      case 'active': return 'default'
      case 'expired': return 'destructive'
      case 'pending': return 'secondary'
      default: return 'secondary'
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href={isOwnedPolicy ? "/dashboard/my-policies" : "/policies"}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to {isOwnedPolicy ? 'My Policies' : 'Policies'}
            </Link>
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Policy Header */}
            <Card>
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Shield className="h-8 w-8 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2 flex-wrap gap-2">
                      <div>
                        <CardTitle className="text-2xl mb-2">
                          {policyData.name}
                        </CardTitle>
                        {isOwnedPolicy && (
                          <div className="text-sm text-muted-foreground mb-2">
                            Policy No: <span className="font-mono">{ownedPolicyData.policy_number}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 mb-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{policyData.company.name}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Badge>{policyData.category}</Badge>
                        {isOwnedPolicy && (
                          <Badge variant={getStatusBadgeVariant(ownedPolicyData.status)}>
                            {ownedPolicyData.status}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm flex-wrap">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                        <span className="font-medium">{policyData.company.rating}</span>
                        <span className="text-muted-foreground">
                          ({policyData.company.reviews} reviews)
                        </span>
                      </div>
                      {isOwnedPolicy && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            {getDaysRemaining()} days remaining
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              {isOwnedPolicy && ownedPolicyData.vehicle_details && (
                <CardContent className="border-t">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Vehicle</p>
                      <p className="font-medium">
                        {ownedPolicyData.vehicle_details.year} {ownedPolicyData.vehicle_details.make} {ownedPolicyData.vehicle_details.model}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Registration</p>
                      <p className="font-medium font-mono">{ownedPolicyData.vehicle_details.registration}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Value</p>
                      <p className="font-medium">KES {ownedPolicyData.vehicle_details.value.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Coverage Period</p>
                      <p className="font-medium">
                        {new Date(ownedPolicyData.start_date).toLocaleDateString()} - {new Date(ownedPolicyData.end_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Tabs for Owned Policies */}
            {isOwnedPolicy ? (
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="payments">Payments</TabsTrigger>
                  <TabsTrigger value="claims">Claims</TabsTrigger>
                  <TabsTrigger value="documents">Documents</TabsTrigger>
                  <TabsTrigger value="beneficiaries">Beneficiaries</TabsTrigger>
                  <TabsTrigger value="timeline">Timeline</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                  {/* Description */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Policy Description</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div
                        className={`text-muted-foreground ${
                          !showFullDescription && 'line-clamp-3'
                        }`}
                      >
                        {policyData.description}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowFullDescription(!showFullDescription)}
                        className="mt-2"
                      >
                        {showFullDescription ? (
                          <>
                            <ChevronUp className="h-4 w-4 mr-1" />
                            Show Less
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-4 w-4 mr-1" />
                            Read More
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>

                  {/* What's Covered */}
                  <Card>
                    <CardHeader>
                      <CardTitle>
                        What's Covered
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {policyData.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  {/* What's Not Covered */}
                  <Card>
                    <CardHeader>
                      <CardTitle>
                        What's Not Covered
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {policyData.exclusions.map((exclusion, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                            <span>{exclusion}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  {/* Terms & Conditions */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Terms & Conditions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Minimum Age:</span>
                        <span className="font-medium">{policyData.terms.minimumAge} years</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Maximum Age:</span>
                        <span className="font-medium">{policyData.terms.maximumAge} years</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Excess Amount:</span>
                        <span className="font-medium">
                          KES {policyData.terms.excessAmount.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Claim Processing:</span>
                        <span className="font-medium">{policyData.terms.claimProcessingTime}</span>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Payments Tab */}
                <TabsContent value="payments" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <DollarSign className="h-5 w-5" />
                          Payment History
                        </CardTitle>
                        <Button variant="outline" asChild>
                          <Link href="/dashboard/payments">View All Payments</Link>
                        </Button>
                      </div>
                      <CardDescription>
                        All payments made for this policy
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {ownedPolicyData.payment_history.length === 0 ? (
                        <div className="text-center py-8">
                          <DollarSign className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                          <p className="text-muted-foreground">No payment history yet</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {ownedPolicyData.payment_history.map((payment) => (
                            <div key={payment.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                              <div className="flex items-start gap-3">
                                <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900">
                                  <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                                </div>
                                <div>
                                  <p className="font-medium">KES {payment.amount.toLocaleString()}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {new Date(payment.date).toLocaleDateString()} • {payment.method}
                                  </p>
                                  <p className="text-xs text-muted-foreground font-mono">
                                    {payment.transaction_number}
                                  </p>
                                </div>
                              </div>
                              <Badge variant="default">Paid</Badge>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Claims Tab */}
                <TabsContent value="claims" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="h-5 w-5" />
                          Claims History
                        </CardTitle>
                        <Button asChild>
                          <Link href={`/claims/new?policy=${params.id}`}>File New Claim</Link>
                        </Button>
                      </div>
                      <CardDescription>
                        All claims filed under this policy
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {ownedPolicyData.claims_history.length === 0 ? (
                        <div className="text-center py-8">
                          <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                          <p className="text-muted-foreground mb-4">No claims filed yet</p>
                          <Button asChild>
                            <Link href={`/claims/new?policy=${params.id}`}>File Your First Claim</Link>
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {ownedPolicyData.claims_history.map((claim) => (
                            <Card key={claim.id}>
                              <CardContent className="pt-6">
                                <div className="flex items-start justify-between mb-3">
                                  <div>
                                    <h3 className="font-semibold">{claim.type}</h3>
                                    <p className="text-sm text-muted-foreground font-mono">
                                      {claim.claim_number}
                                    </p>
                                  </div>
                                  <Badge variant={claim.status === 'approved' ? 'default' : 'secondary'}>
                                    {claim.status}
                                  </Badge>
                                </div>
                                <p className="text-sm mb-3">{claim.description}</p>
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-muted-foreground">
                                    {new Date(claim.date).toLocaleDateString()}
                                  </span>
                                  <span className="font-semibold">
                                    KES {claim.amount.toLocaleString()}
                                  </span>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Documents Tab */}
                <TabsContent value="documents" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <FileCheck className="h-5 w-5" />
                          Policy Documents
                        </CardTitle>
                        <Button variant="outline" onClick={handleDownloadAllDocuments}>
                          <Download className="h-4 w-4 mr-2" />
                          Download All (ZIP)
                        </Button>
                      </div>
                      <CardDescription>
                        All documents related to this policy
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {ownedPolicyData.documents.length === 0 ? (
                        <div className="text-center py-8">
                          <FileCheck className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                          <p className="text-muted-foreground">No documents available</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 gap-4">
                          {ownedPolicyData.documents.map((doc) => (
                            <div key={doc.id} className="flex items-center justify-between border rounded-lg p-4">
                              <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
                                  <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                  <p className="font-medium">{doc.name}</p>
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <span>{doc.file_type}</span>
                                    <span>•</span>
                                    <span>{(doc.size / 1024).toFixed(1)} KB</span>
                                    {doc.verified && (
                                      <>
                                        <span>•</span>
                                        <Badge variant="outline" className="h-5">
                                          <CheckCircle2 className="h-3 w-3 mr-1" />
                                          Verified
                                        </Badge>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDownloadDocument(doc.id, doc.name)}
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Beneficiaries Tab */}
                <TabsContent value="beneficiaries" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <Users className="h-5 w-5" />
                          Policy Beneficiaries
                        </CardTitle>
                        <Button variant="outline" asChild>
                          <Link href="/dashboard/profile?tab=beneficiaries">Manage Beneficiaries</Link>
                        </Button>
                      </div>
                      <CardDescription>
                        People who will receive benefits from this policy
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {ownedPolicyData.beneficiaries.length === 0 ? (
                        <div className="text-center py-8">
                          <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                          <p className="text-muted-foreground mb-4">No beneficiaries added yet</p>
                          <Button asChild>
                            <Link href="/dashboard/profile?tab=beneficiaries">Add Beneficiaries</Link>
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {ownedPolicyData.beneficiaries.map((beneficiary) => (
                            <div key={beneficiary.id} className="flex items-center justify-between border rounded-lg p-4">
                              <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900">
                                  <User className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <p className="font-medium">{beneficiary.name}</p>
                                    {beneficiary.is_primary && (
                                      <Badge variant="default">Primary</Badge>
                                    )}
                                  </div>
                                  <p className="text-sm text-muted-foreground">
                                    {beneficiary.relationship}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold text-lg">{beneficiary.percentage}%</p>
                                <p className="text-xs text-muted-foreground">Allocation</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Timeline Tab */}
                <TabsContent value="timeline" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <History className="h-5 w-5" />
                        Policy Timeline
                      </CardTitle>
                      <CardDescription>
                        Complete history of events for this policy
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="relative space-y-6">
                        {ownedPolicyData.timeline.map((event, idx) => (
                          <div key={idx} className="relative flex gap-4 pb-6 last:pb-0">
                            <div className="flex flex-col items-center">
                              <div className={`p-2 rounded-full ${
                                event.type === 'payment' ? 'bg-green-100 dark:bg-green-900' :
                                event.type === 'claim' ? 'bg-blue-100 dark:bg-blue-900' :
                                'bg-purple-100 dark:bg-purple-900'
                              }`}>
                                {event.type === 'payment' && <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />}
                                {event.type === 'claim' && <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
                                {event.type === 'policy' && <Shield className="h-4 w-4 text-purple-600 dark:text-purple-400" />}
                              </div>
                              {idx < ownedPolicyData.timeline.length - 1 && (
                                <div className="w-0.5 h-full bg-border mt-2" />
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">{event.event}</p>
                              <p className="text-sm text-muted-foreground">{event.description}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {new Date(event.date).toLocaleDateString()} at {new Date(event.date).toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            ) : (
              /* Non-owned policy content */
              <div className="space-y-6">
                <Card>
                  <CardContent className="pt-6">
                    <div
                      className={`text-muted-foreground ${
                        !showFullDescription && 'line-clamp-3'
                      }`}
                    >
                      {policyData.description}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowFullDescription(!showFullDescription)}
                      className="mt-2"
                    >
                      {showFullDescription ? (
                        <>
                          <ChevronUp className="h-4 w-4 mr-1" />
                          Show Less
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-4 w-4 mr-1" />
                          Read More
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>
                      What's Covered
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {policyData.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>
                      What's Not Covered
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {policyData.exclusions.map((exclusion, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                          <span>{exclusion}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Requirements
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {policyData.requirements.map((requirement, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                          <span>{requirement}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Terms & Conditions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Minimum Age:</span>
                      <span className="font-medium">{policyData.terms.minimumAge} years</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Maximum Age:</span>
                      <span className="font-medium">{policyData.terms.maximumAge} years</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Excess Amount:</span>
                      <span className="font-medium">
                        KES {policyData.terms.excessAmount.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Claim Processing:</span>
                      <span className="font-medium">{policyData.terms.claimProcessingTime}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Price/Action Card */}
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>{isOwnedPolicy ? 'Policy Actions' : 'Get This Policy'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {isOwnedPolicy ? (
                  <>
                    <div>
                      <div className="text-3xl font-bold">
                        KES {policyData.premium.toLocaleString()}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        per {policyData.paymentFrequency}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Status:</span>
                        <Badge variant={getStatusBadgeVariant(ownedPolicyData.status)}>
                          {ownedPolicyData.status}
                        </Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Days Remaining:</span>
                        <span className="font-medium">{getDaysRemaining()} days</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {/* Buy Cover button - always shown for purchasing additional cover */}
                      <Button className="w-full" size="lg" asChild>
                        <Link href={`/purchase/${params.id}`}>
                          <Shield className="h-4 w-4 mr-2" />
                          Buy Cover
                        </Link>
                      </Button>

                      {/* Policy-specific actions - only for owned policies */}
                      {ownedPolicyData.status === 'active' && (
                        <>
                          <Button variant="outline" className="w-full" asChild>
                            <Link href={`/payment/${params.id}`}>
                              <DollarSign className="h-4 w-4 mr-2" />
                              Make Payment
                            </Link>
                          </Button>
                          <Button variant="outline" className="w-full" asChild>
                            <Link href={`/claims/new?policy=${params.id}`}>
                              <FileText className="h-4 w-4 mr-2" />
                              File Claim
                            </Link>
                          </Button>
                        </>
                      )}
                      {ownedPolicyData.status === 'expired' && (
                        <Button className="w-full" onClick={handleRenewPolicy}>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Renew Policy
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={handleCancelPolicy}
                      >
                        <Ban className="h-4 w-4 mr-2" />
                        Cancel Policy
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <div className="text-3xl font-bold">
                        KES {policyData.premium.toLocaleString()}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        per {policyData.paymentFrequency}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Coverage:</span>
                        <span className="font-medium">
                          KES {policyData.coverage.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Excess:</span>
                        <span className="font-medium">
                          KES {policyData.terms.excessAmount.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Button className="w-full" size="lg" asChild>
                        <Link href={`/purchase/${params.id}`}>
                          <Shield className="h-4 w-4 mr-2" />
                          Buy Cover
                        </Link>
                      </Button>
                      <Button variant="outline" className="w-full">
                        Add to Compare
                      </Button>
                    </div>
                  </>
                )}

                <div className="pt-4 border-t">
                  <p className="text-xs text-muted-foreground mb-3">
                    Need help? Contact us
                  </p>
                  <div className="space-y-2">
                    <Button variant="ghost" size="sm" className="w-full justify-start">
                      <Phone className="h-4 w-4 mr-2" />
                      Call: 0800 123 456
                    </Button>
                    <Button variant="ghost" size="sm" className="w-full justify-start">
                      <Mail className="h-4 w-4 mr-2" />
                      Email Support
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Similar Policies (only for browsing) */}
            {!isOwnedPolicy && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Similar Policies</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[1, 2, 3].map((item) => (
                    <div key={item} className="space-y-2">
                      <h4 className="font-medium">Third Party Motor Cover</h4>
                      <p className="text-sm text-muted-foreground">Britam Insurance</p>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">KES 8,000/mo</span>
                        <Button size="sm" variant="ghost" asChild>
                          <Link href={`/policies/details/${item}`}>View</Link>
                        </Button>
                      </div>
                      {item < 3 && <div className="border-b pt-2" />}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
