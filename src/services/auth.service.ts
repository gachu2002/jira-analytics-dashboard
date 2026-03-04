import { env } from '@/config/env'
import type { AuthTokens, LoginPayload } from '@/features/auth/types/auth.types'
import { http } from '@/services/http'

const delay = (ms: number) =>
  new Promise((resolve) => window.setTimeout(resolve, ms))

const loginWithMock = async (payload: LoginPayload): Promise<AuthTokens> => {
  await delay(900)

  if (!payload.username || !payload.password) {
    throw new Error('Invalid credentials')
  }

  return {
    refresh: `mock-refresh-${payload.username}`,
    access: `mock-access-${payload.username}`,
  }
}

const loginWithApi = async (payload: LoginPayload): Promise<AuthTokens> => {
  const response = await http.post<AuthTokens>(env.VITE_AUTH_TOKEN_URL, payload)
  return response.data
}

export const authService = {
  login: async (payload: LoginPayload) =>
    env.VITE_USE_MOCK_AUTH ? loginWithMock(payload) : loginWithApi(payload),
}
