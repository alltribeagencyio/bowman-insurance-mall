'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Search, SlidersHorizontal, X, Star, ChevronDown, ChevronRight } from 'lucide-react'

interface InsuranceProduct {
  id: string
  name: string
  company: string
  category: string
  subcategory?: string
  premium: number
  coverage: number
  rating: number
  features: string[]
  description: string
  badge?: string
}

interface FilterOptions {
  companies: string[]
  subcategories?: string[]
  priceRange: { min: number; max: number }
  coverageRange: { min: number; max: number }
}

interface InsuranceShopProps {
  products: InsuranceProduct[]
  title: string
  description: string
  filterOptions: FilterOptions
  showSubcategories?: boolean
}

export function InsuranceShop({
  products,
  title,
  description,
  filterOptions,
  showSubcategories = false
}: InsuranceShopProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('popular')
  const [showFilters, setShowFilters] = useState(false)

  // Filter states
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([])
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('all')
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000000 })
  const [coverageRange, setCoverageRange] = useState({ min: 0, max: 100000000 })
  const [minRating, setMinRating] = useState(0)

  // Collapsible sections state
  const [expandedSections, setExpandedSections] = useState({
    type: true,
    companies: true,
    rating: true,
    price: false,
    coverage: false,
  })

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  // Initialize filter ranges from props
  useEffect(() => {
    setPriceRange({
      min: filterOptions.priceRange.min,
      max: filterOptions.priceRange.max
    })
    setCoverageRange({
      min: filterOptions.coverageRange.min,
      max: filterOptions.coverageRange.max
    })
  }, [filterOptions.priceRange.min, filterOptions.priceRange.max, filterOptions.coverageRange.min, filterOptions.coverageRange.max])

  // Apply filters
  const filteredProducts = products
    .filter((product) => {
      // Search filter
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())

      // Company filter
      const matchesCompany =
        selectedCompanies.length === 0 ||
        selectedCompanies.includes(product.company)

      // Subcategory filter
      const matchesSubcategory =
        selectedSubcategory === 'all' ||
        product.subcategory === selectedSubcategory

      // Price filter
      const matchesPrice =
        product.premium >= priceRange.min &&
        product.premium <= priceRange.max

      // Coverage filter
      const matchesCoverage =
        product.coverage >= coverageRange.min &&
        product.coverage <= coverageRange.max

      // Rating filter
      const matchesRating = product.rating >= minRating

      return matchesSearch && matchesCompany && matchesSubcategory &&
             matchesPrice && matchesCoverage && matchesRating
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.premium - b.premium
        case 'price-high':
          return b.premium - a.premium
        case 'coverage-high':
          return b.coverage - a.coverage
        case 'rating':
          return b.rating - a.rating
        default:
          return 0
      }
    })

  const toggleCompany = (company: string) => {
    setSelectedCompanies(prev =>
      prev.includes(company)
        ? prev.filter(c => c !== company)
        : [...prev, company]
    )
  }

  const clearFilters = () => {
    setSelectedCompanies([])
    setSelectedSubcategory('all')
    setPriceRange({ min: filterOptions.priceRange.min, max: filterOptions.priceRange.max })
    setCoverageRange({ min: filterOptions.coverageRange.min, max: filterOptions.coverageRange.max })
    setMinRating(0)
    setSearchQuery('')
  }

  const activeFiltersCount =
    selectedCompanies.length +
    (selectedSubcategory !== 'all' ? 1 : 0) +
    (minRating > 0 ? 1 : 0)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-gradient-to-b from-primary/10 to-background py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl font-bold mb-4">{title}</h1>
            <p className="text-xl text-muted-foreground mb-6">{description}</p>

            {/* Subcategory Quick Filters (Chips) */}
            {showSubcategories && filterOptions.subcategories && filterOptions.subcategories.length > 0 && (
              <div className="mb-6">
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedSubcategory('all')}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      selectedSubcategory === 'all'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted hover:bg-muted/80'
                    }`}
                  >
                    All Types
                  </button>
                  {filterOptions.subcategories.map(sub => (
                    <button
                      key={sub}
                      onClick={() => setSelectedSubcategory(sub)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        selectedSubcategory === sub
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted hover:bg-muted/80'
                      }`}
                    >
                      {sub}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col md:flex-row gap-4">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search by policy name, company, or features..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12"
                />
              </div>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="h-12 px-4 rounded-md border border-input bg-background min-w-[200px]"
              >
                <option value="popular">Most Popular</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="coverage-high">Coverage: Highest First</option>
                <option value="rating">Highest Rated</option>
              </select>

              {/* Filter Toggle */}
              <Button
                variant="outline"
                size="lg"
                onClick={() => setShowFilters(!showFilters)}
                className="relative"
              >
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filters
                {activeFiltersCount > 0 && (
                  <span className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </Button>
            </div>

            {/* Active Filters Summary */}
            {activeFiltersCount > 0 && (
              <div className="flex flex-wrap gap-2 mt-4 items-center">
                <span className="text-sm text-muted-foreground">Active filters:</span>
                {selectedCompanies.map(company => (
                  <span key={company} className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-primary/10 text-primary">
                    {company}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => toggleCompany(company)} />
                  </span>
                ))}
                {selectedSubcategory !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-primary/10 text-primary">
                    {selectedSubcategory}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedSubcategory('all')} />
                  </span>
                )}
                {minRating > 0 && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-primary/10 text-primary">
                    {minRating}+ stars
                    <X className="h-3 w-3 cursor-pointer" onClick={() => setMinRating(0)} />
                  </span>
                )}
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Clear all
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Sidebar Filters */}
              <aside className={`lg:block ${showFilters ? 'block' : 'hidden'} lg:col-span-1 transition-all duration-300`}>
                <Card className="sticky top-20">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Filters</CardTitle>
                      {activeFiltersCount > 0 && (
                        <Button variant="ghost" size="sm" onClick={clearFilters}>
                          Clear
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Subcategories */}
                    {showSubcategories && filterOptions.subcategories && (
                      <div className="border-b pb-4">
                        <button
                          onClick={() => toggleSection('type')}
                          className="flex items-center justify-between w-full text-left mb-3 hover:text-primary transition-colors"
                        >
                          <h3 className="font-semibold">Type</h3>
                          {expandedSections.type ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </button>
                        {expandedSections.type && (
                          <div className="space-y-2 animate-in slide-in-from-top-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                name="subcategory"
                                checked={selectedSubcategory === 'all'}
                                onChange={() => setSelectedSubcategory('all')}
                                className="w-4 h-4"
                              />
                              <span className="text-sm">All Types</span>
                            </label>
                            {filterOptions.subcategories.map(sub => (
                              <label key={sub} className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="radio"
                                  name="subcategory"
                                  checked={selectedSubcategory === sub}
                                  onChange={() => setSelectedSubcategory(sub)}
                                  className="w-4 h-4"
                                />
                                <span className="text-sm">{sub}</span>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Companies */}
                    <div className="border-b pb-4">
                      <button
                        onClick={() => toggleSection('companies')}
                        className="flex items-center justify-between w-full text-left mb-3 hover:text-primary transition-colors"
                      >
                        <h3 className="font-semibold">Insurance Companies</h3>
                        {expandedSections.companies ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </button>
                      {expandedSections.companies && (
                        <div className="space-y-2 max-h-[200px] overflow-y-auto animate-in slide-in-from-top-2">
                          {filterOptions.companies.map(company => (
                            <label key={company} className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={selectedCompanies.includes(company)}
                                onChange={() => toggleCompany(company)}
                                className="w-4 h-4"
                              />
                              <span className="text-sm">{company}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Rating Filter */}
                    <div className="border-b pb-4">
                      <button
                        onClick={() => toggleSection('rating')}
                        className="flex items-center justify-between w-full text-left mb-3 hover:text-primary transition-colors"
                      >
                        <h3 className="font-semibold">Minimum Rating</h3>
                        {expandedSections.rating ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </button>
                      {expandedSections.rating && (
                        <div className="space-y-2 animate-in slide-in-from-top-2">
                        {[4.5, 4.0, 3.5, 3.0].map(rating => (
                          <label key={rating} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="rating"
                              checked={minRating === rating}
                              onChange={() => setMinRating(rating)}
                              className="w-4 h-4"
                            />
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                              <span className="text-sm">{rating}+</span>
                            </div>
                          </label>
                        ))}
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="rating"
                            checked={minRating === 0}
                            onChange={() => setMinRating(0)}
                            className="w-4 h-4"
                          />
                          <span className="text-sm">All Ratings</span>
                        </label>
                        </div>
                      )}
                    </div>

                    {/* Price Range */}
                    <div className="border-b pb-4">
                      <button
                        onClick={() => toggleSection('price')}
                        className="flex items-center justify-between w-full text-left mb-3 hover:text-primary transition-colors"
                      >
                        <h3 className="font-semibold">Monthly Premium Range</h3>
                        {expandedSections.price ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </button>
                      {expandedSections.price && (
                        <div className="space-y-3 animate-in slide-in-from-top-2">
                          <div className="flex gap-2 items-center">
                            <Input
                              type="number"
                              placeholder="Min"
                              value={priceRange.min || ''}
                              onChange={(e) => setPriceRange(prev => ({ ...prev, min: Number(e.target.value) }))}
                              className="h-9"
                            />
                            <span>-</span>
                            <Input
                              type="number"
                              placeholder="Max"
                              value={priceRange.max || ''}
                              onChange={(e) => setPriceRange(prev => ({ ...prev, max: Number(e.target.value) }))}
                              className="h-9"
                            />
                          </div>
                          <p className="text-xs text-muted-foreground">
                            KES {priceRange.min.toLocaleString()} - {priceRange.max.toLocaleString()}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </aside>

              {/* Products Grid */}
              <div className="lg:col-span-3">
                <div className="mb-4 text-sm text-muted-foreground">
                  Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'policy' : 'policies'}
                </div>

                {filteredProducts.length === 0 ? (
                  <Card className="py-16">
                    <CardContent className="text-center">
                      <p className="text-muted-foreground text-lg mb-4">
                        No policies found matching your criteria
                      </p>
                      <Button onClick={clearFilters}>Clear Filters</Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredProducts.map((product) => (
                      <Card key={product.id} className="hover:shadow-xl transition-shadow flex flex-col relative overflow-hidden group">
                        {/* Badge */}
                        {product.badge && (
                          <div className="absolute top-4 right-4 z-10">
                            <div className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                              {product.badge}
                            </div>
                          </div>
                        )}

                        <CardHeader>
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              {product.subcategory && (
                                <div className="text-xs text-muted-foreground mb-1">
                                  {product.subcategory}
                                </div>
                              )}
                              <CardTitle className="text-lg">{product.name}</CardTitle>
                              <CardDescription className="mt-1 font-medium">
                                {product.company}
                              </CardDescription>
                            </div>
                            <div className="flex items-center gap-1 text-sm bg-amber-50 dark:bg-amber-950 px-2 py-1 rounded">
                              <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                              <span className="font-medium text-amber-700 dark:text-amber-300">{product.rating}</span>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">{product.description}</p>
                        </CardHeader>

                        <CardContent className="space-y-4 flex-1">
                          <div>
                            <div className="text-3xl font-bold">
                              KES {product.premium.toLocaleString()}
                            </div>
                            <p className="text-sm text-muted-foreground">per month</p>
                          </div>

                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Coverage</p>
                            <p className="font-semibold">
                              Up to KES {product.coverage.toLocaleString()}
                            </p>
                          </div>

                          <div>
                            <p className="text-sm text-muted-foreground mb-2">Key Features</p>
                            <ul className="space-y-1.5">
                              {product.features.slice(0, 3).map((feature, idx) => (
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
                            <Link href={`/policies/details/${product.id}`}>
                              View Details
                            </Link>
                          </Button>
                          <Button className="flex-1 group-hover:bg-primary/90">Get Quote</Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
