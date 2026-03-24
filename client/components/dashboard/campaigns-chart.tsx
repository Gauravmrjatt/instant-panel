'use client'

import ApexChart from '@/components/charts/ApexChart'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { useTheme } from 'next-themes'
import type { ApexOptions } from 'apexcharts'
import { useMemo } from 'react'

interface TopCamp {
  name: string
  count: number
  offerID: number
}

interface CampaignsChartProps {
  camps: TopCamp[]
  totalCamps: number
  isLoading?: boolean
}

const CAMP_COLORS = ['#696cff', '#03c3ec', '#71dd37', '#f59e0b', '#f31260']

export function CampaignsChart({ camps, totalCamps, isLoading }: CampaignsChartProps) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  const total = camps.reduce((acc, c) => acc + c.count, 0) || 1
  const maxCount = Math.max(...camps.map((c) => c.count), 1)

  const chartOptions: ApexOptions = useMemo(
    () => ({
      chart: {
        height: 200,
        width: 200,
        type: 'donut',
        fontFamily: 'inherit',
        background: 'transparent',
      },
      colors: CAMP_COLORS,
      labels: camps.map((c) => c.name),
      stroke: { width: 3, colors: [isDark ? '#1f2937' : '#ffffff'] },
      dataLabels: { enabled: false },
      legend: { show: false },
      plotOptions: {
        pie: {
          donut: {
            size: '70%',
            labels: {
              show: true,
              value: {
                fontSize: '1.25rem',
                fontWeight: 600,
                color: isDark ? '#f3f4f6' : '#111827',
                offsetY: -10,
                formatter: (val: string) => `${Number(val).toFixed(0)}%`,
              },
              name: {
                offsetY: 20,
                fontSize: '0.75rem',
                color: isDark ? '#9ca3af' : '#6b7280',
              },
              total: {
                show: true,
                fontSize: '0.75rem',
                color: isDark ? '#9ca3af' : '#6b7280',
                label: 'Total',
                formatter: () => total.toLocaleString(),
              },
            },
          },
        },
      },
    }),
    [camps, isDark, total]
  )

  const series = camps.map((c) => Number(((c.count / total) * 100).toFixed(1)))

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-24" />
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <Skeleton className="h-[200px] w-[200px] rounded-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Top Campaigns</CardTitle>
        <CardDescription>{totalCamps} active campaigns</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center">
          <ApexChart type="donut" options={chartOptions} series={series} height={200} />
        </div>
        <div className="space-y-3">
          {camps.slice(0, 5).map((camp, index) => (
            <div key={camp.offerID} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="truncate font-medium max-w-[140px]">{camp.name}</span>
                <span className="text-muted-foreground tabular-nums">
                  {camp.count.toLocaleString()}
                </span>
              </div>
              <Progress
                value={(camp.count / maxCount) * 100}
                className="h-2"
                style={
                  {
                    '--progress-color': CAMP_COLORS[index % CAMP_COLORS.length],
                  } as React.CSSProperties
                }
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
