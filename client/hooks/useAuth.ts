import { useMutation } from "@tanstack/react-query";
import { apiConfig } from "@/lib/config";

interface LoginResponse {
  status: boolean;
  msg: string;
  token?: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

async function login(credentials: LoginCredentials): Promise<LoginResponse> {
  const res = await fetch(`${apiConfig.baseUrl}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(credentials),
  });
  const data = await res.json();
  if (!res.ok || data.status === false) {
    throw new Error(data.msg || "Login failed");
  }
  return data;
}

export function useLogin() {
  return useMutation({
    mutationFn: login,
  });
}

interface RegisterResponse {
  status: boolean;
  msg: string;
  token?: string;
}

interface RegisterCredentials {
  email: string;
  password: string;
  username: string;
  phone: string;
  plan?: string | null;
}

async function register(
  credentials: RegisterCredentials,
): Promise<RegisterResponse> {
  const res = await fetch(`${apiConfig.baseUrl}/api/v1/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(credentials),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.msg || "Registration failed");
  }
  const data = await res.json();
  return data;
}

export function useRegister() {
  return useMutation({
    mutationFn: register,
  });
}

interface ForgetResponse {
  status: boolean;
  msg: string;
}

async function forgetPassword(email: string): Promise<ForgetResponse> {
  const res = await fetch(`${apiConfig.baseUrl}/api/v1/auth/forgot-password`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.msg || "Failed to send reset email");
  }
  return res.json();
}

export function useForgetPassword() {
  return useMutation({
    mutationFn: forgetPassword,
  });
}
