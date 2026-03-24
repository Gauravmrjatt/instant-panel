import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiConfig, authFetch } from '@/lib/config'

export interface UserProfile {
  _id: string
  name: string
  username: string
  email: string
  phone: string
  userType: string
  userStatus: string
  profileImg: string
  PostbackToken: string
  createdAt: string
  premiumExpireDate: string
}

export async function getUserProfile(): Promise<UserProfile> {
  const res = await authFetch(`${apiConfig.baseUrl}/get/user`)
  if (!res.ok) throw new Error('Failed to fetch profile')
  return res.json()
}

export function useUserProfile() {
  return useQuery({
    queryKey: ['user-profile'],
    queryFn: getUserProfile,
  })
}

export async function updateProfile(formData: FormData): Promise<{ status: boolean; profileImg?: string }> {
  const res = await authFetch(`${apiConfig.baseUrl}/upload/user-profile`, {
    method: 'POST',
    body: formData,
  })
  if (!res.ok) throw new Error('Failed to upload profile')
  return res.json()
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] })
    },
  })
}
