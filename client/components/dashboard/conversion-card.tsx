'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Target, MousePointerClick, Users } from 'lucide-react'

interface ConversionCardProps {
  totalClicks: number
  totalLeads: number
  todayLeads: number
  isLoading?: boolean
}

export function ConversionCard({
  totalClicks,
  totalLeads,
  todayLeads,
  isLoading,
}: ConversionCardProps) {
  const conversionRate =
    totalClicks > 0 ? ((totalLeads / totalClicks) * 100).toFixed(2) : '0.00'

  const avgDaily = totalLeads / 7
  const projection = avgDaily * 30

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-24" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-32 w-full rounded-lg" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Conversion Analytics</CardTitle>
        <CardDescription>Performance metrics</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl font-bold tracking-tight">{conversionRate}%</div>
              <p className="text-xs text-muted-foreground">Conversion Rate</p>
            </div>
          </div>
          <svg className="w-full h-36" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-muted"
            />
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              strokeDasharray={`${Number(conversionRate) * 2.51} 251`}
              strokeLinecap="round"
              className="text-primary transition-all duration-500"
              transform="rotate(-90 50 50)"
            />
          </svg>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <div className="p-2 rounded-lg bg-primary/10">
              <MousePointerClick className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Clicks</p>
              <p className="font-semibold tabular-nums">{totalClicks.toLocaleString()}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <div className="p-2 rounded-lg bg-emerald-500/10">
              <Users className="h-4 w-4 text-emerald-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Leads</p>
              <p className="font-semibold tabular-nums">{totalLeads.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="space-y-2 pt-2 border-t">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Avg Daily Leads</span>
            <span className="font-medium">{avgDaily.toFixed(0)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Today&apos;s Leads</span>
            <Badge variant="secondary" className="font-mono">
              {todayLeads.toLocaleString()}
            </Badge>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Monthly Projection</span>
            <span className="font-semibold tabular-nums text-primary">
              {projection.toFixed(0)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
