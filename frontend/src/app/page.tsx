'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Search, Car, Heart, Users, Home as HomeIcon, Plane, Building2, Briefcase, Shield, TrendingUp, Filter, Clock, CheckCircle, Loader2 } from 'lucide-react'
import { getFeaturedPolicies } from '@/lib/api/categories'
import type { PolicyType } from '@/lib/api/categories'
import { toast } from 'sonner'
import { getErrorStatus } from '@/lib/api/errors'

// Icon mapping for categories
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Car,
  Heart,
  Users,
  Home: HomeIcon,
  Plane,
  Building2,
  Briefcase,
  Shield,
}

// Static categories - these don't change so no need to fetch from API
const staticCategories = [
  { id: 1, name: 'Motor', slug: 'motor', icon: 'Car' },
  { id: 2, name: 'Medical', slug: 'medical', icon: 'Heart' },
  { id: 3, name: 'Travel', slug: 'travel', icon: 'Plane' },
  { id: 4, name: 'Business', slug: 'business', icon: 'Building2' },
  { id: 5, name: 'Home', slug: 'home', icon: 'Home' },
  { id: 6, name: 'Life', slug: 'life', icon: 'Users' },
]

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [featuredPolicies, setFeaturedPolicies] = useState<PolicyType[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        const featuredData = await getFeaturedPolicies()
        setFeaturedPolicies(featuredData || [])
      } catch (error: unknown) {
        console.error('Failed to load homepage data', error)
        toast.error('Failed to load policies. Please refresh the page.')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

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

          {/* Product Categories - Static, no loading needed */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-6xl mx-auto">
            {staticCategories.map((category) => {
              const Icon = iconMap[category.icon] || Shield
              return (
                <Link key={category.id} href={`/policies/${category.slug}`}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                    <CardContent className="pt-6 text-center">
                      <Icon className="h-10 w-10 text-primary mx-auto mb-2" />
                      <p className="text-sm font-medium whitespace-nowrap">{category.name}</p>
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

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : featuredPolicies.length === 0 ? (
            <div className="text-center py-12">
              <Shield className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Featured Policies Available</h3>
              <p className="text-muted-foreground mb-4">Featured policies will appear here once they are added to the system.</p>
              <Button asChild>
                <Link href="/policies">Browse All Policies</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredPolicies.map((policy) => (
                <Card key={policy.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <CardTitle className="text-lg">{policy.name}</CardTitle>
                        <CardDescription className="mt-1">
                          {policy.company_name}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="inline-block px-2 py-1 rounded text-xs bg-primary/10 text-primary">
                      {policy.category_name}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="text-2xl font-bold">
                        KES {parseFloat(policy.base_premium).toLocaleString()}
                      </div>
                      <p className="text-sm text-muted-foreground">starting from</p>
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
          )}

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
