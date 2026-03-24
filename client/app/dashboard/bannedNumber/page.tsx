'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { apiConfig, authFetch } from '@/lib/config'
import {toast} from 'sonner'

export default function BannedNumberPage() {
  const [newNumber, setNewNumber] = useState('')
  const queryClient = useQueryClient()

  const { data: bannedNumbers, isLoading } = useQuery({
    queryKey: ['banned-numbers'],
    queryFn: async () => {
      const res = await authFetch(`${apiConfig.baseUrl}/get/banned-numbers`)
      return res.json()
    }
  })

  const banMutation = useMutation({
    mutationFn: async (number: string) => {
      const res = await authFetch(`${apiConfig.baseUrl}/ban/number`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ number })
      })
      return res.json()
    },
    onSuccess: (data) => {
      if (data.status === true) {
        toast.success('Number banned!')
        queryClient.invalidateQueries({ queryKey: ['banned-numbers'] })
        setNewNumber('')
      } else {
        toast.error(data.msg)
      }
    }
  })

  const unbanMutation = useMutation({
    mutationFn: async (number: string) => {
      const res = await authFetch(`${apiConfig.baseUrl}/unban/number`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ number })
      })
      return res.json()
    },
    onSuccess: () => {
      toast.success('Number unbanned!')
      queryClient.invalidateQueries({ queryKey: ['banned-numbers'] })
    }
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Banned Numbers</h1>
        <p className="text-muted-foreground">
          <Link href="/dashboard">Dashboard</Link> / Banned Numbers
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ban Number</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter phone number to ban"
              value={newNumber}
              onChange={(e) => setNewNumber(e.target.value)}
            />
            <Button onClick={() => banMutation.mutate(newNumber)} disabled={!newNumber || banMutation.isPending}>
              Ban
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Banned Numbers List</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-32" />
          ) : (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Number</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bannedNumbers?.data?.map((item: any, index: number) => (
                    <TableRow key={index}>
                      <TableCell className="font-mono">{item.phone || item.number}</TableCell>
                      <TableCell>{new Date(item.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => unbanMutation.mutate(item.phone || item.number)}
                        >
                          Unban
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
