'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Search, Car, Heart, Users, Home as HomeIcon, Plane, Building2, Briefcase, Shield, TrendingUp, Filter, Clock, CheckCircle } from 'lucide-react'

// Mock data - will be replaced with API data
const policyCategories = [
  {
    id: 'motor',
    name: 'Motor Insurance',
    icon: Car,
    description: 'Comprehensive vehicle coverage',
    policyCount: 15,
    startingPrice: 12000,
  },
  {
    id: 'medical',
    name: 'Medical Insurance',
    icon: Heart,
    description: 'Health insurance plans for you and your family',
    policyCount: 12,
    startingPrice: 5000,
  },
  {
    id: 'life',
    name: 'Life Insurance',
    icon: Users,
    description: 'Protect your loved ones\' future',
    policyCount: 18,
    startingPrice: 3000,
  },
  {
    id: 'home',
    name: 'Home Insurance',
    icon: HomeIcon,
    description: 'Property and contents protection',
    policyCount: 10,
    startingPrice: 8000,
  },
  {
    id: 'travel',
    name: 'Travel Insurance',
    icon: Plane,
    description: 'International and domestic travel cover',
    policyCount: 8,
    startingPrice: 1500,
  },
  {
    id: 'business',
    name: 'Business Insurance',
    icon: Building2,
    description: 'Protect your business assets',
    policyCount: 14,
    startingPrice: 25000,
  },
]

const featuredPolicies = [
  {
    id: '1',
    name: 'Comprehensive Motor Cover',
    company: 'Jubilee Insurance',
    category: 'Motor Insurance',
    premium: 15000,
    coverage: 2000000,
    rating: 4.5,
    features: ['Accident cover', 'Third party', 'Theft protection', 'Roadside assistance'],
  },
  {
    id: '2',
    name: 'Family Health Plan',
    company: 'AAR Insurance',
    category: 'Medical Insurance',
    premium: 12000,
    coverage: 5000000,
    rating: 4.8,
    features: ['Outpatient', 'Inpatient', 'Maternity', 'Dental'],
  },
  {
    id: '3',
    name: 'Whole Life Cover',
    company: 'Britam',
    category: 'Life Insurance',
    premium: 5000,
    coverage: 10000000,
    rating: 4.6,
    features: ['Death benefit', 'Savings plan', 'Loan facility', 'Tax benefits'],
  },
  {
    id: '4',
    name: 'Home & Contents Insurance',
    company: 'CIC Insurance',
    category: 'Home Insurance',
    premium: 8500,
    coverage: 3000000,
    rating: 4.4,
    features: ['Fire cover', 'Burglary protection', 'Contents cover', 'Natural disasters'],
  },
  {
    id: '5',
    name: 'International Travel Cover',
    company: 'Madison Insurance',
    category: 'Travel Insurance',
    premium: 2500,
    coverage: 1000000,
    rating: 4.7,
    features: ['Medical emergencies', 'Trip cancellation', 'Lost luggage', 'Flight delay'],
  },
  {
    id: '6',
    name: 'Business Liability Insurance',
    company: 'APA Insurance',
    category: 'Business Insurance',
    premium: 28000,
    coverage: 5000000,
    rating: 4.5,
    features: ['Public liability', 'Professional indemnity', 'Property damage', 'Legal expenses'],
  },
]

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/10 to-background py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">
              Find the Perfect Insurance
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Compare policies from top insurers in Kenya
            </p>

            {/* Search Bar */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search policies, insurers, or coverage..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12"
                />
              </div>
              <Button size="lg">
                <Search className="h-5 w-5 mr-2" />
                Search
              </Button>
            </div>
          </div>

          {/* Product Categories */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-6xl mx-auto">
            {policyCategories.map((category) => {
              const Icon = category.icon
              return (
                <Link key={category.id} href={`/policies/${category.id}`}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                    <CardContent className="pt-6 text-center">
                      <Icon className="h-10 w-10 text-primary mx-auto mb-2" />
                      <p className="text-sm font-medium">{category.name}</p>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Popular Policies */}
      <section className="py-12 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">Popular Policies</h2>
            <p className="text-muted-foreground">
              Top choices from our customers across all categories
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredPolicies.map((policy) => (
              <Card key={policy.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <CardTitle className="text-lg">{policy.name}</CardTitle>
                      <CardDescription className="mt-1">
                        {policy.company}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      <span className="text-amber-500">★</span>
                      <span className="font-medium">{policy.rating}</span>
                    </div>
                  </div>
                  <div className="inline-block px-2 py-1 rounded text-xs bg-primary/10 text-primary">
                    {policy.category}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="text-2xl font-bold">
                      KES {policy.premium.toLocaleString()}
                    </div>
                    <p className="text-sm text-muted-foreground">per month</p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Coverage</p>
                    <p className="font-semibold">
                      Up to KES {policy.coverage.toLocaleString()}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Key Features</p>
                    <ul className="space-y-1">
                      {policy.features.slice(0, 3).map((feature, idx) => (
                        <li key={idx} className="text-sm flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
                <CardFooter className="flex gap-2">
                  <Button variant="outline" className="flex-1" asChild>
                    <Link href={`/policies/details/${policy.id}`}>
                      View Details
                    </Link>
                  </Button>
                  <Button className="flex-1" asChild>
                    <Link href={`/purchase/${policy.id}`}>
                      Buy Cover
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          <div className="text-center mt-8">
            <Button size="lg" variant="outline">
              View All Policies
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <Card className="bg-primary text-primary-foreground">
            <CardContent className="py-12 text-center">
              <h2 className="text-3xl font-bold mb-4">
                Need Help Choosing?
              </h2>
              <p className="text-xl mb-8 opacity-90">
                Our insurance experts are here to guide you
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="secondary">
                  Talk to an Expert
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10"
                >
                  Compare Policies
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
