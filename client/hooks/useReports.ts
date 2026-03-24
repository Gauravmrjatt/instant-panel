import { useQuery } from '@tanstack/react-query'
import { apiConfig, authFetch } from '@/lib/config'

export interface Report {
  _id: string
  campaign_name: string
  clicks: number
  leads: number
  conversions: number
  revenue: number
  createdAt: string
}

export async function getReports(): Promise<{ data: Report[] }> {
  const res = await authFetch(`${apiConfig.baseUrl}/get/reports`)
  if (!res.ok) throw new Error('Failed to fetch reports')
  return res.json()
}

export function useReports() {
  return useQuery({
    queryKey: ['reports'],
    queryFn: getReports,
  })
}
