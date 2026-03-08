import { useEffect } from 'react'

import { useAuthStore } from '@/features/auth/stores/auth.store'
import { authService } from '@/services/auth.service'

export const useAuthBootstrap = () => {
  const tokens = useAuthStore((state) => state.tokens)
  const username = useAuthStore((state) => state.username)
  const isInitialized = useAuthStore((state) => state.isInitialized)
  const setAuthSession = useAuthStore((state) => state.setAuthSession)
  const clearAuthSession = useAuthStore((state) => state.clearAuthSession)
  const setAuthInitialized = useAuthStore((state) => state.setAuthInitialized)

  useEffect(() => {
    if (isInitialized) {
      return
    }

    const refreshToken = tokens?.refresh

    if (!refreshToken) {
      clearAuthSession()
      setAuthInitialized(true)
      return
    }

    void authService
      .refresh(refreshToken)
      .then((refreshed) => {
        setAuthSession(username, {
          access: refreshed.access,
          refresh: refreshed.refresh ?? refreshToken,
        })
      })
      .catch(() => {
        clearAuthSession()
      })
      .finally(() => {
        setAuthInitialized(true)
      })
  }, [
    clearAuthSession,
    isInitialized,
    setAuthInitialized,
    setAuthSession,
    tokens?.refresh,
    username,
  ])

  return {
    isInitialized,
    isAuthenticated: Boolean(tokens?.access),
  }
}
