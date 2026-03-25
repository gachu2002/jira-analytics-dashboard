import { useEffect, useRef } from 'react'

import { refreshAccessToken } from '@/features/auth/api/auth.api'
import { useAuthStore } from '@/features/auth/stores/auth.store'

export function useAuthBootstrap() {
  const hasHydrated = useAuthStore((state) => state.hasHydrated)
  const refreshToken = useAuthStore((state) => state.session?.refreshToken)
  const updateAccessToken = useAuthStore((state) => state.updateAccessToken)
  const clearSession = useAuthStore((state) => state.clearSession)
  const setHasBootstrapped = useAuthStore((state) => state.setHasBootstrapped)
  const setRefreshingSession = useAuthStore(
    (state) => state.setRefreshingSession,
  )
  const hasBootstrapped = useRef(false)

  useEffect(() => {
    if (!hasHydrated || hasBootstrapped.current) {
      return
    }

    hasBootstrapped.current = true

    if (!refreshToken) {
      setHasBootstrapped(true)
      setRefreshingSession(false)
      return
    }

    let isActive = true
    const refreshTimeout = window.setTimeout(() => {
      if (!isActive) {
        return
      }

      clearSession()
      setHasBootstrapped(true)
      setRefreshingSession(false)
    }, 6000)

    setRefreshingSession(true)

    refreshAccessToken({ refresh: refreshToken })
      .then(({ access }) => {
        if (!isActive) {
          return
        }

        updateAccessToken(access)
        setHasBootstrapped(true)
      })
      .catch(() => {
        if (!isActive) {
          return
        }

        clearSession()
        setHasBootstrapped(true)
      })
      .finally(() => {
        if (!isActive) {
          return
        }

        window.clearTimeout(refreshTimeout)
        setRefreshingSession(false)
      })

    return () => {
      isActive = false
      window.clearTimeout(refreshTimeout)
    }
  }, [
    clearSession,
    hasHydrated,
    refreshToken,
    setHasBootstrapped,
    setRefreshingSession,
    updateAccessToken,
  ])
}
