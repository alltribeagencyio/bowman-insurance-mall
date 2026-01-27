'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
} from 'lucide-react'

// Mock policy data
const policyData = {
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

export default function PolicyDetailPage() {
  const params = useParams()
  const [showFullDescription, setShowFullDescription] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/policies">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Policies
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
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <CardTitle className="text-2xl mb-2">
                          {policyData.name}
                        </CardTitle>
                        <div className="flex items-center gap-2 mb-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{policyData.company.name}</span>
                        </div>
                      </div>
                      <Badge>{policyData.category}</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                        <span className="font-medium">{policyData.company.rating}</span>
                        <span className="text-muted-foreground">
                          ({policyData.company.reviews} reviews)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
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

            {/* Key Features */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
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

            {/* Exclusions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-red-500" />
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

            {/* Requirements */}
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
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Price Card */}
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Get This Policy</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
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
                  <Button className="w-full" size="lg">
                    Get Instant Quote
                  </Button>
                  <Button variant="outline" className="w-full">
                    Add to Compare
                  </Button>
                </div>

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

            {/* Similar Policies */}
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
          </div>
        </div>
      </div>
    </div>
  )
}
