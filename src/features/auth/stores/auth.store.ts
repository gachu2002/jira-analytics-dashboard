import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type { AuthSession } from '@/features/auth/types/auth.types'

type AuthState = {
  session: AuthSession | null
  hasHydrated: boolean
  hasBootstrapped: boolean
  isRefreshingSession: boolean
  setSession: (session: AuthSession) => void
  updateAccessToken: (accessToken: string) => void
  clearSession: () => void
  setHasHydrated: (hasHydrated: boolean) => void
  setHasBootstrapped: (hasBootstrapped: boolean) => void
  setRefreshingSession: (isRefreshing: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      session: null,
      hasHydrated: false,
      hasBootstrapped: false,
      isRefreshingSession: false,
      setSession: (session) => set({ session, hasBootstrapped: true }),
      updateAccessToken: (accessToken) =>
        set((state) => ({
          session: state.session
            ? {
                ...state.session,
                accessToken,
              }
            : null,
        })),
      clearSession: () => set({ session: null, hasBootstrapped: true }),
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
      setHasBootstrapped: (hasBootstrapped) => set({ hasBootstrapped }),
      setRefreshingSession: (isRefreshingSession) =>
        set({ isRefreshingSession }),
    }),
    {
      name: 'jira-dashboard-auth',
      partialize: (state) => ({ session: state.session }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    },
  ),
)
