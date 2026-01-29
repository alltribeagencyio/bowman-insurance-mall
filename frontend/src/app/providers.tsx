'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { Toaster } from 'sonner'
import { AuthProvider } from '@/lib/auth/auth-context'
import { SidebarProvider } from '@/contexts/sidebar-context'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SidebarProvider>
          {children}
          <Toaster position="top-right" />
        </SidebarProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}
