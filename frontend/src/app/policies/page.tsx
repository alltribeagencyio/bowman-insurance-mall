'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Search, Car, Heart, Users, Home, Plane, Building2, Briefcase, Shield, TrendingUp, Filter, Loader2 } from 'lucide-react'
import { getCategories, getPolicyTypes, type PolicyCategory, type PolicyType } from '@/lib/api/categories'
import { toast } from 'sonner'

// Icon mapping for categories
const categoryIcons: Record<string, any> = {
  'motor': Car,
  'medical': Heart,
  'life': Users,
  'home': Home,
  'travel': Plane,
  'business': Building2,
  'car': Car,
  'health': Heart,
  'property': Home,
}

export default function PoliciesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [categories, setCategories] = useState<PolicyCategory[]>([])
  const [featuredPolicies, setFeaturedPolicies] = useState<PolicyType[]>([])
  const [isLoadingCategories, setIsLoadingCategories] = useState(true)
  const [isLoadingPolicies, setIsLoadingPolicies] = useState(true)

  // Fetch categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setIsLoadingCategories(true)
        const data = await getCategories()
        setCategories(data)
      } catch (error) {
        console.error('Error loading categories:', error)
        toast.error('Failed to load insurance categories')
      } finally {
        setIsLoadingCategories(false)
      }
    }

    loadCategories()
  }, [])

  // Fetch policies when category or search changes
  useEffect(() => {
    const loadPolicies = async () => {
      try {
        setIsLoadingPolicies(true)
        const filters: any = {}

        if (selectedCategory) {
          filters.category = selectedCategory
        }

        if (searchQuery) {
          filters.search = searchQuery
        }

        const data = await getPolicyTypes(filters)
        setFeaturedPolicies(data.slice(0, 6)) // Show first 6 as featured
      } catch (error) {
        console.error('Error loading policies:', error)
        toast.error('Failed to load insurance policies')
      } finally {
        setIsLoadingPolicies(false)
      }
    }

    loadPolicies()
  }, [selectedCategory, searchQuery])

  const handleSearch = () => {
    // Search is already triggered by useEffect when searchQuery changes
    if (!searchQuery && !selectedCategory) {
      toast.info('Enter a search term or select a category')
    }
  }

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
              <Button size="lg" onClick={handleSearch}>
                <Search className="h-5 w-5 mr-2" />
                Search
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card>
              <CardContent className="pt-6 text-center">
                <Shield className="h-10 w-10 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold">50+</div>
                <p className="text-sm text-muted-foreground">Insurance Policies</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <Building2 className="h-10 w-10 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold">15+</div>
                <p className="text-sm text-muted-foreground">Partner Insurers</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <TrendingUp className="h-10 w-10 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold">5,000+</div>
                <p className="text-sm text-muted-foreground">Happy Customers</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Policy Categories */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">Browse by Category</h2>
            <p className="text-muted-foreground">
              Choose the type of insurance you need
            </p>
          </div>

          {isLoadingCategories ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No categories available</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category) => {
                const Icon = categoryIcons[category.slug] || categoryIcons[category.icon] || Shield
                return (
                  <Card
                    key={category.id}
                    className={`hover:shadow-lg transition-shadow cursor-pointer ${
                      selectedCategory === category.slug ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setSelectedCategory(selectedCategory === category.slug ? null : category.slug)}
                  >
                    <CardHeader>
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-lg bg-primary/10">
                          <Icon className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <CardTitle>{category.name}</CardTitle>
                          <CardDescription className="mt-2">
                            {category.description}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          {category.policy_count || 0} policies
                        </span>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" className="w-full" asChild>
                        <Link href={`/policies/${category.slug}`}>
                          View Policies
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* Featured Policies */}
      <section className="py-12 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">Featured Policies</h2>
            <p className="text-muted-foreground">
              Popular choices from our customers
            </p>
          </div>

          {isLoadingPolicies ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : featuredPolicies.length === 0 ? (
            <div className="text-center py-12">
              <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">
                {searchQuery || selectedCategory ? 'No policies match your search' : 'No policies available'}
              </p>
              {(searchQuery || selectedCategory) && (
                <Button variant="outline" onClick={() => { setSearchQuery(''); setSelectedCategory(null); }}>
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                      <p className="text-sm text-muted-foreground">base premium</p>
                    </div>

                    {(policy.min_coverage_amount || policy.max_coverage_amount) && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Coverage Range</p>
                        <p className="font-semibold text-sm">
                          {policy.min_coverage_amount && `KES ${parseFloat(policy.min_coverage_amount).toLocaleString()}`}
                          {policy.min_coverage_amount && policy.max_coverage_amount && ' - '}
                          {policy.max_coverage_amount && `KES ${parseFloat(policy.max_coverage_amount).toLocaleString()}`}
                        </p>
                      </div>
                    )}

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
