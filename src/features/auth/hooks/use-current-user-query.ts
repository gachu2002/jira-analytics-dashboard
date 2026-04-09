import { useQuery } from '@tanstack/react-query'

import { getUsers } from '@/features/auth/api/account.api'
import { useAuthStore } from '@/features/auth/stores/auth.store'

export function useUsersQuery(enabled = true) {
  const isAuthenticated = useAuthStore((state) => Boolean(state.session))

  return useQuery({
    queryKey: ['auth', 'users'],
    queryFn: getUsers,
    enabled: enabled && isAuthenticated,
    staleTime: 5 * 60 * 1000,
  })
}
