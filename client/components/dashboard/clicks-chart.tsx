'use client'

import ApexChart from '@/components/charts/ApexChart'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useTheme } from 'next-themes'
import type { ApexOptions } from 'apexcharts'
import { useMemo } from 'react'

interface ClicksChartProps {
  data: number[]
  totalClicks: number
  isLoading?: boolean
}

export function ClicksChart({ data, totalClicks, isLoading }: ClicksChartProps) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  const chartOptions: ApexOptions = useMemo(
    () => ({
      chart: {
        height: 220,
        type: 'bar',
        toolbar: { show: false },
        fontFamily: 'inherit',
        background: 'transparent',
      },
      colors: ['#696cff'],
      plotOptions: {
        bar: {
          borderRadius: 6,
          borderRadiusApplication: 'end',
          columnWidth: '50%',
          distributed: false,
          dataLabels: { position: 'top' },
        },
      },
      dataLabels: {
        enabled: true,
        formatter: (val: number) => val.toLocaleString(),
        offsetY: -20,
        style: {
          fontSize: '10px',
          colors: [isDark ? '#9ca3af' : '#6b7280'],
        },
      },
      xaxis: {
        categories: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'],
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
          formatter: (val: number) => val.toLocaleString(),
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
        yaxis: { lines: { show: true } },
      },
      fill: {
        type: 'gradient',
        gradient: {
          shade: 'light',
          type: 'vertical',
          shadeIntensity: 0.15,
          gradientToColors: undefined,
          opacityFrom: 0.8,
          opacityTo: 0.4,
          stops: [0, 100],
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

  const series = [{ name: 'Clicks', data }]

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Clicks Overview</CardTitle>
            <CardDescription>Last 7 days</CardDescription>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{totalClicks.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total Clicks</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-[220px] w-full" />
        ) : (
          <ApexChart type="bar" options={chartOptions} series={series} height={220} />
        )}
      </CardContent>
    </Card>
  )
}
