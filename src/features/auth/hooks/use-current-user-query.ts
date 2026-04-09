import { useQuery } from '@tanstack/react-query'

import { getCurrentUser } from '@/features/auth/api/account.api'
import { useAuthStore } from '@/features/auth/stores/auth.store'

export function useCurrentUserQuery(enabled = true) {
  const isAuthenticated = useAuthStore((state) => Boolean(state.session))

  return useQuery({
    queryKey: ['auth', 'current-user'],
    queryFn: getCurrentUser,
    enabled: enabled && isAuthenticated,
    staleTime: 5 * 60 * 1000,
  })
}
