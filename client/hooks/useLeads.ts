import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { apiConfig, authFetch } from '@/lib/config'
import type { Filter } from '@/components/leads/filter-types'
import { serializeFilters } from '@/components/leads/filter-types'

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
  totalCount: number
  totalPages: number
  page: number
  limit: number
  data: LeadData[]
}

export interface LeadsPaginationMeta {
  totalCount: number
  totalPages: number
  page: number
  limit: number
}

export function useLeads(campaignId: string, page: number = 1, limit: number = 20, filters: Filter[] = []) {
  const filtersParam = filters.length > 0 ? `&filters=${encodeURIComponent(serializeFilters(filters))}` : ''
  return useQuery<{ data: LeadData[]; pagination: LeadsPaginationMeta }>({
    queryKey: ['leads', campaignId, page, limit, filters],
    queryFn: async () => {
      const res = await authFetch(
        `${apiConfig.baseUrl}/api/v1/campaigns/${campaignId}/leads?page=${page}&limit=${limit}${filtersParam}`
      )
      const json: LeadsResponse = await res.json()
      if (!json.status) {
        return {
          data: [],
          pagination: { totalCount: 0, totalPages: 0, page: 1, limit },
        }
      }
      return {
        data: json.data.map((row) => ({ ...row, id: row._id || row.id })),
        pagination: {
          totalCount: json.totalCount,
          totalPages: json.totalPages,
          page: json.page,
          limit: json.limit,
        },
      }
    },
    enabled: !!campaignId && campaignId.length > 0,
    retry: 1,
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  })
}

interface UpdateLeadsPayload {
  ids: string[]
  status: string
}

export async function updateLeads(payload: UpdateLeadsPayload): Promise<Response> {
  return authFetch(`${apiConfig.baseUrl}/api/v1/leads/batch-status`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

export async function batchApproveLeads(payload: { ids: string[]; payment: boolean }): Promise<Response> {
  return authFetch(`${apiConfig.baseUrl}/api/v1/leads/batch-approve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

export async function deleteLeads(ids: string[]): Promise<Response> {
  return authFetch(`${apiConfig.baseUrl}/api/v1/leads/batch-delete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ selection: ids }),
  })
}
