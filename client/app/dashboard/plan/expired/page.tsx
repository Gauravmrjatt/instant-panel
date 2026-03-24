'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export default function ExpiredPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-red-600">Plan Expired!</CardTitle>
          <CardDescription>Your subscription has expired. Please renew to continue using our services.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-muted-foreground">
              Contact support to renew your plan and get back to managing your campaigns.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <Link href="/pricing">
              <Button className="w-full">View Plans</Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" className="w-full">Go to Dashboard</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
