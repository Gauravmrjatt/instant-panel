'use client'

import ApexChart from '@/components/charts/ApexChart'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useTheme } from 'next-themes'
import type { ApexOptions } from 'apexcharts'
import { useMemo } from 'react'

interface PaymentsChartProps {
  data: number[]
  todayPayments: number
  yesterdayPayments: number
  grow: number
  isLoading?: boolean
}

export function PaymentsChart({
  data,
  todayPayments,
  yesterdayPayments,
  grow,
  isLoading,
}: PaymentsChartProps) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  const total = data.reduce((a, b) => a + b, 0)
  const avgDaily = total / data.length

  const chartOptions: ApexOptions = useMemo(
    () => ({
      chart: {
        height: 200,
        type: 'area',
        toolbar: { show: false },
        fontFamily: 'inherit',
        background: 'transparent',
        dropShadow: {
          enabled: true,
          top: 10,
          left: 5,
          blur: 5,
          color: '#f59e0b',
          opacity: 0.15,
        },
      },
      colors: ['#f59e0b'],
      stroke: { curve: 'smooth', width: 3 },
      dataLabels: { enabled: false },
      xaxis: {
        categories: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Yesterday', 'Today'],
        labels: {
          show: true,
          style: {
            colors: isDark ? '#9ca3af' : '#6b7280',
            fontSize: '11px',
          },
        },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: {
        labels: {
          show: true,
          formatter: (val: number) =>
            val >= 1000 ? `₹${(val / 1000).toFixed(0)}k` : `₹${val}`,
          style: {
            colors: isDark ? '#9ca3af' : '#6b7280',
            fontSize: '11px',
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
          opacityTo: 0.05,
          stops: [0, 90, 100],
        },
      },
      tooltip: {
        theme: isDark ? 'dark' : 'light',
        y: {
          formatter: (val: number) =>
            new Intl.NumberFormat('en-IN', {
              style: 'currency',
              currency: 'INR',
              maximumFractionDigits: 0,
            }).format(val),
        },
      },
    }),
    [isDark]
  )

  const series = [{ name: 'Payments', data }]

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-24" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[200px] w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Payment Trends</CardTitle>
            <CardDescription>7 days revenue</CardDescription>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: 'INR',
                maximumFractionDigits: 0,
              }).format(total)}
            </div>
            <p className="text-xs text-muted-foreground">Total Week Revenue</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <ApexChart type="area" options={chartOptions} series={series} height={200} />

        <div className="grid grid-cols-3 gap-4 pt-4 border-t">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Today</p>
            <p className="font-semibold tabular-nums">
              {new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: 'INR',
                maximumFractionDigits: 0,
              }).format(todayPayments)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Yesterday</p>
            <p className="font-semibold tabular-nums">
              {new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: 'INR',
                maximumFractionDigits: 0,
              }).format(yesterdayPayments)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Avg/Day</p>
            <p className="font-semibold tabular-nums">
              {new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: 'INR',
                maximumFractionDigits: 0,
              }).format(avgDaily)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
