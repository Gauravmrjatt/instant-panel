'use client'

import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  trend?: number
  isCurrency?: boolean
  isLoading?: boolean
  variant?: 'default' | 'primary' | 'success' | 'warning'
}

const variantStyles = {
  default: 'bg-muted/50',
  primary: 'bg-primary/10',
  success: 'bg-emerald-500/10',
  warning: 'bg-amber-500/10',
}

const iconStyles = {
  default: 'text-muted-foreground',
  primary: 'text-primary',
  success: 'text-emerald-500',
  warning: 'text-amber-500',
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  isCurrency,
  isLoading,
  variant = 'default',
}: StatCardProps) {
  const formatValue = (val: string | number) => {
    if (typeof val === 'number') {
      if (isCurrency) {
        return new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: 'INR',
          maximumFractionDigits: 0,
        }).format(val)
      }
      return new Intl.NumberFormat('en-IN').format(val)
    }
    return val
  }

  const getTrendIcon = () => {
    if (trend === undefined || trend === 0) return Minus
    return trend > 0 ? TrendingUp : TrendingDown
  }

  const TrendIcon = getTrendIcon()
  const isPositive = trend !== undefined && trend > 0
  const isNegative = trend !== undefined && trend < 0

  if (isLoading) {
    return (
      <Card className="overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="h-12 w-12 rounded-xl" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden transition-all duration-200 hover:shadow-md">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1 flex-1 min-w-0">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold tracking-tight truncate">
              {formatValue(value)}
            </p>
            <div className="flex items-center gap-2">
              {trend !== undefined && (
                <Badge
                  variant={isPositive ? 'default' : 'destructive'}
                  className={`gap-1 px-1.5 py-0.5 text-xs font-medium ${
                    isPositive
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10'
                      : 'bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/10'
                  }`}
                >
                  <TrendIcon className="h-3 w-3" />
                  {Math.abs(trend).toFixed(1)}%
                </Badge>
              )}
              {subtitle && (
                <p className="text-xs text-muted-foreground truncate">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          <div
            className={`p-3 rounded-xl ${variantStyles[variant]} transition-transform duration-200 hover:scale-105`}
          >
            <Icon className={`h-6 w-6 ${iconStyles[variant]}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
