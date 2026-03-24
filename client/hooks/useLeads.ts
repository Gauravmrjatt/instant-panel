import { useQuery } from '@tanstack/react-query'
import { apiConfig, authFetch } from '@/lib/config'

export interface LeadData {
  id: string
  event: string
  status: string
  message: string
  user: string
  refer: string
  userAmount: number
  referAmount: number
  params: Record<string, string>
  paymentStatus: string
  payMessage: string
  createdAt: string
  click: string
  _id: string
}

interface LeadsResponse {
  status: boolean
  msg: string
  count?: number
  data: LeadData[]
}

export function useLeads(campaignId: string) {
  return useQuery<LeadData[]>({
    queryKey: ['leads', campaignId],
    queryFn: async () => {
      const res = await authFetch(`${apiConfig.baseUrl}/get/leads/${campaignId}`)
      const json: LeadsResponse = await res.json()
      if (!json.status) {
        return []
      }
      return json.data.map((row) => ({ ...row, id: row._id || row.id }))
    },
    enabled: !!campaignId && campaignId.length > 0,
    retry: 1,
    refetchOnWindowFocus: false,
  })
}

interface UpdateLeadsPayload {
  ids: string[]
  status: string
}

export async function updateLeads(payload: UpdateLeadsPayload): Promise<Response> {
  return authFetch(`${apiConfig.baseUrl}/update/leads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}
