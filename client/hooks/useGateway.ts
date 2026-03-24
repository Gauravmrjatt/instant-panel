import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiConfig, authFetch } from '@/lib/config'

export interface GatewaySettings {
  url?: string
  guid?: string
  type?: string
}

export async function getGatewaySettings(): Promise<GatewaySettings> {
  const res = await authFetch(`${apiConfig.baseUrl}/get/gateway-settings`)
  if (!res.ok) throw new Error('Failed to fetch gateway settings')
  return res.json()
}

export function useGatewaySettings() {
  return useQuery({
    queryKey: ['gateway-settings'],
    queryFn: getGatewaySettings,
  })
}

export async function updateGatewaySettings(data: GatewaySettings): Promise<{ status: boolean; msg: string }> {
  const res = await authFetch(`${apiConfig.baseUrl}/update/gateway-settings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to update gateway settings')
  return res.json()
}

export function useUpdateGatewaySettings() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateGatewaySettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gateway-settings'] })
    },
  })
}
