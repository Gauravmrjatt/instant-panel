import { useMutation, useQuery } from '@tanstack/react-query'
import { apiConfig, authFetch } from '@/lib/config'

export interface CampaignSettings {
  paytm: boolean
  ip: boolean
  same: boolean
  crDelay: boolean
  prevEvent: boolean
  userPending: boolean
  referPending: boolean
}

export interface CampaignEvent {
  name: string
  user: string
  refer: string
  userComment: string
  referComment: string
  caps: string
  time: string
  payMode: string
  capSwitch: boolean
  timeSwitch: boolean
  dailyCaps?: string
  dailySwitch?: boolean
}

export interface UniqueOfferID {
  offerID: string
  user: string
}

export interface Campaign {
  _id: string
  userId: string
  user: string
  name: string
  offerID: number
  campStatus: boolean
  paytm: boolean
  ip: boolean
  same: boolean
  crDelay: boolean
  delay: string
  prevEvent: boolean
  userPending: boolean
  referPending: boolean
  tracking: string
  uniqueOfferID: UniqueOfferID
  ips: string[]
  events: CampaignEvent[]
  createdAt: string
}

interface CreateCampaignResponse {
  status: boolean
  msg: string
  id?: string
}

async function createCampaign(data: Partial<Campaign>): Promise<CreateCampaignResponse> {
  const res = await authFetch(`${apiConfig.baseUrl}/add/campaign`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.msg || 'Failed to create campaign')
  }
  return res.json()
}

export function useCreateCampaign() {
  return useMutation({
    mutationFn: createCampaign,
  })
}

async function getPostback() {
  const res = await authFetch(`${apiConfig.baseUrl}/get/postback`)
  if (!res.ok) throw new Error('Failed to fetch postback')
  return res.json()
}

export function usePostback() {
  return useQuery({
    queryKey: ['postback'],
    queryFn: getPostback,
  })
}

interface CampaignListResponse {
  status: boolean
  data: Campaign[]
}

async function getCampaigns(): Promise<CampaignListResponse> {
  const res = await authFetch(`${apiConfig.baseUrl}/get/campaign`)
  if (!res.ok) throw new Error('Failed to fetch campaigns')
  return res.json()
}

export function useCampaigns() {
  return useQuery({
    queryKey: ['campaigns'],
    queryFn: getCampaigns,
  })
}

async function deleteCampaign(_id: string): Promise<{ status: boolean; msg: string }> {
  const res = await authFetch(`${apiConfig.baseUrl}/delete/campaign`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ _id }),
  })
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.msg || 'Failed to delete campaign')
  }
  return res.json()
}

export function useDeleteCampaign() {
  return useMutation({
    mutationFn: deleteCampaign,
  })
}
