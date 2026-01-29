'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface SidebarContextType {
  sidebarCollapsed: boolean
  setSidebarCollapsed: (collapsed: boolean) => void
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <SidebarContext.Provider value={{ sidebarCollapsed, setSidebarCollapsed }}>
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  const context = useContext(SidebarContext)
  if (context === undefined) {
    // Return default values when used outside provider (e.g., for non-dashboard pages)
    return { sidebarCollapsed: false, setSidebarCollapsed: () => {} }
  }
  return context
}
