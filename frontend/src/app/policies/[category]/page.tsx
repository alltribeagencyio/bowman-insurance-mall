'use client'

import { useState, use} from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Search, Filter, SlidersHorizontal, ArrowLeft, Heart, Car, Users, Home, Plane, Building2 } from 'lucide-react'

// Mock policies data categorized by insurance type and company
const mockPoliciesByCategory: Record<string, any[]> = {
  medical: [
    {
      id: 'm1',
      name: 'Afya Plus',
      company: 'AAR Insurance',
      companyLogo: '/logos/aar.png',
      category: 'Medical Insurance',
      premium: 12000,
      coverage: 5000000,
      rating: 4.8,
      features: ['Outpatient cover', 'Inpatient cover', 'Maternity', 'Dental & Optical'],
      description: 'Comprehensive health coverage for individuals and families',
    },
    {
      id: 'm2',
      name: 'Jamii Plus',
      company: 'Jubilee Insurance',
      companyLogo: '/logos/jubilee.png',
      category: 'Medical Insurance',
      premium: 10500,
      coverage: 4000000,
      rating: 4.6,
      features: ['Inpatient', 'Outpatient', 'Specialist consultation', 'Chronic illness cover'],
      description: 'Affordable family health insurance',
    },
    {
      id: 'm3',
      name: 'Smart Health',
      company: 'Britam',
      companyLogo: '/logos/britam.png',
      category: 'Medical Insurance',
      premium: 15000,
      coverage: 10000000,
      rating: 4.9,
      features: ['Unlimited outpatient', 'Inpatient', 'Maternity', 'Emergency evacuation'],
      description: 'Premium health insurance with extensive coverage',
    },
    {
      id: 'm4',
      name: 'Familia Care',
      company: 'CIC Insurance',
      companyLogo: '/logos/cic.png',
      category: 'Medical Insurance',
      premium: 8500,
      coverage: 3000000,
      rating: 4.5,
      features: ['Outpatient', 'Inpatient', 'Maternity', 'Optical'],
      description: 'Budget-friendly family health plan',
    },
    {
      id: 'm5',
      name: 'Mediplus Cover',
      company: 'Madison Insurance',
      companyLogo: '/logos/madison.png',
      category: 'Medical Insurance',
      premium: 11000,
      coverage: 6000000,
      rating: 4.7,
      features: ['Comprehensive outpatient', 'Inpatient', 'Dental', 'Maternity'],
      description: 'Complete medical coverage for families',
    },
  ],
  motor: [
    {
      id: 'mo1',
      name: 'Comprehensive Motor Cover',
      company: 'Jubilee Insurance',
      category: 'Motor Insurance',
      premium: 15000,
      coverage: 2000000,
      rating: 4.5,
      features: ['Accident cover', 'Third party liability', 'Theft protection', 'Roadside assistance'],
      description: 'Complete vehicle protection',
    },
    {
      id: 'mo2',
      name: 'Auto Shield',
      company: 'Britam',
      category: 'Motor Insurance',
      premium: 18000,
      coverage: 3000000,
      rating: 4.7,
      features: ['Comprehensive cover', 'Personal accident', 'Windscreen cover', '24/7 support'],
      description: 'Premium motor insurance',
    },
    {
      id: 'mo3',
      name: 'Drive Safe',
      company: 'AAR Insurance',
      category: 'Motor Insurance',
      premium: 12500,
      coverage: 1500000,
      rating: 4.4,
      features: ['Third party fire & theft', 'Emergency services', 'Towing services'],
      description: 'Affordable motor protection',
    },
  ],
  life: [
    {
      id: 'l1',
      name: 'Whole Life Cover',
      company: 'Britam',
      category: 'Life Insurance',
      premium: 5000,
      coverage: 10000000,
      rating: 4.6,
      features: ['Death benefit', 'Savings plan', 'Loan facility', 'Tax benefits'],
      description: 'Lifetime protection with savings',
    },
    {
      id: 'l2',
      name: 'Family Protection Plan',
      company: 'Jubilee Insurance',
      category: 'Life Insurance',
      premium: 7500,
      coverage: 15000000,
      rating: 4.8,
      features: ['Life cover', 'Education benefit', 'Critical illness', 'Last expense'],
      description: 'Comprehensive family life insurance',
    },
    {
      id: 'l3',
      name: 'Term Assurance',
      company: 'CIC Insurance',
      category: 'Life Insurance',
      premium: 3500,
      coverage: 5000000,
      rating: 4.3,
      features: ['Death benefit', 'Affordable premiums', 'Flexible terms'],
      description: 'Simple term life cover',
    },
  ],
  home: [
    {
      id: 'h1',
      name: 'Home Plus',
      company: 'Britam',
      category: 'Home Insurance',
      premium: 8000,
      coverage: 5000000,
      rating: 4.5,
      features: ['Building cover', 'Contents cover', 'Theft protection', 'Fire & water damage'],
      description: 'Complete home protection',
    },
    {
      id: 'h2',
      name: 'Property Guard',
      company: 'Jubilee Insurance',
      category: 'Home Insurance',
      premium: 10000,
      coverage: 8000000,
      rating: 4.6,
      features: ['Building & contents', 'Natural disasters', 'Personal liability', 'Alternative accommodation'],
      description: 'Premium property insurance',
    },
  ],
  travel: [
    {
      id: 't1',
      name: 'Travel Safe',
      company: 'AAR Insurance',
      category: 'Travel Insurance',
      premium: 1500,
      coverage: 1000000,
      rating: 4.4,
      features: ['Medical emergencies', 'Trip cancellation', 'Lost baggage', 'Flight delay'],
      description: 'Essential travel protection',
    },
    {
      id: 't2',
      name: 'Global Explorer',
      company: 'Britam',
      category: 'Travel Insurance',
      premium: 2500,
      coverage: 2000000,
      rating: 4.7,
      features: ['Worldwide cover', 'Emergency evacuation', 'Adventure sports', 'Repatriation'],
      description: 'Comprehensive international travel insurance',
    },
  ],
  business: [
    {
      id: 'b1',
      name: 'Business Shield',
      company: 'CIC Insurance',
      category: 'Business Insurance',
      premium: 25000,
      coverage: 20000000,
      rating: 4.5,
      features: ['Property damage', 'Business interruption', 'Public liability', 'Employee cover'],
      description: 'Complete SME protection',
    },
  ],
}

const categoryInfo: Record<string, { title: string; icon: any; description: string }> = {
  medical: {
    title: 'Medical Insurance',
    icon: Heart,
    description: 'Comprehensive health insurance plans from Kenya\'s top insurers',
  },
  motor: {
    title: 'Motor Insurance',
    icon: Car,
    description: 'Protect your vehicle with comprehensive motor insurance',
  },
  life: {
    title: 'Life Insurance',
    icon: Users,
    description: 'Secure your family\'s future with life insurance',
  },
  home: {
    title: 'Home Insurance',
    icon: Home,
    description: 'Protect your property and belongings',
  },
  travel: {
    title: 'Travel Insurance',
    icon: Plane,
    description: 'Travel with confidence and protection',
  },
  business: {
    title: 'Business Insurance',
    icon: Building2,
    description: 'Comprehensive protection for your business',
  },
}

interface CategoryPageProps {
  params: Promise<{ category: string }>
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const resolvedParams = use(params)
  const category = resolvedParams.category
  const router = useRouter()

  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('popular')

  const info = categoryInfo[category] || categoryInfo.medical
  const policies = mockPoliciesByCategory[category] || []
  const Icon = info.icon

  // Filter and sort policies
  const filteredPolicies = policies
    .filter((policy) =>
      policy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      policy.company.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'price-low') return a.premium - b.premium
      if (sortBy === 'price-high') return b.premium - a.premium
      if (sortBy === 'rating') return b.rating - a.rating
      return 0 // popular (default order)
    })

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-gradient-to-b from-primary/10 to-background py-12">
        <div className="container mx-auto px-4">
          <Button
            variant="ghost"
            className="mb-4"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <div className="flex items-center gap-4 mb-6">
            <div className="p-4 rounded-lg bg-primary/10">
              <Icon className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">{info.title}</h1>
              <p className="text-xl text-muted-foreground mt-2">
                {info.description}
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* Search */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by policy name or company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12"
              />
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-12 px-4 rounded-md border border-input bg-background"
            >
              <option value="popular">Most Popular</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>

            <Button variant="outline" size="lg">
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>

          <div className="mt-4 text-sm text-muted-foreground">
            Showing {filteredPolicies.length} {filteredPolicies.length === 1 ? 'policy' : 'policies'}
          </div>
        </div>
      </section>

      {/* Policies Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {filteredPolicies.length === 0 ? (
            <Card className="py-12">
              <CardContent className="text-center">
                <p className="text-muted-foreground text-lg">No policies found matching your search.</p>
                <Button className="mt-4" onClick={() => setSearchQuery('')}>
                  Clear Search
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPolicies.map((policy) => (
                <Card key={policy.id} className="hover:shadow-lg transition-shadow flex flex-col">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{policy.name}</CardTitle>
                        <CardDescription className="mt-1 font-medium">
                          {policy.company}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-1 text-sm bg-amber-50 dark:bg-amber-950 px-2 py-1 rounded">
                        <span className="text-amber-600 dark:text-amber-400">★</span>
                        <span className="font-medium text-amber-700 dark:text-amber-300">{policy.rating}</span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{policy.description}</p>
                  </CardHeader>

                  <CardContent className="space-y-4 flex-1">
                    <div>
                      <div className="text-3xl font-bold">
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
                      <ul className="space-y-1.5">
                        {policy.features.map((feature: string, idx: number) => (
                          <li key={idx} className="text-sm flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
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
                    <Button className="flex-1">Get Quote</Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}

          {/* Compare Button */}
          {filteredPolicies.length > 1 && (
            <div className="text-center mt-8">
              <Button size="lg" variant="outline" asChild>
                <Link href="/policies/compare">
                  Compare Selected Policies
                </Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 bg-muted/50">
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
                  Compare All Policies
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
