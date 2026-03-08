import type { PropsWithChildren } from 'react'
import { Navigate } from 'react-router-dom'

import { PageLoader } from '@/components/common/PageLoader'
import { ROUTES } from '@/config/routes'
import { useAuthStore } from '@/features/auth/stores/auth.store'

export const AuthGuard = ({ children }: PropsWithChildren) => {
  const isInitialized = useAuthStore((state) => state.isInitialized)
  const isAuthenticated = useAuthStore((state) => Boolean(state.tokens?.access))

  if (!isInitialized) {
    return <PageLoader blocks={1} />
  }

  if (!isAuthenticated) {
    return <Navigate replace to={ROUTES.login} />
  }

  return children
}
