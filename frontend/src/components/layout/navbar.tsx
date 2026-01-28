'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Menu, X, ShoppingCart, User, LogOut, ChevronDown, Car, Heart, Users, Home, Plane, Building2 } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@/lib/auth/auth-context'

const insuranceCategories = [
  { name: 'Motor Insurance', href: '/policies/motor', icon: Car, description: 'Vehicle coverage' },
  { name: 'Medical Insurance', href: '/policies/medical', icon: Heart, description: 'Health plans' },
  { name: 'Life Insurance', href: '/policies/life', icon: Users, description: 'Life protection' },
  { name: 'Home Insurance', href: '/policies/home', icon: Home, description: 'Property coverage' },
  { name: 'Travel Insurance', href: '/policies/travel', icon: Plane, description: 'Travel protection' },
  { name: 'Business Insurance', href: '/policies/business', icon: Building2, description: 'Business assets' },
]

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProductsOpen, setIsProductsOpen] = useState(false)
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

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {/* Products Dropdown */}
            <div className="relative group">
              <button
                className="text-sm font-medium hover:text-primary flex items-center gap-1"
                onMouseEnter={() => setIsProductsOpen(true)}
                onMouseLeave={() => setIsProductsOpen(false)}
              >
                Insurance Products
                <ChevronDown className="h-4 w-4" />
              </button>

              {isProductsOpen && (
                <div
                  className="absolute top-full left-0 mt-2 w-80 bg-background border rounded-lg shadow-lg py-2"
                  onMouseEnter={() => setIsProductsOpen(true)}
                  onMouseLeave={() => setIsProductsOpen(false)}
                >
                  {insuranceCategories.map((category) => (
                    <Link
                      key={category.href}
                      href={category.href}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors"
                      onClick={() => setIsProductsOpen(false)}
                    >
                      <div className="p-2 rounded-lg bg-primary/10">
                        <category.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">{category.name}</div>
                        <div className="text-xs text-muted-foreground">{category.description}</div>
                      </div>
                    </Link>
                  ))}
                  <div className="border-t mt-2 pt-2">
                    <Link
                      href="/policies"
                      className="block px-4 py-2 text-sm font-medium text-primary hover:bg-muted"
                      onClick={() => setIsProductsOpen(false)}
                    >
                      View All Products →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <Link href="/policies/compare" className="text-sm font-medium hover:text-primary">
              Compare
            </Link>
            <Link href="/quote" className="text-sm font-medium hover:text-primary">
              Get Quote
            </Link>
            {isAuthenticated && (
              <Link href="/dashboard" className="text-sm font-medium hover:text-primary">
                Dashboard
              </Link>
            )}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Button variant="ghost" size="icon">
                  <ShoppingCart className="h-5 w-5" />
                </Button>
                <Button variant="ghost" asChild>
                  <Link href="/dashboard/profile">
                    <User className="h-4 w-4 mr-2" />
                    {user?.first_name || 'Profile'}
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
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-4">
            {/* Insurance Products Section */}
            <div className="space-y-2">
              <div className="text-xs font-semibold text-muted-foreground px-2 mb-2">INSURANCE PRODUCTS</div>
              {insuranceCategories.map((category) => (
                <Link
                  key={category.href}
                  href={category.href}
                  className="flex items-center gap-3 px-2 py-2 text-sm font-medium hover:bg-muted rounded-lg"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <category.icon className="h-5 w-5 text-primary" />
                  <span>{category.name}</span>
                </Link>
              ))}
            </div>

            <div className="border-t pt-4">
              <Link
                href="/policies"
                className="block py-2 px-2 text-sm font-medium hover:text-primary"
                onClick={() => setIsMenuOpen(false)}
              >
                Browse All Policies
              </Link>
              <Link
                href="/policies/compare"
                className="block py-2 px-2 text-sm font-medium hover:text-primary"
                onClick={() => setIsMenuOpen(false)}
              >
                Compare Policies
              </Link>
              <Link
                href="/quote"
                className="block py-2 px-2 text-sm font-medium hover:text-primary"
                onClick={() => setIsMenuOpen(false)}
              >
                Get Quote
              </Link>
              {isAuthenticated && (
                <Link
                  href="/dashboard"
                  className="block py-2 px-2 text-sm font-medium hover:text-primary"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
              )}
            </div>
            <div className="flex flex-col space-y-2 pt-4 border-t">
              {isAuthenticated ? (
                <>
                  <Button variant="outline" asChild className="w-full">
                    <Link href="/dashboard/profile">
                      <User className="h-4 w-4 mr-2" />
                      {user?.first_name || 'Profile'}
                    </Link>
                  </Button>
                  <Button variant="outline" onClick={handleLogout} className="w-full">
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" asChild className="w-full">
                    <Link href="/login">Sign In</Link>
                  </Button>
                  <Button asChild className="w-full">
                    <Link href="/register">Get Started</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
