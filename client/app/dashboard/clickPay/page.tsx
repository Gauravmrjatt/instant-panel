'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { useMutation } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { apiConfig, authFetch } from '@/lib/config'
import {toast} from "sonner";
import { MousePointerClick, AlertCircle, CheckCircle2, Loader2, Upload } from 'lucide-react'

export default function ClickPayPage() {
  const [formData, setFormData] = useState({
    user: '',
    value: ''
  })
  const [clickIds, setClickIds] = useState<string[]>([])
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const payMutation = useMutation({
    mutationFn: async (data: { user: string; clickId: string[] }) => {
      const res = await authFetch(`${apiConfig.baseUrl}/pay/clickId`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      return res.json()
    },
    onSuccess: (data) => {
      if (data.status) {
        toast.success(data.msg || 'Payment processed successfully')
      } else {
        toast.error(data.msg || 'Payment failed')
      }
    },
    onError: (error) => {
      toast.error(error.message || 'An error occurred')
    }
  })

  const explode = (str: string, delimiters: string[]) => {
    let ready = str
    for (const d of delimiters) {
      ready = ready.split(d).join(',')
    }
    const arr = ready.split(',')
    return arr.filter((value) => value !== '' && value.trim() !== '')
  }

  const handleInputChange = (value: string) => {
    setFormData(prev => ({ ...prev, value }))
    const ids = explode(value, [',', '.', '|', ':', '\r\n', '\n'])
    setClickIds(ids)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.user.trim()) {
      toast.error('Please enter an Event Name')
      return
    }
    if (clickIds.length === 0) {
      toast.error('Please enter at least one Click ID')
      return
    }

    payMutation.mutate({ user: formData.user, clickId: clickIds })
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-primary/10">
          <MousePointerClick className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pay by ClickId</h1>
          <p className="text-muted-foreground">Process payments for users by their Click IDs</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Click IDs Entered</p>
                <p className="text-2xl font-bold">{clickIds.length}</p>
              </div>
              <div className="p-3 rounded-lg bg-amber-500/10">
                <Upload className="h-5 w-5 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Event Name</p>
                <p className="text-lg font-semibold truncate">
                  {formData.user || 'Not set'}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-emerald-500/10">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <p className="text-lg font-semibold">
                  {payMutation.isPending ? 'Processing' : 'Ready'}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${payMutation.isPending ? 'bg-primary/10' : 'bg-muted'}`}>
                {payMutation.isPending ? (
                  <Loader2 className="h-5 w-5 text-primary animate-spin" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload Conversion
              </CardTitle>
              <CardDescription>Enter Click IDs to process payments for users</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Event Name Input */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Event Name <span className="text-destructive">*</span>
                  </label>
                  <Input
                    placeholder="Enter event name (e.g., campaign_conversion)"
                    value={formData.user}
                    onChange={(e) => setFormData(prev => ({ ...prev, user: e.target.value }))}
                    className="rounded-lg"
                  />
                </div>

                {/* Click IDs Textarea */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Click IDs <span className="text-destructive">*</span>
                  </label>
                  <textarea
                    ref={inputRef}
                    className="flex min-h-[150px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm resize-none focus-visible:ring-2 focus-visible:ring-primary"
                    placeholder="Enter Click IDs separated by comma, period, colon, pipe, or new lines&#10;&#10;Example:&#10;click_123, click_456&#10;click_789 | click_101"
                    value={formData.value}
                    onChange={(e) => handleInputChange(e.target.value)}
                  />
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Supported separators: comma, period, colon, pipe, new line</span>
                    <span className="font-medium">Total: {clickIds.length} ClickIds</span>
                  </div>
                </div>

                {/* Submit Button */}
                <Button 
                  type="submit" 
                  className="w-full" 
                  size="lg"
                  disabled={payMutation.isPending || clickIds.length === 0 || !formData.user.trim()}
                >
                  {payMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Pay Users ({clickIds.length})
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Instructions Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">How to Use</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-xs font-bold text-primary">1</span>
                </div>
                <div>
                  <p className="font-medium text-sm">Enter Event Name</p>
                  <p className="text-sm text-muted-foreground">The name of the event to track conversions</p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-xs font-bold text-primary">2</span>
                </div>
                <div>
                  <p className="font-medium text-sm">Add Click IDs</p>
                  <p className="text-sm text-muted-foreground">Enter one or more Click IDs separated by any delimiter</p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-xs font-bold text-primary">3</span>
                </div>
                <div>
                  <p className="font-medium text-sm">Process Payment</p>
                  <p className="text-sm text-muted-foreground">Click "Pay Users" to process all conversions</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Important Notes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground">Click IDs are automatically cleaned and duplicates are removed</span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground">Empty values are automatically filtered out</span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground">Processing may take a few seconds for large batches</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

    </div>
  )
}
