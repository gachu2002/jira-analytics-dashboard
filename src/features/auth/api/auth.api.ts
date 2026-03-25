import { http } from '@/lib/http'

import type {
  LoginRequest,
  RefreshAccessRequest,
  RefreshAccessResponse,
  TokenPair,
} from '@/features/auth/types/auth.types'

export async function loginWithPassword(payload: LoginRequest) {
  const response = await http.post<TokenPair>('/api/token/', payload)
  return response.data
}

export async function refreshAccessToken(payload: RefreshAccessRequest) {
  const response = await http.post<RefreshAccessResponse>(
    '/api/token/refresh/',
    payload,
  )
  return response.data
}
