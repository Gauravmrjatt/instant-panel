'use client'

import ApexChart from '@/components/charts/ApexChart'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useTheme } from 'next-themes'
import type { ApexOptions } from 'apexcharts'
import { useMemo } from 'react'

interface RevenueChartProps {
  data: {
    all: number[]
    approved: number[]
    rejected: number[]
    pending: number[]
  }
  isLoading?: boolean
}

export function RevenueChart({ data, isLoading }: RevenueChartProps) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  const chartOptions: ApexOptions = useMemo(
    () => ({
      chart: {
        height: 320,
        type: 'area',
        toolbar: { show: false },
        fontFamily: 'inherit',
        background: 'transparent',
      },
      colors: ['#696cff', '#03c3ec', '#f31260', '#f59e0b'],
      stroke: { curve: 'smooth', width: 2.5 },
      dataLabels: { enabled: false },
      xaxis: {
        categories: ['6 days ago', '5 days ago', '4 days ago', '3 days ago', '2 days ago', 'Yesterday', 'Today'],
        labels: {
          show: true,
          style: {
            colors: isDark ? '#9ca3af' : '#6b7280',
            fontSize: '12px',
          },
        },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: {
        labels: {
          show: true,
          formatter: (val: number) => val.toLocaleString(),
          style: {
            colors: isDark ? '#9ca3af' : '#6b7280',
            fontSize: '12px',
          },
        },
      },
      grid: {
        borderColor: isDark ? '#374151' : '#f3f4f6',
        strokeDashArray: 4,
        padding: { left: 10, right: 10 },
      },
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.4,
          opacityTo: 0.1,
          stops: [0, 90, 100],
        },
      },
      legend: {
        position: 'top',
        horizontalAlign: 'right',
        labels: {
          colors: isDark ? '#9ca3af' : '#6b7280',
        },
        markers: {
          offsetX: -2,
        },
        itemMargin: {
          horizontal: 8,
        },
      },
      tooltip: {
        theme: isDark ? 'dark' : 'light',
        y: {
          formatter: (val: number) => val.toLocaleString(),
        },
      },
    }),
    [isDark]
  )

  const series = [
    { name: 'All Leads', data: data.all },
    { name: 'Approved', data: data.approved },
    { name: 'Rejected', data: data.rejected },
    { name: 'Pending', data: data.pending },
  ]

  return (
    <Card className="col-span-full lg:col-span-2">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Leads Overview</CardTitle>
            <CardDescription>Last 7 days performance</CardDescription>
          </div>
          <div className="flex gap-6 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#696cff]" />
              <span className="text-muted-foreground">All</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#03c3ec]" />
              <span className="text-muted-foreground">Approved</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-[320px] w-full" />
        ) : (
          <ApexChart type="area" options={chartOptions} series={series} height={320} />
        )}
      </CardContent>
    </Card>
  )
}
