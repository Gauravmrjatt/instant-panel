'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { apiConfig, authFetch } from '@/lib/config'

export default function BillingPage() {
  const { data: billing, isLoading } = useQuery({
    queryKey: ['billing'],
    queryFn: async () => {
      const res = await authFetch(`${apiConfig.baseUrl}/get/billing`)
      return res.json()
    }
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64" />
      </div>
    )
  }

  const b = billing?.data || {}

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Billing</h1>
        <p className="text-muted-foreground">
          <Link href="/dashboard">Dashboard</Link> / Billing
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Current Plan</CardTitle>
            <CardDescription>Your subscription details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Plan:</span>
              <span className="font-medium">{b.plan || 'Free'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status:</span>
              <span className={b.status === 'active' ? 'text-green-600' : 'text-red-600'}>
                {b.status || 'Inactive'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Expires:</span>
              <span>{b.expiryDate ? new Date(b.expiryDate).toLocaleDateString() : 'N/A'}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Usage</CardTitle>
            <CardDescription>Your current usage</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Campaigns:</span>
              <span>{b.campaignsUsed || 0} / {b.campaignsLimit || 'Unlimited'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">API Calls:</span>
              <span>{b.apiCallsUsed || 0} / {b.apiCallsLimit || 'Unlimited'}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upgrade Plan</CardTitle>
        </CardHeader>
        <CardContent>
          <Link href="/pricing">
            <span className="text-primary hover:underline">View available plans →</span>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
