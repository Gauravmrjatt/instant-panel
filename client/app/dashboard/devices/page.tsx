'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { apiConfig, authFetch } from '@/lib/config'
import {toast} from "sonner";
import {
  Smartphone,
  Monitor,
  Globe,
  Trash2,
  Loader2,
  ArrowLeft,
} from 'lucide-react'

interface LoginDevice {
  _id: string
  token: string
  device: {
    os: {
      name: string
    }
    client: {
      name: string
    }
    device: {
      brand?: string
      model?: string
    }
  }
  ip: string
  createdAt: string
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  })
}

export default function DevicesPage() {
  const queryClient = useQueryClient()
  const [deletedToken, setDeletedToken] = useState<string | null>(null)

  const { data, isLoading } = useQuery<{ status: boolean; logins: LoginDevice[] }>({
    queryKey: ['login-devices'],
    queryFn: async () => {
      const res = await authFetch(`${apiConfig.baseUrl}/get/logins`)
      return res.json()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (token: string) => {
      const res = await fetch(`${apiConfig.baseUrl}/logout/${token}?devices=true`, {
        credentials: 'include',
      })
      return res.json()
    },
    onSuccess: (data) => {
      if (data.status === true) {
        toast.success('Session deleted successfully!')
        queryClient.invalidateQueries({ queryKey: ['login-devices'] })
      } else {
        toast.error(data.message || 'Failed to delete session')
      }
    },
    onError: () => {
      toast.error('Failed to delete session')
    },
  })

  const logins = data?.logins || []

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon">
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Login Devices</h1>
          <p className="text-muted-foreground">Manage your connected devices and sessions</p>
        </div>
      </div>

      {logins.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Smartphone className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No login devices found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {logins.map((login) => (
            <Card key={login._id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Monitor className="h-4 w-4 text-primary" />
                    </div>
                    <CardTitle className="text-base">{login.device.os.name}</CardTitle>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => deleteMutation.mutate(login.token)}
                    disabled={deleteMutation.isPending}
                  >
                    {deleteMutation.isPending && deletedToken === login.token ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1">
                  <p className="text-sm font-medium">{login.device.client.name}</p>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Smartphone className="h-3 w-3" />
                    {login.device.device.brand
                      ? `${login.device.device.brand} ${login.device.device.model}`
                      : 'Unknown device'}
                  </p>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Globe className="h-3 w-3" />
                    {login.ip}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Logged in: {formatDate(login.createdAt)}
                  </p>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  className="w-full"
                  onClick={() => deleteMutation.mutate(login.token)}
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending && deletedToken === login.token ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Session
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

   
    </div>
  )
}
