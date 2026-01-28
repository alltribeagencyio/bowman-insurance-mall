'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Menu, X, ShoppingCart, User, LogOut, Car, Heart, Users, Home, Plane, Building2 } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@/lib/auth/auth-context'

// Insurance categories with their plans and companies
const insuranceCategories = [
  {
    id: 'motor',
    name: 'Motor',
    icon: Car,
    href: '/policies/motor',
    plans: [
      { name: 'Comprehensive Cover', price: 'From KES 15,000' },
      { name: 'Third Party Only', price: 'From KES 5,000' },
      { name: 'Third Party Fire & Theft', price: 'From KES 8,000' },
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
  const { user, isAuthenticated, logout } = useAuth()

  const handleLogout = async () => {
    await logout()
    setIsMenuOpen(false)
  }

  return (
    <nav className="border-b bg-background sticky top-0 z-50 backdrop-blur-sm bg-background/95">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full bg-primary" />
            <span className="text-xl font-bold">Bowman Insurance</span>
          </Link>

          {/* Desktop Navigation - Categories */}
          <div className="hidden lg:flex items-center space-x-1 justify-center flex-1">
            {insuranceCategories.map((category) => {
              const Icon = category.icon
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
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[600px] bg-background border rounded-lg shadow-xl p-6 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none group-hover:pointer-events-auto z-50">
                    <div className="grid grid-cols-2 gap-6">
                        {/* Plans Column */}
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

                        {/* Companies Column */}
                        <div>
                          <h3 className="font-semibold text-sm mb-3 text-primary">Top Insurance Companies</h3>
                          <div className="space-y-2">
                            {category.companies.map((company, idx) => (
                              <Link
                                key={idx}
                                href={category.href}
                                className="block p-3 rounded-lg hover:bg-muted transition-colors text-sm"
                              >
                                {company} Insurance
                              </Link>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* View All Link */}
                      <div className="border-t mt-4 pt-4">
                        <Link
                          href={category.href}
                          className="text-sm font-medium text-primary hover:underline flex items-center"
                        >
                          View All {category.name} Insurance Options →
                        </Link>
                      </div>
                    </div>
                </div>
              )
            })}
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Button variant="ghost" size="icon">
                  <ShoppingCart className="h-5 w-5" />
                </Button>
                <Button variant="ghost" asChild>
                  <Link href="/dashboard">
                    <User className="h-4 w-4 mr-2" />
                    {user?.first_name || 'Dashboard'}
                  </Link>
                </Button>
                <Button variant="ghost" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
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
            {/* Insurance Categories */}
            <div className="space-y-2">
              <div className="text-xs font-semibold text-muted-foreground px-2 mb-3">INSURANCE PRODUCTS</div>
              {insuranceCategories.map((category) => {
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
                      <div className="font-semibold">{category.name} Insurance</div>
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
                <>
                  <Link
                    href="/dashboard"
                    className="block py-3 px-3 text-sm font-medium hover:bg-muted rounded-lg"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Button variant="outline" onClick={handleLogout} className="w-full mt-2">
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </>
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
