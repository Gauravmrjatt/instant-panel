import { useMutation } from '@tanstack/react-query'
import { apiConfig } from '@/lib/config'

interface LoginResponse {
  status: boolean
  msg: string
  token?: string
}

interface LoginCredentials {
  email: string
  password: string
}

async function login(credentials: LoginCredentials): Promise<LoginResponse> {
  const res = await fetch(`${apiConfig.baseUrl}/auth/login`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  })
  const data = await res.json()
  if (!res.ok || data.status === false) {
    throw new Error(data.msg || 'Login failed')
  }
  return data
}

export function useLogin() {
  return useMutation({
    mutationFn: login,
  })
}

interface RegisterResponse {
  status: boolean
  msg: string
  token?: string
}

interface RegisterCredentials {
  email: string
  password: string
  username: string
  phone: string
  plan?: string | null
}

async function register(credentials: RegisterCredentials): Promise<RegisterResponse> {
  const res = await fetch(`${apiConfig.baseUrl}/auth/register`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  })
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.msg || 'Registration failed')
  }
  return res.json()
}

export function useRegister() {
  return useMutation({
    mutationFn: register,
  })
}

interface ForgetResponse {
  status: boolean
  msg: string
}

async function forgetPassword(email: string): Promise<ForgetResponse> {
  const res = await fetch(`${apiConfig.baseUrl}/auth/forget`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  })
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.msg || 'Failed to send reset email')
  }
  return res.json()
}

export function useForgetPassword() {
  return useMutation({
    mutationFn: forgetPassword,
  })
}
