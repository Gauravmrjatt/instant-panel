'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Label } from '@/components/ui/label'
import { apiConfig, authFetch } from '@/lib/config'
import {toast} from "sonner";
import {
  User,
  Mail,
  Phone,
  Calendar,
  CreditCard,
  Crown,
  Shield,
  Copy,
  Upload,
  CheckCircle2,
  Clock,
} from 'lucide-react'

interface UserProfile {
  status: boolean
  _id: string
  name: string
  userName: string
  userId: string
  PostbackToken: string
  email: string
  phone: number
  profileImg: string
  premium: boolean
  plan: string | null
  userType: string
  userStatus: string
  createdAt: string
  updatedAt: string
  premiumExpireDate: string
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default function ProfilePage() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const { data, isLoading } = useQuery<UserProfile>({
    queryKey: ['user-profile'],
    queryFn: async () => {
      const res = await authFetch(`${apiConfig.baseUrl}/get/user`)
      return res.json()
    },
  })

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await fetch(`${apiConfig.baseUrl}/upload/user-profile`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      })
      return res.json()
    },
    onSuccess: (data) => {
      if (data.status) {
        toast.success('Profile updated!')
      } else {
        toast.error(data.msg || 'Upload failed')
      }
    },
    onError: () => {
      toast.error('Upload failed')
    },
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleUpload = () => {
    if (!selectedFile) return
    const formData = new FormData()
    formData.append('profileImg', selectedFile)
    uploadMutation.mutate(formData)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard!')
  }

  const user = data

  if (isLoading) {
    return (
      <div className="space-y-6 ">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-64 bg-muted animate-pulse rounded-lg" />
            <div className="h-48 bg-muted animate-pulse rounded-lg" />
          </div>
          <div className="h-64 bg-muted animate-pulse rounded-lg" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 ">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" render={<Link href="/dashboard" />}>
          <User className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
          <p className="text-muted-foreground">Manage your account settings</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <CardTitle>Profile Information</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar Section */}
              <div className="flex items-center gap-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={user?.profileImg} />
                  <AvatarFallback className="text-2xl">{user?.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                    <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                      <Upload className="h-4 w-4 mr-2" />
                      Change Photo
                    </Button>
                    {selectedFile && (
                      <Button size="sm" className="ml-2" onClick={handleUpload} disabled={uploadMutation.isPending}>
                        {uploadMutation.isPending ? 'Uploading...' : 'Upload'}
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">Allowed JPG, GIF or PNG. Max size of 800K</p>
                </div>
              </div>

              <Separator />

              {/* Info Grid */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-muted-foreground flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Name
                  </Label>
                  <Input value={user?.name || ''} disabled className="bg-muted/50" />
                </div>

                <div className="space-y-2">
                  <Label className="text-muted-foreground flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Username
                  </Label>
                  <Input value={user?.userName || ''} disabled className="bg-muted/50" />
                </div>

                <div className="space-y-2">
                  <Label className="text-muted-foreground flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </Label>
                  <Input value={user?.email || ''} disabled className="bg-muted/50" />
                </div>

                <div className="space-y-2">
                  <Label className="text-muted-foreground flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Phone
                  </Label>
                  <Input value={user?.phone || ''} disabled className="bg-muted/50" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Details */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10">
                  <Shield className="h-5 w-5 text-emerald-500" />
                </div>
                <CardTitle>Account Details</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-muted-foreground">User Type</Label>
                  <div className="flex items-center gap-2">
                    <Input value={user?.userType || ''} disabled className="bg-muted/50 capitalize" />
                    {user?.userType === 'affilate' && <Badge variant="outline">Affiliate</Badge>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-muted-foreground">Status</Label>
                  <div className="flex items-center gap-2">
                    <Input value={user?.userStatus || ''} disabled className="bg-muted/50 capitalize" />
                    <Badge className={user?.userStatus === 'active' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'}>
                      {user?.userStatus === 'active' ? <CheckCircle2 className="h-3 w-3 mr-1" /> : <Clock className="h-3 w-3 mr-1" />}
                      {user?.userStatus}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label className="text-muted-foreground">User ID</Label>
                  <div className="flex gap-2">
                    <Input value={user?.userId || ''} disabled className="bg-muted/50 font-mono text-sm" />
                    <Button variant="outline" size="icon" onClick={() => copyToClipboard(user?.userId || '')}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label className="text-muted-foreground flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Postback Token
                  </Label>
                  <div className="flex gap-2">
                    <Input value={user?.PostbackToken || ''} disabled className="bg-muted/50 font-mono text-sm" />
                    <Button variant="outline" size="icon" onClick={() => copyToClipboard(user?.PostbackToken || '')}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Premium Status */}
          <Card className={user?.premium ? 'border-amber-500/50 bg-amber-500/5' : ''}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${user?.premium ? 'bg-amber-500/10' : 'bg-muted'}`}>
                  <Crown className={`h-5 w-5 ${user?.premium ? 'text-amber-500' : 'text-muted-foreground'}`} />
                </div>
                <CardTitle>Premium Status</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <Badge className={`text-lg px-4 py-1 ${user?.premium ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' : 'bg-muted'}`}>
                  {user?.premium ? 'Premium Member' : 'Free Plan'}
                </Badge>
              </div>

              {user?.premium && user?.premiumExpireDate && (
                <div className="space-y-2 text-center">
                  <Label className="text-muted-foreground">Premium Expires</Label>
                  <div className="flex items-center justify-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-amber-500" />
                    <span className="font-medium">{formatDate(user.premiumExpireDate)}</span>
                  </div>
                </div>
              )}

              {!user?.premium && (
                <p className="text-sm text-muted-foreground text-center">
                  Upgrade to premium for exclusive features
                </p>
              )}
            </CardContent>
          </Card>

          {/* Account Activity */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Clock className="h-5 w-5 text-blue-500" />
                </div>
                <CardTitle>Account Activity</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-muted-foreground">Member Since</Label>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{user?.createdAt ? formatDate(user.createdAt) : '-'}</span>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label className="text-muted-foreground">Last Updated</Label>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{user?.updatedAt ? formatDate(user.updatedAt) : '-'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" render={<Link href="/dashboard/postBack" />}>
                <CreditCard className="h-4 w-4 mr-2" />
                Manage Postback
              </Button>
              <Button variant="outline" className="w-full justify-start" render={<Link href="/dashboard/telegram-alerts" />}>
                <Crown className="h-4 w-4 mr-2" />
                Telegram Alerts
              </Button>
              <Button variant="outline" className="w-full justify-start" render={<Link href="/dashboard/geteway-settings" />}>
                <Shield className="h-4 w-4 mr-2" />
                Gateway Settings
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

    </div>
  )
}
