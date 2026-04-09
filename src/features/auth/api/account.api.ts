import { http } from '@/lib/http'

import type { AccountUser } from '@/features/auth/types/account.types'

export async function getUsers() {
  const response = await http.get<AccountUser[]>('/api/accounts/users/')
  return response.data
}
