import type { PropsWithChildren } from 'react'
import { Navigate } from 'react-router-dom'

import { ROUTES } from '@/config/routes'
import { useAuthStore } from '@/features/auth/stores/auth.store'

export const GuestGuard = ({ children }: PropsWithChildren) => {
  const isAuthenticated = useAuthStore((state) => Boolean(state.tokens?.access))

  if (isAuthenticated) {
    return <Navigate replace to={ROUTES.overview} />
  }

  return children
}
