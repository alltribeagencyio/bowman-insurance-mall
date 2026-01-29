'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, XCircle, Star, ArrowLeft } from 'lucide-react'

// Mock data for comparison
const policies = [
  {
    id: '1',
    name: 'Comprehensive Motor Cover',
    company: 'Jubilee Insurance',
    rating: 4.5,
    premium: 15000,
    coverage: 2000000,
    features: {
      'Accident Cover': true,
      'Third Party': true,
      'Theft Protection': true,
      'Roadside Assistance': true,
      'Windscreen Cover': true,
      'Personal Accident': true,
      'Flood Cover': true,
      'Courtesy Car': true,
      'Fire Damage': true,
      'Legal Expenses': false,
    },
    excess: 5000,
    claimTime: '7-14 days',
    minimumAge: 23,
  },
  {
    id: '2',
    name: 'Premium Motor Insurance',
    company: 'AAR Insurance',
    rating: 4.7,
    premium: 18000,
    coverage: 3000000,
    features: {
      'Accident Cover': true,
      'Third Party': true,
      'Theft Protection': true,
      'Roadside Assistance': true,
      'Windscreen Cover': true,
      'Personal Accident': true,
      'Flood Cover': true,
      'Courtesy Car': true,
      'Fire Damage': true,
      'Legal Expenses': true,
    },
    excess: 3000,
    claimTime: '5-10 days',
    minimumAge: 21,
  },
  {
    id: '3',
    name: 'Third Party Motor Cover',
    company: 'Britam',
    rating: 4.3,
    premium: 8000,
    coverage: 1000000,
    features: {
      'Accident Cover': false,
      'Third Party': true,
      'Theft Protection': false,
      'Roadside Assistance': false,
      'Windscreen Cover': false,
      'Personal Accident': true,
      'Flood Cover': false,
      'Courtesy Car': false,
      'Fire Damage': true,
      'Legal Expenses': false,
    },
    excess: 10000,
    claimTime: '14-21 days',
    minimumAge: 25,
  },
]

export default function ComparePoliciesPage() {
  const [selectedPolicies] = useState(policies)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Compare Policies</h1>
          <p className="text-muted-foreground">
            Compare {selectedPolicies.length} policies side by side
          </p>
        </div>

        {/* Comparison Table */}
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            <div className="grid grid-cols-4 gap-4">
              {/* Feature Names Column */}
              <div className="space-y-4">
                <Card className="h-[280px] bg-muted/50">
                  <CardContent className="pt-6">
                    <p className="font-semibold text-lg">Compare Features</p>
                  </CardContent>
                </Card>

                {/* Feature rows */}
                <Card>
                  <CardContent className="py-4">
                    <p className="font-medium">Premium (Monthly)</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="py-4">
                    <p className="font-medium">Coverage Amount</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="py-4">
                    <p className="font-medium">Rating</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="py-4">
                    <p className="font-medium">Excess</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="py-4">
                    <p className="font-medium">Claim Processing</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="py-4">
                    <p className="font-medium">Minimum Age</p>
                  </CardContent>
                </Card>

                {/* Features Section Header */}
                <Card className="bg-muted/50">
                  <CardContent className="py-4">
                    <p className="font-semibold">Coverage Features</p>
                  </CardContent>
                </Card>

                {Object.keys(policies[0].features).map((feature) => (
                  <Card key={feature}>
                    <CardContent className="py-4">
                      <p className="text-sm">{feature}</p>
                    </CardContent>
                  </Card>
                ))}

                {/* Action Row */}
                <Card className="bg-muted/50">
                  <CardContent className="py-4">
                    <p className="font-medium">Actions</p>
                  </CardContent>
                </Card>
              </div>

              {/* Policy Columns */}
              {selectedPolicies.map((policy) => (
                <div key={policy.id} className="space-y-4">
                  {/* Policy Header */}
                  <Card className="h-[280px]">
                    <CardHeader>
                      <CardTitle className="text-lg">{policy.name}</CardTitle>
                      <Badge className="w-fit">{policy.company}</Badge>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-1 mb-4">
                        <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                        <span className="font-medium">{policy.rating}</span>
                      </div>
                      <div className="text-2xl font-bold">
                        KES {policy.premium.toLocaleString()}
                      </div>
                      <p className="text-sm text-muted-foreground">per month</p>
                    </CardContent>
                  </Card>

                  {/* Premium */}
                  <Card>
                    <CardContent className="py-4">
                      <p className="font-bold text-lg">
                        KES {policy.premium.toLocaleString()}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Coverage */}
                  <Card>
                    <CardContent className="py-4">
                      <p className="font-medium">
                        KES {policy.coverage.toLocaleString()}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Rating */}
                  <Card>
                    <CardContent className="py-4">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                        <span className="font-medium">{policy.rating}</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Excess */}
                  <Card>
                    <CardContent className="py-4">
                      <p>KES {policy.excess.toLocaleString()}</p>
                    </CardContent>
                  </Card>

                  {/* Claim Time */}
                  <Card>
                    <CardContent className="py-4">
                      <p>{policy.claimTime}</p>
                    </CardContent>
                  </Card>

                  {/* Min Age */}
                  <Card>
                    <CardContent className="py-4">
                      <p>{policy.minimumAge} years</p>
                    </CardContent>
                  </Card>

                  {/* Features Section Header */}
                  <Card className="bg-muted/50">
                    <CardContent className="py-4">
                      <p className="text-sm text-muted-foreground">Features</p>
                    </CardContent>
                  </Card>

                  {/* Feature Checks */}
                  {Object.entries(policy.features).map(([feature, included]) => (
                    <Card key={feature}>
                      <CardContent className="py-4 flex items-center justify-center">
                        {included ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                      </CardContent>
                    </Card>
                  ))}

                  {/* Actions */}
                  <Card className="bg-muted/50">
                    <CardContent className="py-4 space-y-2">
                      <Button className="w-full" size="sm" asChild>
                        <Link href={`/purchase/${policy.id}`}>
                          Buy Cover
                        </Link>
                      </Button>
                      <Button variant="outline" className="w-full" size="sm" asChild>
                        <Link href={`/policies/details/${policy.id}`}>
                          View Details
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <Card className="mt-8">
          <CardContent className="py-8 text-center">
            <h3 className="text-xl font-bold mb-2">Still Undecided?</h3>
            <p className="text-muted-foreground mb-4">
              Let our experts help you choose the right policy
            </p>
            <Button size="lg">Talk to an Expert</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
