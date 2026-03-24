import { apiConfig, authFetch } from '@/lib/config'

export interface DeviceInfo {
  os: {
    name: string
    short_name: string
    version: string
    platform: string
    family: string
  }
  client: {
    type: string
    name: string
    short_name: string
    version: string
    engine: string
    engine_version: string
    family: string
  }
  device: {
    id: string
    type: string
    brand: string
    model: string
  }
}

export interface ClickData {
  _id: string
  userId: string
  campId: string
  click: string
  user: string
  refer?: string
  number: string
  ip: string
  device: DeviceInfo
  params: Record<string, string>
  createdAt: string
}

interface ClickSearchResponse {
  status: boolean
  msg: string
  clickData: ClickData[]
}

export async function searchClicks(data: string[]): Promise<ClickSearchResponse> {
  const res = await authFetch(`${apiConfig.baseUrl}/get/click/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data }),
  })
  if (!res.ok) throw new Error('Failed to search clicks')
  return res.json()
}
