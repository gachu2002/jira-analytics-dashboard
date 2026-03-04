import { useAuthStore } from '@/features/auth/stores/auth.store'

export const useAuth = () => {
  const tokens = useAuthStore((state) => state.tokens)
  const username = useAuthStore((state) => state.username)
  const setAuthSession = useAuthStore((state) => state.setAuthSession)
  const clearAuthSession = useAuthStore((state) => state.clearAuthSession)

  return {
    username,
    tokens,
    isAuthenticated: Boolean(tokens?.access),
    setAuthSession,
    clearAuthSession,
  }
}
