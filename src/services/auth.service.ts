import axios from 'axios'

import { env } from '@/config/env'
import type { AuthTokens, LoginPayload } from '@/features/auth/types/auth.types'
import { http } from '@/services/http'

const loginWithApi = async (payload: LoginPayload): Promise<AuthTokens> => {
  const response = await http.post<AuthTokens>('/api/token/', payload)
  return response.data
}

export const authService = {
  login: loginWithApi,
  refresh: async (refresh: string) => {
    const response = await axios.post<{ access: string; refresh?: string }>(
      `${env.VITE_API_BASE_URL}/api/token/refresh/`,
      { refresh },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )

    return response.data
  },
}
