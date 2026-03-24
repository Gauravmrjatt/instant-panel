import { useQuery } from '@tanstack/react-query'
import { apiConfig, authFetch } from '@/lib/config'

export interface Payment {
  _id: string
  number: string
  amount: number
  comment: string
  type: string
  response: string | { status: string; message?: string }
  createdAt: string
}

interface PaymentsResponse {
  data: Payment[]
  total: number
}

export async function getPayments(page: number = 0, limit: number = 10): Promise<PaymentsResponse> {
  const res = await authFetch(`${apiConfig.baseUrl}/get/payments?page=${page}&limit=${limit}`)
  if (!res.ok) throw new Error('Failed to fetch payments')
  return res.json()
}

export function usePayments(page: number = 0, limit: number = 10) {
  return useQuery({
    queryKey: ['payments', page, limit],
    queryFn: () => getPayments(page, limit),
  })
}
