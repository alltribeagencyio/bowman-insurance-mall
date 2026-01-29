'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react'
import { useAuth } from '@/lib/auth/auth-context'
import { useSidebar } from '@/contexts/sidebar-context'
import { cn } from '@/lib/utils'

export function Footer() {
  const { isAuthenticated } = useAuth()
  const { sidebarCollapsed } = useSidebar()
  const pathname = usePathname()

  // Check if we're on a dashboard page (where sidebar is visible)
  const isOnDashboardPage = pathname?.startsWith('/dashboard')

  return (
    <footer className={cn(
      "border-t bg-muted/50 transition-all duration-300",
      isAuthenticated && isOnDashboardPage && !sidebarCollapsed && "lg:pl-64",
      isAuthenticated && isOnDashboardPage && sidebarCollapsed && "lg:pl-20"
    )}>
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-primary" />
              <span className="text-lg font-bold">Bowman Insurance</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Your trusted insurance partner in Kenya. Providing comprehensive coverage for all your needs.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-muted-foreground hover:text-primary">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/policies" className="text-sm text-muted-foreground hover:text-primary">
                  Browse Policies
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-sm text-muted-foreground hover:text-primary">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/claims" className="text-sm text-muted-foreground hover:text-primary">
                  File a Claim
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-muted-foreground hover:text-primary">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Insurance Types */}
          <div>
            <h3 className="font-semibold mb-4">Insurance Types</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/policies?category=motor" className="text-sm text-muted-foreground hover:text-primary">
                  Motor Insurance
                </Link>
              </li>
              <li>
                <Link href="/policies?category=medical" className="text-sm text-muted-foreground hover:text-primary">
                  Medical Insurance
                </Link>
              </li>
              <li>
                <Link href="/policies?category=life" className="text-sm text-muted-foreground hover:text-primary">
                  Life Insurance
                </Link>
              </li>
              <li>
                <Link href="/policies?category=home" className="text-sm text-muted-foreground hover:text-primary">
                  Home Insurance
                </Link>
              </li>
              <li>
                <Link href="/policies?category=travel" className="text-sm text-muted-foreground hover:text-primary">
                  Travel Insurance
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-2">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <span className="text-sm text-muted-foreground">
                  Nairobi, Kenya<br />
                  P.O. Box 12345
                </span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  +254 712 345 678
                </span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  info@bowmaninsurance.co.ke
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-muted-foreground">
              © 2026 Bowman Insurance Agency. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-sm text-muted-foreground hover:text-primary">
                Terms of Service
              </Link>
              <Link href="/cookies" className="text-sm text-muted-foreground hover:text-primary">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
