'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth/auth-context'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { useSidebar } from '@/contexts/sidebar-context'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  LayoutDashboard,
  Shield,
  DollarSign,
  FileText,
  Download,
  User,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Clock,
  Home,
  ShoppingBag,
  Receipt,
  LifeBuoy
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavItem {
  name: string
  href?: string
  icon: React.ComponentType<{ className?: string }>
  badge?: number
  children?: NavItem[]
}

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'My Policies', href: '/dashboard/my-policies', icon: Shield },
  { name: 'Claims', href: '/dashboard/claims', icon: FileText },
  { name: 'Assets', href: '/dashboard/assets', icon: CreditCard },
  {
    name: 'Payments',
    icon: DollarSign,
    children: [
      { name: 'All Payments', href: '/dashboard/payments', icon: Receipt },
      { name: 'Pending Payments', href: '/dashboard/pending-payments', icon: Clock, badge: 2 },
    ]
  },
  { name: 'Shop Insurance', href: '/shop', icon: ShoppingBag },
  { name: 'Documents', href: '/dashboard/documents', icon: Download },
  { name: 'Support', href: '/dashboard/support', icon: LifeBuoy },
  { name: 'Profile', href: '/dashboard/profile', icon: User },
]

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth()
  const pathname = usePathname()
  const { sidebarCollapsed, setSidebarCollapsed } = useSidebar()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedItems, setExpandedItems] = useState<string[]>([])

  const handleLogout = async () => {
    await logout()
  }

  const toggleExpanded = (itemName: string) => {
    setExpandedItems(prev =>
      prev.includes(itemName)
        ? prev.filter(name => name !== itemName)
        : [...prev, itemName]
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-all duration-300 ease-in-out',
          sidebarCollapsed ? 'w-20' : 'w-64',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-700 relative">
          {!sidebarCollapsed && (
            <Link href="/">
              <span className="font-bold text-2xl text-primary">Bowman</span>
            </Link>
          )}
          {sidebarCollapsed && (
            <Link href="/" className="mx-auto">
              <span className="font-bold text-xl text-primary">B</span>
            </Link>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>

          {/* Floating Collapse/Expand Toggle - Desktop Only */}
          <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10">
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 rounded-full bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-md"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {sidebarCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>


        {/* Navigation */}
        <nav className={cn(
          "flex-1 px-4 py-6 space-y-1 h-[calc(100vh-16rem)]",
          sidebarCollapsed ? "overflow-visible" : "overflow-y-auto"
        )}>
          {navigation.map((item) => {
            // Check if any child is active for parent items
            const hasActiveChild = item.children?.some(child =>
              pathname === child.href || (child.href && child.href !== '/dashboard' && pathname.startsWith(child.href + '/'))
            )
            const isExpanded = expandedItems.includes(item.name)

            // For items without children (regular nav items)
            if (!item.children) {
              const isActive = pathname === item.href || (item.href && item.href !== '/dashboard' && pathname.startsWith(item.href + '/'))
              return (
                <Link
                  key={item.name}
                  href={item.href!}
                  title={sidebarCollapsed ? item.name : undefined}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors relative group',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700',
                    sidebarCollapsed && 'justify-center'
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {!sidebarCollapsed && (
                    <>
                      <span className="flex-1">{item.name}</span>
                      {item.badge && (
                        <Badge variant="destructive" className="ml-auto">
                          {item.badge}
                        </Badge>
                      )}
                    </>
                  )}
                  {sidebarCollapsed && item.badge && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                  {/* Tooltip on hover for collapsed state */}
                  {sidebarCollapsed && (
                    <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-md opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity z-50">
                      {item.name}
                    </div>
                  )}
                </Link>
              )
            }

            // For items with children (expandable parent items)
            return (
              <div key={item.name}>
                <button
                  onClick={() => toggleExpanded(item.name)}
                  title={sidebarCollapsed ? item.name : undefined}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors relative group',
                    hasActiveChild
                      ? 'bg-primary/10 text-primary'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700',
                    sidebarCollapsed && 'justify-center'
                  )}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {!sidebarCollapsed && (
                    <>
                      <span className="flex-1 text-left">{item.name}</span>
                      <ChevronDown className={cn(
                        "h-4 w-4 transition-transform",
                        isExpanded && "transform rotate-180"
                      )} />
                    </>
                  )}
                  {/* Tooltip on hover for collapsed state */}
                  {sidebarCollapsed && (
                    <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-md opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity z-50">
                      {item.name}
                    </div>
                  )}
                </button>

                {/* Submenu items */}
                {isExpanded && !sidebarCollapsed && (
                  <div className="ml-4 mt-1 space-y-1 border-l-2 border-gray-200 dark:border-gray-700 pl-2">
                    {item.children.map((child) => {
                      const isChildActive = pathname === child.href || (child.href && child.href !== '/dashboard' && pathname.startsWith(child.href + '/'))
                      return (
                        <Link
                          key={child.name}
                          href={child.href!}
                          className={cn(
                            'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                            isChildActive
                              ? 'bg-primary text-primary-foreground'
                              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                          )}
                          onClick={() => setSidebarOpen(false)}
                        >
                          <child.icon className="h-4 w-4 flex-shrink-0" />
                          <span className="flex-1">{child.name}</span>
                          {child.badge && (
                            <Badge variant="destructive" className="ml-auto">
                              {child.badge}
                            </Badge>
                          )}
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </nav>

        {/* Back to Home */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
          <Link href="/">
            <Button
              variant="ghost"
              size="sm"
              className={cn("w-full", sidebarCollapsed ? "justify-center" : "justify-start")}
              title="Back to Home"
            >
              <Home className="h-4 w-4" />
              {!sidebarCollapsed && <span className="ml-2">Back to Home</span>}
            </Button>
          </Link>
        </div>

        {/* User info */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
          {!sidebarCollapsed ? (
            <>
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                  {user?.first_name?.[0] || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {user?.first_name || 'User'} {user?.last_name || ''}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user?.email}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </>
          ) : (
            <div className="space-y-3">
              <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold mx-auto">
                {user?.first_name?.[0] || 'U'}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-center"
                onClick={handleLogout}
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </aside>

      {/* Main content */}
      <div className={cn("transition-all duration-300", sidebarCollapsed ? "lg:pl-20" : "lg:pl-64")}>
        {/* Top navbar - Mobile only */}
        <header className="sticky top-0 z-30 h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 lg:hidden">
          <div className="h-full px-4 flex items-center justify-between gap-4">
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>

            {/* Search - Mobile */}
            <div className="flex-1 max-w-lg">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search policies, claims..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {/* Right side actions - Mobile */}
            <div className="flex items-center gap-2">
              {/* Notifications */}
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
              </Button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </ProtectedRoute>
  )
}
