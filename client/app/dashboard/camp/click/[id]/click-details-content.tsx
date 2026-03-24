'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { authFetch, apiConfig } from '@/lib/config'
import {toast} from 'sonner'
import {
  ArrowLeft,
  Copy,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  Monitor,
  Smartphone,
  Globe,
  User,
  Hash,
  CreditCard,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Zap,
} from 'lucide-react'

interface ClickDetails {
  status: boolean
  msg?: string
  leadData?: {
    message: string
    status: string
    paymentStatus: string
    payMessage: string
    clickId: {
      click: string
      user: string
      refer: string
      ip: string
      createdAt: string
      params: Record<string, string>
      device?: {
        os?: { name?: string }
        client?: { name?: string }
        device?: { type?: string; brand?: string; model?: string }
      }
    }
  }
  payments?: {
    status: boolean
    data: Array<{
      type: string
      createdAt: string
      payUrl: string
      response: Record<string, unknown>
    }>
  }
}

function formatDateTime(time: string) {
  const date = new Date(time)
  return date.toLocaleString('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'Approved':
      return <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/10">{status}</Badge>
    case 'Pending':
      return <Badge className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/10">{status}</Badge>
    case 'Rejected':
      return <Badge className="bg-red-500/10 text-red-600 hover:bg-red-500/10">{status}</Badge>
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}

function getPaymentBadge(status: string) {
  switch (status) {
    case 'ACCEPTED':
      return <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/10">{status}</Badge>
    case 'PENDING':
      return <Badge className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/10">{status}</Badge>
    case 'FAILURE':
    case 'fail':
      return <Badge className="bg-red-500/10 text-red-600 hover:bg-red-500/10">{status}</Badge>
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}

export default function ClickDetailsContent({ clickId, event }: { clickId: string; event: string }) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [showUserResponse, setShowUserResponse] = useState(false)
  const [showReferResponse, setShowReferResponse] = useState(false)

  const { data, isLoading, isError } = useQuery<ClickDetails>({
    queryKey: ['click-details', clickId, event],
    queryFn: async () => {
      const res = await authFetch(`${apiConfig.baseUrl}/get/click/${clickId}/?event=${event}`)
      return res.json()
    },
    enabled: !!clickId && !!event,
  })

  const updateLeadMutation = useMutation({
    mutationFn: async (status: string) => {
      const res = await authFetch(`${apiConfig.baseUrl}/update/leadStatus`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadStatus: status, ID: clickId }),
      })
      return res.json()
    },
    onSuccess: (data) => {
      if (data.status) {
        queryClient.invalidateQueries({ queryKey: ['click-details', clickId, event] })
        toast.success('Lead status updated!')
      } else {
        toast.error(data.msg || 'Failed to update status')
      }
    },
    onError: () => {
      toast.error('Failed to update status')
    },
  })

  const payNowMutation = useMutation({
    mutationFn: async () => {
      const res = await authFetch(`${apiConfig.baseUrl}/update/payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ getEvent: event, ID: clickId }),
      })
      return res.json()
    },
    onSuccess: (data) => {
      if (data.status) {
        queryClient.invalidateQueries({ queryKey: ['click-details', clickId, event] })
        toast.success('Payment processed!')
        router.refresh()
      } else {
        toast.error(data.msg || 'Payment failed')
      }
    },
    onError: () => {
      toast.error('Payment failed')
    },
  })

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard!')
  }

  if (isError || data?.status === false) {
    return (
      <div className="min-h-screen p-6 w-full">
        <Card className="max-w-md mx-auto mt-20">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertTriangle className="h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Lead Found</h2>
            <p className="text-muted-foreground text-center mb-6">{data?.msg || 'The requested lead could not be found.'}</p>
            <Button onClick={() => router.back()}>
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const leadData = data?.leadData
  const payments = data?.payments

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4  mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">Lead Details</h1>
              {leadData?.status && getStatusBadge(leadData.status)}
            </div>
            <p className="text-muted-foreground">
              <Link href="/dashboard" className="hover:underline">Dashboard</Link> /{' '}
              <Link href="/dashboard/liveCampaigns" className="hover:underline">Campaigns</Link> /{' '}
              Click Details
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Click ID Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Hash className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Click ID</CardTitle>
                <CardDescription>Unique identifier for this click</CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <div className="flex items-center gap-3">
              <code className="flex-1 p-3 bg-muted rounded-lg font-mono text-sm">
                {leadData?.clickId?.click || '-'}
              </code>
              <Button
                variant="outline"
                size="icon"
                onClick={() => copyToClipboard(leadData?.clickId?.click || '')}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lead Status Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <User className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <CardTitle>Lead Status</CardTitle>
              <CardDescription>Update the status of this lead</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-10 w-full max-w-xs" />
          ) : (
            <>
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Message</p>
                  <p className="font-medium">{leadData?.message || '-'}</p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button variant="outline" className="gap-2">
                        {getStatusBadge(leadData?.status || '')}
                        <span className="text-muted-foreground">▼</span>
                      </Button>
                    }
                  />
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => updateLeadMutation.mutate('Approved')}
                      disabled={updateLeadMutation.isPending}
                      className="text-emerald-600 cursor-pointer"
                    >
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Approved
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => updateLeadMutation.mutate('Pending')}
                      disabled={updateLeadMutation.isPending}
                      className="text-amber-600 cursor-pointer"
                    >
                      <Clock className="mr-2 h-4 w-4" />
                      Pending
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => updateLeadMutation.mutate('Rejected')}
                      disabled={updateLeadMutation.isPending}
                      className="text-red-600 cursor-pointer"
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Rejected
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Payment Status Card */}
      {payments?.status ? (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <CreditCard className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <CardTitle>Payment Status</CardTitle>
                <CardDescription>View payment details and responses</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 lg:grid-cols-2">
              {/* User Payment */}
              <div className="space-y-3">
                <h4 className="font-semibold text-sm text-muted-foreground">User Payment</h4>
                <div className="p-4 rounded-lg border bg-card">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm">User</span>
                    <code className="text-sm">{leadData?.clickId?.user || '-'}</code>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Response</span>
                    <Dialog open={showUserResponse} onOpenChange={setShowUserResponse}>
                      <DialogTrigger
                        render={
                          <Button variant="outline" size="sm" className="gap-2">
                            <Eye className="h-4 w-4" />
                            View
                          </Button>
                        }
                      />
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>User Payment Response</DialogTitle>
                          <DialogDescription>
                            Gateway: {payments.data[0]?.type || '-'}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 mt-4">
                          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                            <span className="text-sm">Time</span>
                            <span className="font-mono text-sm">
                              {payments.data[0]?.createdAt ? formatDateTime(payments.data[0].createdAt) : '-'}
                            </span>
                          </div>
                          <div className="space-y-2">
                            <p className="text-sm font-medium">URL</p>
                            <div className="p-3 bg-muted rounded-lg text-xs w-full overflow-x-scroll">
                              {payments.data[1]?.payUrl || '-'}
                            </div>
                          </div>
                          <div className="space-y-2">
                            <p className="text-sm font-medium">Response</p>
                            <pre className="p-3 bg-muted rounded-lg text-xs overflow-x-auto max-h-64">
                              {JSON.stringify(payments.data[0]?.response || {}, null, 2)}
                            </pre>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </div>

              {/* Refer Payment */}
              <div className="space-y-3">
                <h4 className="font-semibold text-sm text-muted-foreground">Refer Payment</h4>
                <div className="p-4 rounded-lg border bg-card">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm">Refer</span>
                    <code className="text-sm">{leadData?.clickId?.refer || '-'}</code>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Response</span>
                    <Dialog open={showReferResponse} onOpenChange={setShowReferResponse}>
                      <DialogTrigger
                        render={
                          <Button variant="outline" size="sm" className="gap-2">
                            <Eye className="h-4 w-4" />
                            View
                          </Button>
                        }
                      />
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Refer Payment Response</DialogTitle>
                          <DialogDescription>
                            Gateway: {payments.data[1]?.type || '-'}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 mt-4">
                          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                            <span className="text-sm">Time</span>
                            <span className="font-mono text-sm">
                              {payments.data[1]?.createdAt ? formatDateTime(payments.data[1].createdAt) : '-'}
                            </span>
                          </div>
                          <div className="space-y-2">
                            <p className="text-sm font-medium">URL</p>
                            <div className="p-3 bg-muted rounded-lg text-xs w-full overflow-x-scroll">
                              {payments.data[1]?.payUrl || '-'}
                            </div>
                          </div>
                          <div className="space-y-2">
                            <p className="text-sm font-medium">Response</p>
                            <pre className="p-3 bg-muted rounded-lg text-xs overflow-x-auto max-h-64">
                              {JSON.stringify(payments.data[1]?.response || {}, null, 2)}
                            </pre>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <CreditCard className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <CardTitle>Payment Status</CardTitle>
                <CardDescription>Manual payment processing required</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <Skeleton className="h-20 w-full" />
            ) : (
              <>
                <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                  <div>
                    <p className="font-medium">{leadData?.payMessage || '-'}</p>
                    <p className="text-sm text-muted-foreground">Current Status</p>
                  </div>
                  {getPaymentBadge(leadData?.paymentStatus || '')}
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                    <div>
                      <p className="font-medium">Manual Payment Required</p>
                      <p className="text-sm text-muted-foreground">Click below to process payment</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => payNowMutation.mutate()}
                    disabled={payNowMutation.isPending}
                    className="gap-2"
                  >
                    {payNowMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-4 w-4" />
                        Pay Now
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Details Grid */}
      <div className="grid gap-6 lg:grid-cols-4">
        {/* Basic Details */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <User className="h-5 w-5 text-blue-500" />
              </div>
              <CardTitle>Details</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? (
              <>
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </>
            ) : (
              <>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">User</span>
                  </div>
                  <code className="text-sm">{leadData?.clickId?.user || '-'}</code>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Refer</span>
                  </div>
                  <code className="text-sm">{leadData?.clickId?.refer || '-'}</code>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">IP</span>
                  </div>
                  <code className="text-sm">{leadData?.clickId?.ip || '-'}</code>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Time</span>
                  </div>
                  <span className="text-xs">
                    {leadData?.clickId?.createdAt ? formatDateTime(leadData.clickId.createdAt) : '-'}
                  </span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Params */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-violet-500/10">
                <Hash className="h-5 w-5 text-violet-500" />
              </div>
              <CardTitle>Params</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {isLoading ? (
              <>
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </>
            ) : (
              <>
                {leadData?.clickId?.params && Object.entries(leadData.clickId.params).length > 0 ? (
                  Object.entries(leadData.clickId.params).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <span className="text-sm font-medium">{key}</span>
                      <code className="text-xs">{value}</code>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">No params available</p>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Client Info */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-cyan-500/10">
                <Monitor className="h-5 w-5 text-cyan-500" />
              </div>
              <CardTitle>Client Info</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? (
              <>
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </>
            ) : (
              <>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2">
                    <Monitor className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">OS</span>
                  </div>
                  <span className="text-sm">{leadData?.clickId?.device?.os?.name || '-'}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Browser</span>
                  </div>
                  <span className="text-sm">{leadData?.clickId?.device?.client?.name || '-'}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Device Type</span>
                  </div>
                  <span className="text-sm">{leadData?.clickId?.device?.device?.type || '-'}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Device</span>
                  </div>
                  <span className="text-sm">
                    {[leadData?.clickId?.device?.device?.brand, leadData?.clickId?.device?.device?.model]
                      .filter(Boolean)
                      .join(' ') || '-'}
                  </span>
                </div>
                <Dialog>
                  <DialogTrigger
                    render={
                      <Button variant="outline" size="sm" className="w-full mt-2 gap-2">
                        <Eye className="h-4 w-4" />
                        View Full Details
                      </Button>
                    }
                  />
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Full Device Details</DialogTitle>
                    </DialogHeader>
                    <pre className="p-4 bg-muted rounded-lg text-xs overflow-x-auto max-h-96">
                      {JSON.stringify(leadData?.clickId?.device || {}, null, 2)}
                    </pre>
                  </DialogContent>
                </Dialog>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
