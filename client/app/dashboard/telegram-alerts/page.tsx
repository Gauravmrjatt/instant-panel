'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { apiConfig, authFetch } from '@/lib/config'
import {toast} from "sonner";
import { 
  Send, 
  MessageCircle, 
  Hash,
  User,
  Tag,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Info,
  RefreshCw,
} from 'lucide-react'

interface TelegramSettings {
  botToken?: string
  chatId?: string
  contact?: string
  username?: string
  label?: string
}

export default function TelegramAlertsPage() {
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState<TelegramSettings>({
    botToken: '',
    chatId: '',
    contact: '',
    username: '',
    label: '',
  })
  const [isTestSent, setIsTestSent] = useState(false)

  const { data: settings, isLoading } = useQuery({
    queryKey: ['telegram-settings'],
    queryFn: async () => {
      const res = await authFetch(`${apiConfig.baseUrl}/get/telegram-alert`)
      return res.json()
    }
  })

  useEffect(() => {
    if (settings) {
      setFormData({
        botToken: settings.botToken || '',
        chatId: settings.chatId || '',
        contact: settings.contact || '',
        username: settings.username || '',
        label: settings.label || '',
      })
    }
  }, [settings])

  const updateMutation = useMutation({
    mutationFn: async (data: TelegramSettings) => {
      const res = await authFetch(`${apiConfig.baseUrl}/update/telegram-settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      return res.json()
    },
    onSuccess: (data) => {
      if (data.status === true) {
        toast.success(data.msg || 'Settings updated successfully!')
        queryClient.invalidateQueries({ queryKey: ['telegram-settings'] })
      } else {
        toast.error(data.msg || 'Failed to update settings')
      }
    },
    onError: () => {
      toast.error('An error occurred while saving')
    }
  })

  const testMutation = useMutation({
    mutationFn: async () => {
      const res = await authFetch(`${apiConfig.baseUrl}/test/telegram`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      return res.json()
    },
    onSuccess: (data) => {
      if (data.status === true) {
        toast.success('Test message sent successfully!')
        setIsTestSent(true)
        setTimeout(() => setIsTestSent(false), 3000)
      } else {
        toast.error(data.msg || 'Failed to send test message')
      }
    },
    onError: () => {
      toast.error('Failed to send test message')
    }
  })

  const handleChange = (field: keyof TelegramSettings, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateMutation.mutate(formData)
  }

  const handleTest = () => {
    if (!formData.botToken || !formData.chatId) {
      toast.error('Please enter bot token and chat ID')
      return
    }
    testMutation.mutate()
  }

  const isFormValid = formData.botToken && formData.chatId

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-12 bg-muted rounded-lg w-64"></div>
        <div className="h-64 bg-muted rounded-lg"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-[#229ED9]/10">
          <Send className="h-6 w-6 text-[#229ED9]" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Telegram Alerts</h1>
          <p className="text-muted-foreground">Configure notifications for your Telegram bot</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSubmit}>
            {/* Bot Alert Card */}
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[#229ED9]/10">
                    <MessageCircle className="h-5 w-5 text-[#229ED9]" />
                  </div>
                  <div>
                    <CardTitle>Bot Alert Settings</CardTitle>
                    <CardDescription>Configure your Telegram bot for direct alerts</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium mb-2">
                    Bot Token <span className="text-destructive">*</span>
                  </label>
                  <div className="relative mt-2">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
                      value={formData.botToken}
                      onChange={(e) => handleChange('botToken', e.target.value)}
                      className="pl-10 rounded-lg font-mono text-sm"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Get your bot token from @BotFather on Telegram
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Chat ID <span className="text-destructive">*</span>
                  </label>
                  <div className="relative mt-2">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="123456789"
                      value={formData.chatId}
                      onChange={(e) => handleChange('chatId', e.target.value)}
                      className="pl-10 rounded-lg font-mono"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Your Telegram user ID or group ID for receiving alerts
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Contact Username <span className="text-muted-foreground">(optional)</span>
                  </label>
                  <div className="relative mt-2">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="@your_username"
                      value={formData.contact}
                      onChange={(e) => handleChange('contact', e.target.value)}
                      className="pl-10 rounded-lg"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Channel Alert Card */}
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/10">
                    <Hash className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div>
                    <CardTitle>Channel Alert Settings</CardTitle>
                    <CardDescription>Configure channel-based notifications</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Channel Username <span className="text-muted-foreground">(optional)</span>
                  </label>
                  <div className="relative mt-2">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="@YourChannel"
                      value={formData.username}
                      onChange={(e) => handleChange('username', e.target.value)}
                      className="pl-10 rounded-lg"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Your Telegram channel username with @
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Label <span className="text-muted-foreground">(optional)</span>
                  </label>
                  <div className="relative mt-2">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Power By @YourChannel"
                      value={formData.label}
                      onChange={(e) => handleChange('label', e.target.value)}
                      className="pl-10 rounded-lg"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Label to show in payout messages
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                type="submit"
                size="lg"
                disabled={updateMutation.isPending || !isFormValid}
                className="flex-1 gap-2 bg-[#229ED9] hover:bg-[#1a8cc4]"
              >
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Save Settings
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={handleTest}
                disabled={testMutation.isPending || !isFormValid}
                className="flex-1 gap-2"
              >
                {testMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : isTestSent ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    Test Sent!
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Send Test Message
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Start Bot Button */}
          <Card>
            <CardContent className="pt-6">
              <a href="https://t.me/FokatCashtools_Bot" target="_blank" rel="noopener noreferrer">
                <Button className="w-full gap-2 bg-[#229ED9] hover:bg-[#1a8cc4]" size="lg">
                  <MessageCircle className="h-5 w-5" />
                  Start Our Bot
                  <ExternalLink className="h-4 w-4 ml-auto" />
                </Button>
              </a>
              <p className="text-xs text-muted-foreground mt-3 text-center">
                Click to open our official Telegram bot
              </p>
            </CardContent>
          </Card>

          {/* Instructions Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Info className="h-4 w-4" />
                How to Setup
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#229ED9]/10 text-xs font-bold text-[#229ED9]">
                  1
                </div>
                <div>
                  <p className="font-medium text-sm">Start Our Bot</p>
                  <p className="text-xs text-muted-foreground">Click the button above to open our bot</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#229ED9]/10 text-xs font-bold text-[#229ED9]">
                  2
                </div>
                <div>
                  <p className="font-medium text-sm">Get Your Chat ID</p>
                  <p className="text-xs text-muted-foreground">Send /start to the bot to get your Chat ID</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#229ED9]/10 text-xs font-bold text-[#229ED9]">
                  3
                </div>
                <div>
                  <p className="font-medium text-sm">Enter Bot Token</p>
                  <p className="text-xs text-muted-foreground">Copy your bot token from @BotFather</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#229ED9]/10 text-xs font-bold text-[#229ED9]">
                  4
                </div>
                <div>
                  <p className="font-medium text-sm">Save & Test</p>
                  <p className="text-xs text-muted-foreground">Click save and send a test message</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status Card */}
          <Card className={isFormValid ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-amber-500/50 bg-amber-500/5'}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                {isFormValid ? (
                  <div className="p-2 rounded-lg bg-emerald-500/10">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  </div>
                ) : (
                  <div className="p-2 rounded-lg bg-amber-500/10">
                    <AlertCircle className="h-5 w-5 text-amber-500" />
                  </div>
                )}
                <div>
                  <p className="font-medium text-sm">
                    {isFormValid ? 'Ready to Go!' : 'Setup Incomplete'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {isFormValid 
                      ? 'All required fields are filled' 
                      : 'Enter bot token and chat ID to enable alerts'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Links */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Quick Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <a href="https://t.me/BotFather" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="w-full justify-between" size="sm">
                  Get Bot Token
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </a>
              <a href="https://t.me/FokatCashtools_Bot" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="w-full justify-between" size="sm">
                  Open Our Bot
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </a>
            </CardContent>
          </Card>
        </div>
      </div>

    </div>
  )
}
