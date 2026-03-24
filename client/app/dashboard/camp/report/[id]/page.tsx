'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { apiConfig, authFetch } from '@/lib/config'
import {toast} from "sonner";
export default function CampaignReportPage({ params }: { params: { id: string } }) {
  const campaignId = params.id

  const { data: report, isLoading } = useQuery({
    queryKey: ['campaign-report', campaignId],
    queryFn: async () => {
      const res = await authFetch(`${apiConfig.baseUrl}/get/campaign/report/${campaignId}`)
      return res.json()
    },
    enabled: !!campaignId
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64" />
      </div>
    )
  }

  const r = report?.data || {}

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Campaign Report</h1>
        <p className="text-muted-foreground">
          <Link href="/dashboard">Dashboard</Link> / 
          <Link href="/dashboard/liveCampaigns"> Campaigns</Link> / 
          Report
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Clicks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{r.clicks || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{r.leads || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{r.revenue || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">CR</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{r.cr || 0}%</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Campaign Stats</CardTitle>
        </CardHeader>
        <CardContent>
          {report?.data ? (
            <div className="text-center py-8 text-muted-foreground">
              Report data will appear here
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No report data available
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
