import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type { AuthTokens } from '@/features/auth/types/auth.types'

type AuthState = {
  tokens: AuthTokens | null
  username: string | null
  setAuthSession: (username: string | null, tokens: AuthTokens) => void
  clearAuthSession: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      tokens: null,
      username: null,
      setAuthSession: (username, tokens) => set({ username, tokens }),
      clearAuthSession: () => set({ username: null, tokens: null }),
    }),
    {
      name: 'sprint-lens-auth',
    },
  ),
)
