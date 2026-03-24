'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { AuthProvider } from '@/context/AuthContext'
import { Toaster } from 'react-hot-toast'
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster as SonnerToaster } from "@/components/ui/sonner"

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        refetchOnWindowFocus: false,
      },
    },
  }))

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>{children}</TooltipProvider>
        <Toaster  position="bottom-right" />
        <SonnerToaster/>
      </AuthProvider>
    </QueryClientProvider>
  )
}
