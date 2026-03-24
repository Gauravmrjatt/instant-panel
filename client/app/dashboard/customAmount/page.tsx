'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { apiConfig, authFetch } from '@/lib/config'

import {
  Sparkles,
  Target,
  IndianRupee,
  CheckCircle2,
  Info,
  RefreshCw,
  MessageSquare,
  ArrowLeft,
  Loader2,
} from 'lucide-react'
import {toast} from "sonner";
interface CampaignEvent {
  name: string
  user: string
  refer: string
  userComment: string
  referComment: string
}

interface Campaign {
  _id: string
  name: string
  offerID: number
  events: CampaignEvent[]
}

export default function CustomAmountPage() {
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<CampaignEvent | null>(null)
  const [formData, setFormData] = useState({
    number: '',
    referAmount: '',
    userAmount: '',
    referComment: '',
    userComment: '',
    referPayment: 'instant',
  })

  const { data: campaignsData, isLoading: loadingCampaigns } = useQuery({
    queryKey: ['campaigns'],
    queryFn: async () => {
      const res = await authFetch(`${apiConfig.baseUrl}/get/campaign`)
      return res.json()
    },
  })

  const campaigns: Campaign[] = campaignsData?.data || []

  const createMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        camp: selectedCampaign?._id,
        name: selectedCampaign?.name,
        event: selectedEvent?.name,
        number: formData.number,
        referAmount: formData.referAmount,
        userAmount: formData.userAmount,
        referComment: formData.referComment,
        userComment: formData.userComment,
        referPayment: formData.referPayment,
      }
      const res = await authFetch(`${apiConfig.baseUrl}/api/v1/custom`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      return res.json()
    },
    onSuccess: (data) => {
      if (data.status === true) {
        toast.success(data.msg || 'Custom amount created successfully!')
        setSelectedCampaign(null)
        setSelectedEvent(null)
        setFormData({
          number: '',
          referAmount: '',
          userAmount: '',
          referComment: '',
          userComment: '',
          referPayment: 'instant',
        })
      } else {
        toast.error(data.msg || 'Failed to create custom amount')
      }
    },
    onError: () => {
      toast.error('An error occurred')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCampaign) {
      toast.error('Please select a campaign')
      return
    }
    if (!selectedEvent) {
      toast.error('Please select an event')
      return
    }
    if (!formData.number) {
      toast.error('Please enter UPI ID')
      return
    }
    if (!formData.referAmount) {
      toast.error('Please enter refer amount')
      return
    }
    createMutation.mutate()
  }

  const isFormValid = selectedCampaign && selectedEvent && formData.number && formData.referAmount

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" render={<Link href="/dashboard" />}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Custom Amount</h1>
          <p className="text-muted-foreground">Set custom payment amounts for specific users</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-3">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Campaign & Event Selection */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Target className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Select Campaign & Event</CardTitle>
                  <CardDescription>Choose the campaign and event for custom payout</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Campaign Select */}
              <div className="space-y-2">
                <Label>Campaign</Label>
                <Select
                  value={selectedCampaign?._id || ''}
                  onValueChange={(value) => {
                    const campaign = campaigns.find((c) => c._id === value)
                    setSelectedCampaign(campaign || null)
                    setSelectedEvent(null)
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={loadingCampaigns ? 'Loading campaigns...' : 'Select a campaign'} />
                  </SelectTrigger>
                  <SelectContent>
                    {campaigns.map((campaign) => (
                      <SelectItem key={campaign._id} value={campaign._id}>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="font-mono text-xs">{campaign.offerID}</Badge>
                          <span>{campaign.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Event Select */}
              <div className="space-y-2">
                <Label>Event</Label>
                <Select
                  value={selectedEvent?.name || ''}
                  onValueChange={(value) => {
                    const event = selectedCampaign?.events.find((e) => e.name === value)
                    setSelectedEvent(event || null)
                    if (event) {
                      setFormData((prev) => ({
                        ...prev,
                        referAmount: event.refer || '',
                        userAmount: event.user || '',
                      }))
                    }
                  }}
                  disabled={!selectedCampaign}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={selectedCampaign ? 'Select an event' : 'Select campaign first'} />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedCampaign?.events.map((event, index) => (
                      <SelectItem key={index} value={event.name}>
                        {event.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Default Amounts Preview */}
              {selectedEvent && (
                <div className="p-4 rounded-lg bg-muted/50 border">
                  <p className="text-sm text-muted-foreground mb-3 flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    Default Campaign Rates:
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-lg bg-background">
                      <p className="text-xs text-muted-foreground mb-1">Refer Amount</p>
                      <p className="text-lg font-bold text-primary">₹{selectedEvent.refer || 0}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-background">
                      <p className="text-xs text-muted-foreground mb-1">User Amount</p>
                      <p className="text-lg font-bold">₹{selectedEvent.user || 0}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Details */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10">
                  <IndianRupee className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <CardTitle>Payment Details</CardTitle>
                  <CardDescription>Enter custom amounts and UPI details</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* UPI Input */}
              <div className="space-y-2">
                <Label>Referrer UPI</Label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="user@upi"
                    value={formData.number}
                    onChange={(e) => setFormData((prev) => ({ ...prev, number: e.target.value }))}
                    className="pl-10 font-mono"
                  />
                </div>
              </div>

              {/* Amounts Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Refer Amount</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={formData.referAmount}
                      onChange={(e) => setFormData((prev) => ({ ...prev, referAmount: e.target.value }))}
                      className="pl-8 font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>User Amount <span className="text-muted-foreground text-sm">(optional)</span></Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={formData.userAmount}
                      onChange={(e) => setFormData((prev) => ({ ...prev, userAmount: e.target.value }))}
                      className="pl-8 font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Comments Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Refer Comment <span className="text-muted-foreground text-sm">(optional)</span></Label>
                  <div className="relative">
                    <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Custom comment"
                      value={formData.referComment}
                      onChange={(e) => setFormData((prev) => ({ ...prev, referComment: e.target.value }))}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>User Comment <span className="text-muted-foreground text-sm">(optional)</span></Label>
                  <div className="relative">
                    <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Custom comment"
                      value={formData.userComment}
                      onChange={(e) => setFormData((prev) => ({ ...prev, userComment: e.target.value }))}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              {/* Refer Payment Toggle */}
              <div className="space-y-2">
                <Label>Refer Payment Type</Label>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    variant={formData.referPayment === 'instant' ? 'default' : 'outline'}
                    onClick={() => setFormData((prev) => ({ ...prev, referPayment: 'instant' }))}
                    className="gap-2"
                  >
                    Instant
                  </Button>
                  <Button
                    type="button"
                    variant={formData.referPayment === 'pending' ? 'secondary' : 'outline'}
                    onClick={() => setFormData((prev) => ({ ...prev, referPayment: 'pending' }))}
                    className="gap-2"
                  >
                    Pending
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Submit Button */}
              <Button type="submit" size="lg" disabled={!isFormValid || createMutation.isPending} className="w-full gap-2">
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Create Custom Amount
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Summary Card */}
          {isFormValid && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Campaign</p>
                  <p className="font-medium text-sm truncate">{selectedCampaign?.name}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Event</p>
                  <p className="font-medium text-sm">{selectedEvent?.name}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">UPI</p>
                  <p className="font-mono text-sm">{formData.number}</p>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Refer Amount</span>
                  <span className="text-lg font-bold text-primary">₹{Number(formData.referAmount).toLocaleString()}</span>
                </div>
                {formData.userAmount && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">User Amount</span>
                    <span className="font-bold">₹{Number(formData.userAmount).toLocaleString()}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Quick Links */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-between" render={<Link href="/dashboard/viewCustom" />}>
                View Custom Amounts
              </Button>
              <Button variant="outline" className="w-full justify-between" render={<Link href="/dashboard/pay-to-user" />}>
                Quick Payment
              </Button>
              <Button variant="outline" className="w-full justify-between" render={<Link href="/dashboard/pending" />}>
                Pending Approvals
              </Button>
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Info className="h-4 w-4" />
                How it Works
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">1</div>
                <p className="text-sm">Select campaign</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">2</div>
                <p className="text-sm">Select event</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">3</div>
                <p className="text-sm">Enter UPI and amount</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">4</div>
                <p className="text-sm">Create custom amount</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>

    </div>
  )
}
