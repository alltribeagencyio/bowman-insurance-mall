'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Menu, X, ShoppingCart, User, LogOut, Car, Heart, Users, Home, Plane, Building2, Search, ArrowLeftRight } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/lib/auth/auth-context'
import { useSidebar } from '@/contexts/sidebar-context'
import { ALL_PRODUCTS } from '@/data/insuranceProducts'
import { cn } from '@/lib/utils'
import { getCategories, type PolicyCategory } from '@/lib/api/categories'

// Helper function to map category icon names to Lucide icon components
const getCategoryIcon = (iconName: string) => {
  const iconMap: Record<string, any> = {
    'Car': Car,
    'Motor': Car,
    'Heart': Heart,
    'Medical': Heart,
    'Health': Heart,
    'Plane': Plane,
    'Travel': Plane,
    'Building2': Building2,
    'Business': Building2,
    'Home': Home,
    'Users': Users,
    'Life': Users,
  }
  return iconMap[iconName] || Home
}

// Insurance categories with their plans and companies (FALLBACK)
const insuranceCategories = [
  {
    id: 'motor',
    name: 'Motor',
    icon: Car,
    href: '/policies/motor',
    plans: [
      { name: 'Boda Boda', price: 'From KES 2,800' },
      { name: 'Private Car', price: 'From KES 12,500' },
      { name: 'PSV (Matatu)', price: 'From KES 25,000' },
      { name: 'Uber/Taxi', price: 'From KES 16,500' },
      { name: 'Truck/Commercial', price: 'From KES 35,000' },
    ],
    companies: ['Jubilee', 'AAR', 'Britam', 'CIC', 'Madison'],
  },
  {
    id: 'medical',
    name: 'Medical',
    icon: Heart,
    href: '/policies/medical',
    plans: [
      { name: 'Individual Health Plan', price: 'From KES 5,000' },
      { name: 'Family Health Plan', price: 'From KES 12,000' },
      { name: 'Corporate Health Plan', price: 'From KES 8,000' },
    ],
    companies: ['AAR', 'Jubilee', 'Britam', 'CIC', 'Madison'],
  },
  {
    id: 'travel',
    name: 'Travel',
    icon: Plane,
    href: '/policies/travel',
    plans: [
      { name: 'Single Trip Cover', price: 'From KES 1,500' },
      { name: 'Annual Multi-Trip', price: 'From KES 8,000' },
      { name: 'Business Travel', price: 'From KES 5,000' },
    ],
    companies: ['AAR', 'Britam', 'Jubilee'],
  },
  {
    id: 'business',
    name: 'Business',
    icon: Building2,
    href: '/policies/business',
    plans: [
      { name: 'SME Cover', price: 'From KES 25,000' },
      { name: 'Professional Indemnity', price: 'From KES 35,000' },
      { name: 'Public Liability', price: 'From KES 20,000' },
    ],
    companies: ['CIC', 'Britam', 'Jubilee', 'Madison'],
  },
  {
    id: 'home',
    name: 'Home',
    icon: Home,
    href: '/policies/home',
    plans: [
      { name: 'Home & Contents', price: 'From KES 8,000' },
      { name: 'Domestic Package', price: 'From KES 12,000' },
      { name: 'Landlord Insurance', price: 'From KES 15,000' },
    ],
    companies: ['Britam', 'Jubilee', 'AAR', 'CIC'],
  },
  {
    id: 'life',
    name: 'Life',
    icon: Users,
    href: '/policies/life',
    plans: [
      { name: 'Term Life Insurance', price: 'From KES 3,000' },
      { name: 'Whole Life Cover', price: 'From KES 5,000' },
      { name: 'Education Policy', price: 'From KES 7,000' },
    ],
    companies: ['Britam', 'Jubilee', 'CIC', 'Madison'],
  },
]

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchExpanded, setSearchExpanded] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [categories, setCategories] = useState<PolicyCategory[]>([])
  const searchRef = useRef<HTMLDivElement>(null)
  const { user, isAuthenticated, logout } = useAuth()
  const { sidebarCollapsed } = useSidebar()
  const pathname = usePathname()

  // Check if we're on a dashboard page (where sidebar is visible)
  const isOnDashboardPage = pathname?.startsWith('/dashboard')

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories()
        setCategories(data)
      } catch (error) {
        console.error('Failed to load categories:', error)
        // Fallback to static categories if API fails - keep existing insuranceCategories
      }
    }
    fetchCategories()
  }, [])

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchExpanded(false)
        setSearchQuery('')
      }
    }

    if (searchExpanded) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [searchExpanded])

  // Map API categories to navbar format, or use fallback
  const displayCategories = categories.length > 0
    ? categories.map(cat => ({
        id: cat.slug,
        name: cat.name,
        icon: getCategoryIcon(cat.icon),
        href: `/policies/${cat.slug}`,
        plans: [], // Plans will be loaded from policy types in the future
        companies: [], // Companies will be loaded from policy types in the future
      }))
    : insuranceCategories

  // Filter products based on search query
  const searchResults = searchQuery.trim()
    ? ALL_PRODUCTS.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 6) // Limit to 6 results
    : []

  const handleLogout = async () => {
    await logout()
    setIsMenuOpen(false)
  }

  return (
    <nav className={cn(
      "border-b bg-background sticky top-0 z-50 backdrop-blur-sm bg-background/95 transition-all duration-300",
      isAuthenticated && isOnDashboardPage && !sidebarCollapsed && "lg:pl-64",
      isAuthenticated && isOnDashboardPage && sidebarCollapsed && "lg:pl-20"
    )}>
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo - Hide only when on dashboard pages where sidebar is visible */}
          {!(isAuthenticated && isOnDashboardPage) && (
            <Link href="/" className="flex items-center">
              <Image
                src="/bowman-logo.jpeg"
                alt="Bowman Insurance"
                width={160}
                height={50}
                className="h-11 w-auto object-contain"
                priority
              />
            </Link>
          )}

          {/* Desktop Navigation - Categories */}
          <div className={cn(
            "hidden lg:flex items-center space-x-1",
            (isAuthenticated && isOnDashboardPage) ? "flex-1" : "justify-center flex-1"
          )}>
            {/* Mall Link - All Products */}
            <Link
              href="/shop"
              className="px-4 py-2 text-sm font-semibold hover:text-primary flex items-center gap-2 rounded-md hover:bg-muted transition-colors bg-primary/5"
            >
              <ShoppingCart className="h-4 w-4" />
              Mall
            </Link>

            {displayCategories.map((category, index) => {
              const Icon = category.icon
              // For Motor and Medical (first two categories), position mega menu to avoid sidebar obstruction
              const isLeftCategory = index <= 1
              const megaMenuPositioning = isLeftCategory && isOnDashboardPage
                ? "left-0"
                : "left-1/2 -translate-x-1/2"

              return (
                <div
                  key={category.id}
                  className="relative group"
                >
                  <Link
                    href={category.href}
                    className="px-4 py-2 text-sm font-medium hover:text-primary flex items-center gap-2 rounded-md hover:bg-muted transition-colors"
                  >
                    <Icon className="h-4 w-4" />
                    {category.name}
                  </Link>

                  {/* Mega Menu Dropdown - Center aligned with pointer-events to keep menu open */}
                  <div className={cn(
                    "absolute top-full mt-2 w-[600px] bg-background border rounded-lg shadow-xl p-6 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none group-hover:pointer-events-auto z-50",
                    megaMenuPositioning
                  )}>
                    {category.plans.length > 0 || category.companies.length > 0 ? (
                      <div className="grid grid-cols-2 gap-6">
                        {/* Plans Column */}
                        {category.plans.length > 0 && (
                          <div>
                            <h3 className="font-semibold text-sm mb-3 text-primary">Popular Plans</h3>
                            <div className="space-y-2">
                              {category.plans.map((plan, idx) => (
                                <Link
                                  key={idx}
                                  href={category.href}
                                  className="block p-3 rounded-lg hover:bg-muted transition-colors"
                                >
                                  <div className="font-medium text-sm">{plan.name}</div>
                                  <div className="text-xs text-muted-foreground">{plan.price}</div>
                                </Link>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Companies Column */}
                        {category.companies.length > 0 && (
                          <div>
                            <h3 className="font-semibold text-sm mb-3 text-primary">Top Insurance Companies</h3>
                            <div className="space-y-2">
                              {category.companies.map((company, idx) => (
                                <Link
                                  key={idx}
                                  href={category.href}
                                  className="block p-3 rounded-lg hover:bg-muted transition-colors text-sm"
                                >
                                  {company}
                                </Link>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-sm text-muted-foreground mb-3">
                          Browse our {category.name} products
                        </p>
                        <Link href={category.href}>
                          <Button size="sm">View All Products</Button>
                        </Link>
                      </div>
                    )}

                      {/* View All Link */}
                      <div className="border-t mt-4 pt-4">
                        <Link
                          href={category.href}
                          className="text-sm font-medium text-primary hover:underline flex items-center"
                        >
                          View All {category.name} Options →
                        </Link>
                      </div>
                    </div>
                </div>
              )
            })}

            {/* Compare Policies Link */}
            <Link
              href="/policies/compare"
              className="px-4 py-2 text-sm font-semibold hover:text-primary flex items-center gap-2 rounded-md hover:bg-muted transition-colors"
            >
              <ArrowLeftRight className="h-4 w-4" />
              Compare
            </Link>
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {/* Expandable Search */}
                <div ref={searchRef} className="relative">
                  {searchExpanded ? (
                    <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-2 duration-200">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="text"
                          placeholder="Search insurance products..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-[300px] pl-10 pr-4"
                          autoFocus
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSearchExpanded(false)
                          setSearchQuery('')
                        }}
                      >
                        <X className="h-5 w-5" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSearchExpanded(true)}
                    >
                      <Search className="h-5 w-5" />
                    </Button>
                  )}

                  {/* Search Results Dropdown */}
                  {searchExpanded && searchQuery.trim() && (
                    <div className="absolute top-full right-0 mt-2 w-[400px] bg-background border rounded-lg shadow-xl max-h-[400px] overflow-y-auto z-50">
                      {searchResults.length > 0 ? (
                        <div className="p-2">
                          {searchResults.map((product) => (
                            <Link
                              key={product.id}
                              href={`/policies/${product.category}?product=${product.id}`}
                              className="block p-3 rounded-lg hover:bg-muted transition-colors"
                              onClick={() => {
                                setSearchExpanded(false)
                                setSearchQuery('')
                              }}
                            >
                              <div className="flex items-start gap-3">
                                <div className="flex-1">
                                  <h4 className="font-medium text-sm">{product.name}</h4>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {product.company} • {product.category}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                                    {product.description}
                                  </p>
                                </div>
                                <div className="text-sm font-semibold text-primary whitespace-nowrap">
                                  From KES {product.premium.toLocaleString()}
                                </div>
                              </div>
                            </Link>
                          ))}
                          <div className="border-t mt-2 pt-2 px-3">
                            <Link
                              href="/shop"
                              className="text-sm text-primary hover:underline"
                              onClick={() => {
                                setSearchExpanded(false)
                                setSearchQuery('')
                              }}
                            >
                              View all products →
                            </Link>
                          </div>
                        </div>
                      ) : (
                        <div className="p-6 text-center text-muted-foreground">
                          <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No products found for "{searchQuery}"</p>
                          <Link
                            href="/shop"
                            className="text-sm text-primary hover:underline mt-2 inline-block"
                            onClick={() => {
                              setSearchExpanded(false)
                              setSearchQuery('')
                            }}
                          >
                            Browse all products
                          </Link>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <Button variant="ghost" size="icon">
                  <ShoppingCart className="h-5 w-5" />
                </Button>
                <Button variant="ghost" asChild>
                  <Link href="/dashboard">
                    <User className="h-4 w-4 mr-2" />
                    {user?.first_name || 'Dashboard'}
                  </Link>
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button asChild>
                  <Link href="/register">Get Started</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 space-y-4 max-h-[80vh] overflow-y-auto">
            {/* Mall Link - All Products */}
            <Link
              href="/shop"
              className="flex items-center gap-3 px-3 py-3 text-sm font-medium bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors mx-2"
              onClick={() => setIsMenuOpen(false)}
            >
              <div className="p-2 rounded-lg bg-primary">
                <ShoppingCart className="h-5 w-5 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <div className="font-bold">Insurance Mall</div>
                <div className="text-xs text-muted-foreground">
                  Browse all products
                </div>
              </div>
            </Link>

            {/* Compare Policies Link */}
            <Link
              href="/policies/compare"
              className="flex items-center gap-3 px-3 py-3 text-sm font-medium bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors mx-2"
              onClick={() => setIsMenuOpen(false)}
            >
              <div className="p-2 rounded-lg bg-primary">
                <ArrowLeftRight className="h-5 w-5 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <div className="font-bold">Compare Policies</div>
                <div className="text-xs text-muted-foreground">
                  Compare across companies
                </div>
              </div>
            </Link>

            {/* Insurance Categories */}
            <div className="space-y-2">
              <div className="text-xs font-semibold text-muted-foreground px-2 mb-3">INSURANCE PRODUCTS</div>
              {displayCategories.map((category) => {
                const Icon = category.icon
                return (
                  <Link
                    key={category.id}
                    href={category.href}
                    className="flex items-center gap-3 px-3 py-3 text-sm font-medium hover:bg-muted rounded-lg transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold">{category.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {category.plans.length} plans available
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>

            {/* User Actions */}
            <div className="border-t pt-4">
              {isAuthenticated ? (
                <Link
                  href="/dashboard"
                  className="block py-3 px-3 text-sm font-medium hover:bg-muted rounded-lg"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
              ) : (
                <div className="flex flex-col space-y-2">
                  <Button variant="outline" asChild className="w-full">
                    <Link href="/login">Sign In</Link>
                  </Button>
                  <Button asChild className="w-full">
                    <Link href="/register">Get Started</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
