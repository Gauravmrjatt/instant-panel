'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Activity, Zap, Settings, Layers } from 'lucide-react'

interface CampaignStatsProps {
  campaigns: Array<{ events?: Array<unknown> }>
  isLoading?: boolean
}

interface StatCardProps {
  title: string
  value: number | string
  icon: React.ComponentType<{ className?: string }>
  description?: string
  iconColor?: string
  bgColor?: string
}

function StatCard({ title, value, icon: Icon, description, iconColor = 'text-primary', bgColor = 'bg-primary/10' }: StatCardProps) {
  return (
    <Card className="relative overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold tracking-tight">{value}</p>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
          <div className={`p-3 rounded-xl ${bgColor}`}>
            <Icon className={`h-6 w-6 ${iconColor}`} />
          </div>
        </div>
      </CardContent>
      <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent to-transparent" />
    </Card>
  )
}

function StatCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="h-12 w-12 rounded-xl" />
        </div>
      </CardContent>
    </Card>
  )
}

export function CampaignStats({ campaigns, isLoading }: CampaignStatsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  const totalCampaigns = campaigns.length
  const activeCampaigns = campaigns.length
  const totalEvents = campaigns.reduce((acc, camp) => acc + (camp.events?.length || 0), 0)
  const avgEventsPerCampaign = totalCampaigns > 0 ? (totalEvents / totalCampaigns).toFixed(1) : '0'

  const stats: StatCardProps[] = [
    {
      title: 'Total Campaigns',
      value: totalCampaigns,
      icon: Layers,
      description: 'All campaigns',
      iconColor: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Active Campaigns',
      value: activeCampaigns,
      icon: Zap,
      description: 'Currently running',
      iconColor: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
    },
    {
      title: 'Total Events',
      value: totalEvents,
      icon: Activity,
      description: 'Across all campaigns',
      iconColor: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
    },
    {
      title: 'Avg Events',
      value: avgEventsPerCampaign,
      icon: Settings,
      description: 'Per campaign',
      iconColor: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <div
          key={stat.title}
          className="animate-in fade-in slide-in-from-bottom-4"
          style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'both' }}
        >
          <StatCard {...stat} />
        </div>
      ))}
    </div>
  )
}
