import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type { AuthTokens } from '@/features/auth/types/auth.types'

type AuthState = {
  tokens: AuthTokens | null
  username: string | null
  isInitialized: boolean
  setAuthSession: (username: string | null, tokens: AuthTokens) => void
  clearAuthSession: () => void
  setAuthInitialized: (isInitialized: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      tokens: null,
      username: null,
      isInitialized: false,
      setAuthSession: (username, tokens) => set({ username, tokens }),
      clearAuthSession: () => set({ username: null, tokens: null }),
      setAuthInitialized: (isInitialized) => set({ isInitialized }),
    }),
    {
      name: 'sprint-lens-auth',
      partialize: (state) => ({
        tokens: state.tokens,
        username: state.username,
      }),
    },
  ),
)
