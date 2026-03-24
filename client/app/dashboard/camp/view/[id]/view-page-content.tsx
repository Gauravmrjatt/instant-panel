'use client'
import { Suspense, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { authFetch, apiConfig } from '@/lib/config'

import { LeadsTable } from '@/components/leads/leads-table'
import { useLeads } from '@/hooks/useLeads'
import {
  ArrowLeft,
  Edit,
  FileText,
  BarChart3,
  Zap,
  Globe,
  Shield,
  Copy,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Clock,
  Hash,
  Users,
  AlertCircle,
  Link as LinkIcon,
  IndianRupee,
  Settings,
  Search,
  Timer,
  RefreshCw,
  Eye,
} from 'lucide-react'
import {toast} from "sonner";
interface EventData {
  name: string
  user: string
  refer: string
  userComment: string
  referComment: string
  caps: string
  time: string
  payMode: string
  capSwitch: boolean
  timeSwitch: boolean
  dailySwitch: boolean
  dailyCaps: string
}

export default function ViewCampaignContent({ campaignId }: { campaignId: string }) {
  const router = useRouter()
  const [domain, setDomain] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const { data: campaign, isLoading: isLoadingCampaign } = useQuery({
    queryKey: ['campaign', campaignId],
    queryFn: async () => {
      const res = await authFetch(`${apiConfig.baseUrl}/get/campaign/${campaignId}`)
      return res.json()
    },
    enabled: !!campaignId && campaignId.length > 0
  })

  const { data: report } = useQuery({
    queryKey: ['campaign-report', campaignId],
    queryFn: async () => {
      const res = await authFetch(`${apiConfig.baseUrl}/get/new/reports/${campaignId}`)
      return res.json()
    },
    enabled: !!campaignId && campaignId.length > 0
  })

  const { data: leadsData, isLoading: isLoadingLeads, refetch } = useLeads(campaignId)

  useEffect(() => {
    setDomain(window.location.origin)
  }, [])

  const c = campaign?.data || {}
  const events: EventData[] = c.events || []
  const ips: string[] = c.ips || []

  const reportData = report?.data || {
    leadsCount: 0,
    clicksCount: 0,
    totalAmount: 0,
    cr: 0,
  }

  const trackingUrl = domain
    ? `${domain}/api/v1/click/${campaignId}?aff_click_id={user_number}&sub_aff_id={refer_number}&userIp={ip}&device={user_agent}&number={number}`
    : ''

  const totalUserPayout = events.reduce((sum, e) => sum + (parseFloat(e.user) || 0), 0)
  const totalReferPayout = events.reduce((sum, e) => sum + (parseFloat(e.refer) || 0), 0)

  const copyTrackingUrl = () => {
    if (trackingUrl) {
      navigator.clipboard.writeText(trackingUrl)
      toast.success('Tracking URL copied!')
    }
  }

  if (isLoadingCampaign) {
    return (
      <div className="space-y-6 p-6 max-w-[1600px] mx-auto animate-pulse">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4  mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.push('/dashboard/liveCampaigns')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{c.name || 'Campaign Details'}</h1>
              <Badge variant={c.campStatus ? 'default' : 'secondary'} className="gap-1">
                {c.campStatus ? (
                  <>
                    <CheckCircle2 className="h-3 w-3" />
                    Active
                  </>
                ) : (
                  <>
                    <XCircle className="h-3 w-3" />
                    Inactive
                  </>
                )}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              <Link href="/dashboard" className="hover:underline">Dashboard</Link> /{' '}
              <Link href="/dashboard/liveCampaigns" className="hover:underline">Campaigns</Link> /{' '}
              View
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Link href={`/dashboard/camp/edit/${campaignId}`}>
            <Button variant="outline" size="sm" className="gap-2">
              <Edit className="h-4 w-4" />
              Edit
            </Button>
          </Link>
          <Link href={`/dashboard/camp/report/${campaignId}`}>
            <Button variant="outline" size="sm" className="gap-2">
              <FileText className="h-4 w-4" />
              Report
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Leads</p>
                <p className="text-2xl font-bold">{reportData.leadsCount || 0}</p>
              </div>
              <div className="p-3 rounded-lg bg-emerald-500/10">
                <Users className="h-5 w-5 text-emerald-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Clicks</p>
                <p className="text-2xl font-bold">{reportData.clicksCount || 0}</p>
              </div>
              <div className="p-3 rounded-lg bg-primary/10">
                <BarChart3 className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Payout</p>
                <p className="text-2xl font-bold">₹{(reportData.totalAmount || 0).toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-lg bg-amber-500/10">
                <IndianRupee className="h-5 w-5 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Conversion Rate</p>
                <p className="text-2xl font-bold">{(reportData.cr || 0).toFixed(2)}%</p>
              </div>
              <div className="p-3 rounded-lg bg-violet-500/10">
                <Zap className="h-5 w-5 text-violet-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="w-full">
    
          {/* Leads Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <Users className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <CardTitle>Leads</CardTitle>
                    <CardDescription>View and manage leads for this campaign</CardDescription>
                  </div>
                </div>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    className="pl-9"
                    placeholder="Search leads..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <LeadsTable
                data={leadsData || []}
                isLoading={isLoadingLeads}
                campaignId={campaignId}
                searchQuery={searchQuery}
              />
            </CardContent>
          </Card>
        </div>

    
  
    </div>
  )
}

