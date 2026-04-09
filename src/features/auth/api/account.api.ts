import { http } from '@/lib/http'

import type { CurrentUser } from '@/features/auth/types/account.types'

export async function getCurrentUser() {
  const response = await http.get<CurrentUser>('/api/accounts/users/')
  return response.data
}
