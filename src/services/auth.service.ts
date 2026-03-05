import type { AuthTokens, LoginPayload } from '@/features/auth/types/auth.types'
import { http } from '@/services/http'

const loginWithApi = async (payload: LoginPayload): Promise<AuthTokens> => {
  const response = await http.post<AuthTokens>('/api/token/', payload)
  return response.data
}

export const authService = {
  login: loginWithApi,
}
