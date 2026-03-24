import { useQuery } from '@tanstack/react-query'
import { useQueryClient } from '@tanstack/react-query'
import { useMutation } from '@tanstack/react-query'
import { apiConfig, authFetch } from '@/lib/config'

export interface Campaign {
  _id: string
  name: string
  offerID: number
}

export interface PendingPayment {
  _id: string
  total: number
}

export interface PendingPaymentsResponse {
  status: boolean
  data: PendingPayment[]
}

async function getCampaigns(): Promise<{ status: boolean; data: Campaign[] }> {
  const res = await authFetch(`${apiConfig.baseUrl}/get/campaign`)
  if (!res.ok) throw new Error('Failed to fetch campaigns')
  return res.json()
}

export function useCampaignsList() {
  return useQuery({
    queryKey: ['campaigns-list'],
    queryFn: getCampaigns,
  })
}

async function getPendingPayments(campaignId: string): Promise<PendingPaymentsResponse> {
  const res = await authFetch(`${apiConfig.baseUrl}/get/pendingPayments/${campaignId}`)
  if (!res.ok) throw new Error('Failed to fetch pending payments')
  return res.json()
}

export function usePendingPayments(campaignId: string) {
  return useQuery({
    queryKey: ['pending-payments', campaignId],
    queryFn: () => getPendingPayments(campaignId),
    enabled: !!campaignId,
  })
}

async function updatePending(userId: string, data: { value: string; comment?: string }): Promise<{ status: boolean; msg?: string }> {
  const res = await authFetch(`${apiConfig.baseUrl}/api/update/pendings/${userId}?comment=${data.comment || ''}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ value: data.value }),
  })
  if (!res.ok) throw new Error('Failed to update pending')
  return res.json()
}

export function useUpdatePending() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: { value: string; comment?: string } }) =>
      updatePending(userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-payments'] })
    },
  })
}

async function payAllPending(campaignId: string, comment?: string): Promise<{ status: boolean; msg?: string }> {
  const res = await authFetch(`${apiConfig.baseUrl}/api/payall/pendings/${campaignId}?comment=${comment || ''}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  })
  if (!res.ok) throw new Error('Failed to pay all pending')
  return res.json()
}

export function usePayAllPending() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ campaignId, comment }: { campaignId: string; comment?: string }) =>
      payAllPending(campaignId, comment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-payments'] })
    },
  })
}
