'use client'

import ApexChart from '@/components/charts/ApexChart'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useTheme } from 'next-themes'
import type { ApexOptions } from 'apexcharts'
import { useMemo, useState } from 'react'

interface RevenueChartProps {
  data: {
    all: number[]
    approved: number[]
    rejected: number[]
    pending: number[]
  }
  isLoading?: boolean
}

type ChartView = 'area' | 'bar'

function getDayLabels(): string[] {
  const labels: string[] = []
  const today = new Date()
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    labels.push(d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }))
  }
  return labels
}

export function RevenueChart({ data, isLoading }: RevenueChartProps) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const [view, setView] = useState<ChartView>('bar')

  const baseOptions: ApexOptions = useMemo(
    () => ({
      chart: {
        height: '100%',
        toolbar: { show: false },
        fontFamily: 'inherit',
        background: 'transparent',
      },
      dataLabels: { enabled: false },
      xaxis: {
        categories: getDayLabels(),
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
        followCursor: true,
        y: {
          formatter: (val: number) => val.toLocaleString(),
        },
      },
    }),
    [isDark]
  )

  const areaOptions: ApexOptions = useMemo(
    () => ({
      ...baseOptions,
      chart: { ...baseOptions.chart, type: 'area' },
      colors: ['#696cff', '#03c3ec', '#f31260', '#f59e0b'],
      stroke: { curve: 'smooth', width: 2.5 },
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.4,
          opacityTo: 0.1,
          stops: [0, 90, 100],
        },
      },
    }),
    [baseOptions]
  )

  const barOptions: ApexOptions = useMemo(
    () => ({
      ...baseOptions,
      chart: { ...baseOptions.chart, type: 'bar', stacked: true },
      colors: ['#03c3ec', '#f31260', '#f59e0b'],
      plotOptions: {
        bar: {
          borderRadius: 4,
          borderRadiusApplication: 'end',
          columnWidth: '50%',
          horizontal: false,
        },
      },
      fill: {
        opacity: 1,
      },
      legend: {
        ...baseOptions.legend,
        position: 'top',
        horizontalAlign: 'right',
      },
    }),
    [baseOptions]
  )

  const areaSeries = [
    { name: 'All Leads', data: data.all },
    { name: 'Approved', data: data.approved },
    { name: 'Rejected', data: data.rejected },
    { name: 'Pending', data: data.pending },
  ]

  const barSeries = [
    { name: 'Approved', data: data.approved },
    { name: 'Rejected', data: data.rejected },
    { name: 'Pending', data: data.pending },
  ]

  return (
    <Card className="h-full w-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Leads Overview</CardTitle>
            <CardDescription>Last 7 days performance</CardDescription>
          </div>
          <div className="flex gap-1 rounded-4xl bg-muted p-[3px]">
            <Button
              variant={view === 'bar' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setView('bar')}
              className="rounded-xl px-3 h-7 text-xs"
            >
              Bar
            </Button>
            <Button
              variant={view === 'area' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setView('area')}
              className="rounded-xl px-3 h-7 text-xs"
            >
              Area
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-[300px] w-full" />
        ) : (
          <div className="w-full">
            <ApexChart
              type={view}
              options={view === 'area' ? areaOptions : barOptions}
              series={view === 'area' ? areaSeries : barSeries}
              height={300}
              width="100%"
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
