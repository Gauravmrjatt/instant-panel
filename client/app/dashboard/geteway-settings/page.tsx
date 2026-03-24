'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { useGatewaySettings, useUpdateGatewaySettings } from '@/hooks/useGateway'
import { toast } from "sonner";
import {
  Settings,
  Globe,
  Key,
  Link2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Copy,
  Check,
  Shield,
  Zap,
  Info,
  RefreshCw,
  Save,
  Server,
  ArrowRight,
  DollarSign,
} from 'lucide-react'

export default function GatewaySettingsPage() {
  const [customUrl, setCustomUrl] = useState('')
  const [eaGuid, setEaGuid] = useState('')
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'custom' | 'earningarea'>('custom')

  const { data: settings, isLoading, refetch } = useGatewaySettings()
  const updateSettings = useUpdateGatewaySettings()

  useEffect(() => {
    if (settings) {
      if (settings.url && !customUrl) setCustomUrl(settings.url)
      if (settings.guid && !eaGuid) setEaGuid(settings.guid)
    }
  }, [settings, customUrl, eaGuid])

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    toast.success('Copied to clipboard!')
    setTimeout(() => setCopiedField(null), 2000)
  }

  const handleUpdateCustom = () => {
    if (!customUrl) {
      toast.error('Please enter a custom URL')
      return
    }
    toast.promise(
      updateSettings.mutateAsync({ type: 'Custom', url: customUrl }),
      {
        loading: 'Updating settings...',
        success: (data) => {
          refetch()
          return data.msg || 'Custom URL updated successfully!'
        },
        error: (error) => error.message || 'Failed to update',
      }
    )
  }

  const handleUpdateEA = () => {
    if (!eaGuid) {
      toast.error('Please enter a GUID')
      return
    }
    toast.promise(
      updateSettings.mutateAsync({ type: 'Earning Area', guid: eaGuid }),
      {
        loading: 'Updating settings...',
        success: (data) => {
          refetch()
          return data.msg || 'Earning Area GUID updated successfully!'
        },
        error: (error) => error.message || 'Failed to update',
      }
    )
  }

  const handleSave = () => {
    if (activeTab === 'custom') {
      handleUpdateCustom()
    } else {
      handleUpdateEA()
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-12 w-12" />
          <Skeleton className="h-10 w-64" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    )
  }

  const hasCustomUrl = !!settings?.url
  const hasEaGuid = !!settings?.guid

  return (
    <div className="space-y-6 p-6 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-primary shadow-lg">
            <Settings className="h-7 w-7 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gateway Settings</h1>
            <p className="text-muted-foreground">Configure your payment gateway connections</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="gap-1">
            <Server className="h-3 w-3" />
            Gateway Config
          </Badge>
          <Button variant="outline" render={<Link href="/dashboard" />}>
            Back to Dashboard
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-muted/50">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary/10">
              <Link2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Custom URL</p>
              <p className="text-2xl font-bold">{hasCustomUrl ? 'Active' : 'Not Set'}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-muted/50">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-chart-2/10">
              <Zap className="h-6 w-6 text-chart-2" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Earning Area</p>
              <p className="text-2xl font-bold">{hasEaGuid ? 'Connected' : 'Not Set'}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-muted/50">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-chart-3/10">
              <DollarSign className="h-6 w-6 text-chart-3" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Gateway</p>
              <p className="text-2xl font-bold">
                {hasCustomUrl ? 'Custom' : hasEaGuid ? 'EA' : 'None'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Info Banner */}
      <Card className="bg-muted/50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Info className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold text-sm">Configure Your Payout Gateway</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Set up your custom payout URL or connect to Earning Area gateway. This determines how payments are processed for your users.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content - Full Width Grid */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Tab Navigation - Left Side */}
        <div className="lg:col-span-12">
          <div className="flex gap-2 p-1 bg-muted rounded-lg w-fit">
            <button
              onClick={() => setActiveTab('custom')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-all ${activeTab === 'custom'
                  ? 'bg-background shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              <Link2 className="h-4 w-4" />
              Custom URL
              {hasCustomUrl && (
                <CheckCircle2 className="h-3 w-3 text-emerald-500" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('earningarea')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-all ${activeTab === 'earningarea'
                  ? 'bg-background shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              <Zap className="h-4 w-4" />
              Earning Area
              {hasEaGuid && (
                <CheckCircle2 className="h-3 w-3 text-emerald-500" />
              )}
            </button>
          </div>
        </div>

        {/* Custom URL Section */}
        {activeTab === 'custom' && (
          <div className="lg:col-span-8">
            <Card className="h-full">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-primary/10">
                      <Link2 className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Custom Payout URL</CardTitle>
                      <CardDescription>
                        Configure your own server endpoint for processing payments
                      </CardDescription>
                    </div>
                  </div>
                  {hasCustomUrl && (
                    <Badge className="gap-1 bg-primary/10 text-primary hover:bg-primary/10">
                      <CheckCircle2 className="h-3 w-3" />
                      Configured
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Payout URL <span className="text-destructive">*</span>
                    </label>
                    {settings?.url && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1 h-7 text-xs"
                        onClick={() => handleCopy(settings.url!, 'custom-url')}
                      >
                        {copiedField === 'custom-url' ? (
                          <>
                            <Check className="h-3 w-3 text-emerald-500" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" />
                            Copy URL
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                  <Input
                    placeholder="https://your-server.com/api/payout"
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    className="h-12 text-base font-mono"
                  />
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-muted border">
                    <AlertCircle className="h-4 w-4 text-chart-3 mt-0.5 shrink-0" />
                    <p className="text-sm text-muted-foreground">
                      Your server should accept POST requests with <code className="bg-background px-1.5 py-0.5 rounded text-xs">user</code>, <code className="bg-background px-1.5 py-0.5 rounded text-xs">amount</code>, and <code className="bg-background px-1.5 py-0.5 rounded text-xs">comment</code> parameters.
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Current Value */}
                {settings?.url && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Current Configuration</label>
                    <div className="flex items-center gap-2 p-4 rounded-lg bg-background border">
                      <code className="flex-1 text-sm font-mono truncate">{settings.url}</code>
                      {settings.url && (
                        <Button variant="outline" size="sm" render={<a href={settings.url} target="_blank" rel="noopener noreferrer" />}>
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Open
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex justify-end">
                  <Button
                    onClick={handleSave}
                    disabled={updateSettings.isPending || !customUrl}
                    size="lg"
                    className="gap-2"
                  >
                    {updateSettings.isPending ? (
                      <>
                        <RefreshCw className="h-5 w-5 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-5 w-5" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Earning Area Section */}
        {activeTab === 'earningarea' && (
          <div className="lg:col-span-8">
            <Card className="h-full">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-chart-2/10">
                      <Zap className="h-6 w-6 text-chart-2" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Earning Area Gateway</CardTitle>
                      <CardDescription>
                        Connect to Earning Area wallet for seamless payouts
                      </CardDescription>
                    </div>
                  </div>
                  {hasEaGuid && (
                    <Badge className="gap-1 bg-chart-2/10 text-chart-2 hover:bg-chart-2/10">
                      <CheckCircle2 className="h-3 w-3" />
                      Connected
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Key className="h-4 w-4" />
                      Gateway GUID <span className="text-destructive">*</span>
                    </label>
                    {settings?.guid && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1 h-7 text-xs"
                        onClick={() => handleCopy(settings.guid!, 'ea-guid')}
                      >
                        {copiedField === 'ea-guid' ? (
                          <>
                            <Check className="h-3 w-3 text-emerald-500" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" />
                            Copy GUID
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                  <Input
                    placeholder="Enter your Earning Area Gateway GUID"
                    value={eaGuid}
                    onChange={(e) => setEaGuid(e.target.value)}
                    className="h-12 text-base font-mono"
                  />
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-muted border">
                    <Shield className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <p className="text-sm text-muted-foreground">
                      Find your Gateway GUID in your Earning Area dashboard under Settings {'>'} Gateway Integration.
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Current Value */}
                {settings?.guid && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Current Configuration</label>
                    <div className="p-4 rounded-lg bg-background border">
                      <code className="text-sm font-mono">{settings.guid}</code>
                    </div>
                  </div>
                )}

                <div className="flex justify-end">
                  <Button
                    onClick={handleSave}
                    disabled={updateSettings.isPending || !eaGuid}
                    size="lg"
                    className="gap-2"
                  >
                    {updateSettings.isPending ? (
                      <>
                        <RefreshCw className="h-5 w-5 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <Zap className="h-5 w-5" />
                        Connect Gateway
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Sidebar - Help Cards */}
        <div className="lg:col-span-4 space-y-6">
          {/* Quick Help */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Info className="h-4 w-4 text-primary" />
                Quick Help
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {activeTab === 'custom' ? (
                <>
                  <div className="p-3 rounded-lg bg-muted border">
                    <h4 className="font-medium text-sm mb-1">Custom URL Setup</h4>
                    <p className="text-xs text-muted-foreground">
                      Your server endpoint must handle POST requests and return a JSON response.
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted border">
                    <h4 className="font-medium text-sm mb-1">Required Fields</h4>
                    <p className="text-xs text-muted-foreground">
                      user, amount, comment parameters are sent to your endpoint.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-3 rounded-lg bg-muted border">
                    <h4 className="font-medium text-sm mb-1">Earning Area</h4>
                    <p className="text-xs text-muted-foreground">
                      Create a free Earning Area account to get instant UPI payments.
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted border">
                    <h4 className="font-medium text-sm mb-1">Gateway GUID</h4>
                    <p className="text-xs text-muted-foreground">
                      Find it in Settings {'>'} Gateway Integration on EA dashboard.
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-between" render={<Link href="/dashboard/pay-to-user" />}>
                Quick Payment
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" className="w-full justify-between" render={<Link href="/dashboard/pending" />}>
                Pending Approvals
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" className="w-full justify-between" render={<Link href="/dashboard/payments" />}>
                Payment History
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

    </div>
  )
}
