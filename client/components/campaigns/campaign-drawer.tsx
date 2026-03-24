'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import {
  Eye,
  Pencil,
  Trash2,
  ExternalLink,
  Copy,
  Check,
  Zap,
  Clock,
  Globe,
  Settings,
  IndianRupee,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Download
} from 'lucide-react'
import type { Campaign } from '@/hooks/useCampaigns'

interface CampaignDrawerProps {
  campaign: Campaign | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onDelete?: (id: string) => void
}

const STATUS_CONFIG = {
  active: { label: 'Active', color: 'bg-emerald-500', icon: Zap },
  paused: { label: 'Paused', color: 'bg-amber-500', icon: Clock },
  inactive: { label: 'Inactive', color: 'bg-slate-400', icon: XCircle },
}

import { apiConfig } from '@/lib/config'

export function CampaignDrawer({ campaign, open, onOpenChange, onDelete }: CampaignDrawerProps) {
  const [copied, setCopied] = useState(false)
  const [copiedTracking, setCopiedTracking] = useState(false)

  if (!campaign) return null

  const handleCopy = (text: string, type: 'id' | 'tracking') => {
    navigator.clipboard.writeText(text)
    if (type === 'id') {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } else {
      setCopiedTracking(true)
      setTimeout(() => setCopiedTracking(false), 2000)
    }
  }

  const status = campaign.events && campaign.events.length > 0 ? 'active' : 'inactive'
  const statusConfig = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG]

  const eventProgress = Math.min((campaign.events?.length || 0) / 5 * 100, 100)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col min-w-full  overflow-scroll md:min-w-[600px] p-4 pt-8">
        <SheetHeader className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <SheetTitle className="text-xl">{campaign.name}</SheetTitle>
              <SheetDescription className="flex items-center gap-2">
                <span className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${statusConfig.color} animate-pulse`} />
                  {statusConfig.label}
                </span>
              </SheetDescription>
            </div>
            <Badge variant="secondary" className="gap-1">
              <CheckCircle2 className="h-3 w-3" />
              Configured
            </Badge>
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Quick Actions */}
          <div className="flex gap-2">
            <Link href={`/dashboard/camp/view/${campaign._id}`} >
              <Button variant="outline" className="flex-1" >
                <Eye className="mr-2 h-4 w-4" />
                View
              </Button>
            </Link>
            <Link className='w-full' href={`/dashboard/camp/edit/${campaign._id}`} >
              <Button  className="flex-1 w-full" >
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </Button>
            </Link>
          </div>

          {/* Campaign IDs */}
          <div className="space-y-3">
            <h3 className="text-sm  text-muted-foreground  ">
              Campaign Info
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div>
                  <p className="text-xs text-muted-foreground">Campaign ID</p>
                  <p className="font-mono text-sm">{campaign.offerID}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleCopy(String(campaign.offerID), 'id')}
                >
                  {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">Tracking URL</p>
                  <p className="font-mono text-xs truncate">{campaign.tracking || 'Not set'}</p>
                </div>
                <div className="flex gap-1">
                  {campaign.tracking && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleCopy(campaign.tracking, 'tracking')}
                    >
                      {copiedTracking ? (
                        <Check className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                  {campaign.tracking && (
                    <Link href={campaign.tracking} target="_blank" rel="noopener noreferrer" >
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm  text-muted-foreground ">
              Export
            </h3>
            <div className="flex gap-4 justify-center items-center">
              <Link className='flex-1 flex items-center justify-center bg-primary p-2 rounded-lg' href={`${apiConfig.baseUrl}/export/leads/${campaign._id}`} target="_blank" rel="noopener noreferrer" >

                <Download className="mr-2 h-4 w-4" />
                Export Leads

              </Link>
              <Link className='flex-1 flex items-center justify-center bg-secondary p-2 rounded-lg' href={`${apiConfig.baseUrl}/export/click/${campaign._id}`} target="_blank" rel="noopener noreferrer" >

                <Download className="mr-2 h-4 w-4" />
                Export Clicks
                {/* </Button> */}
              </Link>
            </div>
          </div>

          <Separator />

          {/* Events Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm  text-muted-foreground ">
                Events ({campaign.events?.length || 0})
              </h3>
            </div>
            <Progress value={eventProgress} className="w-20 h-2" />

            {campaign.events && campaign.events.length > 0 ? (
              <div className="space-y-2">
                {campaign.events.map((event, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{event.name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <IndianRupee className="h-3 w-3" />
                        <span>User: ₹{event.user || '0'} | Ref: ₹{event.refer || '0'}</span>
                      </div>
                    </div>
                    <Badge variant={event.payMode === 'auto' ? 'default' : 'secondary'}>
                      {event.payMode}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <AlertCircle className="h-10 w-10 text-muted-foreground/50 mb-3" />
                <p className="text-sm text-muted-foreground">No events configured</p>
                <Button variant="link" size="sm" className="mt-2" render={<Link href={`/dashboard/camp/edit/${campaign._id}`} />}>
                  Add events
                </Button>
              </div>
            )}
          </div>

          <Separator />

          {/* Settings Preview */}
          <div className="space-y-3">
            <h3 className="text-sm text-muted-foreground ">
              Settings
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <SettingItem label="Paytm" enabled={campaign.paytm} />
              <SettingItem label="IP Check" enabled={campaign.ip} />
              <SettingItem label="Same User" enabled={campaign.same} />
              <SettingItem label="CR Delay" enabled={campaign.crDelay} />
              <SettingItem label="Prev Event" enabled={campaign.prevEvent} />
              <SettingItem label="Refer Pending" enabled={campaign.referPending} />
            </div>
          </div>

          <Separator />

          {/* Delay */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Delay Setting</p>
              <p className="font-medium">{campaign.delay || '0'} seconds</p>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="space-y-3 pt-4">
            <h3 className="text-sm font-semibold text-destructive uppercase tracking-wider">
              Danger Zone
            </h3>
            <Button
              variant="destructive"
              className="w-full gap-2"
              onClick={() => {
                if (campaign._id && onDelete) {
                  onDelete(campaign._id)
                  onOpenChange(false)
                }
              }}
            >
              <Trash2 className="h-4 w-4" />
              Delete Campaign
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

function SettingItem({ label, enabled }: { label: string; enabled?: boolean }) {
  return (
    <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
      <div
        className={`w-2 h-2 rounded-full ${enabled ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'
          }`}
      />
      <span className="text-xs font-medium">{label}</span>
    </div>
  )
}
