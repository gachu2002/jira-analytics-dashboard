import { lazy, Suspense, type ReactElement } from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'

import { PageLoader } from '@/components/common/PageLoader'
import { ROUTES } from '@/config/routes'
import { useAuthBootstrap } from '@/features/auth/hooks/useAuthBootstrap'
import { AuthLayout } from '@/layouts/AuthLayout'
import { DashboardLayout } from '@/layouts/DashboardLayout'
import { RootLayout } from '@/layouts/RootLayout'
import { NotFoundPage } from '@/pages'
import { queryClient } from '@/lib/query-client'
import { AuthGuard } from '@/routes/guards/AuthGuard'
import { GuestGuard } from '@/routes/guards/GuestGuard'

const LoginPage = lazy(() =>
  import('@/pages/auth/LoginPage').then((module) => ({
    default: module.LoginPage,
  })),
)
const RegisterPage = lazy(() =>
  import('@/pages/auth/RegisterPage').then((module) => ({
    default: module.RegisterPage,
  })),
)
const DashboardPage = lazy(() =>
  import('@/pages/dashboard/DashboardPage').then((module) => ({
    default: module.DashboardPage,
  })),
)
const MilestonePage = lazy(() =>
  import('@/pages/milestone/MilestonePage').then((module) => ({
    default: module.MilestonePage,
  })),
)
const BugTrackingPage = lazy(() =>
  import('@/pages/bug-tracking/BugTrackingPage').then((module) => ({
    default: module.BugTrackingPage,
  })),
)
const BugAnalysisPage = lazy(() =>
  import('@/pages/bug-analysis/BugAnalysisPage').then((module) => ({
    default: module.BugAnalysisPage,
  })),
)
const VelocityPage = lazy(() =>
  import('@/pages/velocity/VelocityPage').then((module) => ({
    default: module.VelocityPage,
  })),
)
const ReopenRatePage = lazy(() =>
  import('@/pages/reopen-rate/ReopenRatePage').then((module) => ({
    default: module.ReopenRatePage,
  })),
)
const SettingsPage = lazy(() =>
  import('@/pages/settings/SettingsPage').then((module) => ({
    default: module.SettingsPage,
  })),
)

const withSuspense = (element: ReactElement, blocks = 1) => (
  <Suspense fallback={<PageLoader blocks={blocks} />}>{element}</Suspense>
)

const HomeRedirect = () => {
  const { isAuthenticated, isInitialized } = useAuthBootstrap()

  if (!isInitialized) {
    return <PageLoader blocks={1} />
  }

  return (
    <Navigate replace to={isAuthenticated ? ROUTES.overview : ROUTES.login} />
  )
}

const AuthBootstrap = () => {
  const { isInitialized } = useAuthBootstrap()

  if (!isInitialized) {
    return <PageLoader blocks={1} />
  }

  return <RouterProvider router={router} />
}

const router = createBrowserRouter([
  {
    path: ROUTES.home,
    element: <RootLayout />,
    children: [
      {
        path: ROUTES.home,
        element: <HomeRedirect />,
      },
      {
        path: 'auth',
        element: <AuthLayout />,
        children: [
          {
            path: 'login',
            element: <GuestGuard>{withSuspense(<LoginPage />)}</GuestGuard>,
          },
          {
            path: 'register',
            element: <GuestGuard>{withSuspense(<RegisterPage />)}</GuestGuard>,
          },
        ],
      },
      {
        element: (
          <AuthGuard>
            <DashboardLayout />
          </AuthGuard>
        ),
        children: [
          {
            path: ROUTES.overview,
            element: withSuspense(<DashboardPage />, 3),
          },
          {
            path: ROUTES.milestone,
            element: withSuspense(<MilestonePage />, 2),
          },
          {
            path: ROUTES.bugTracking,
            element: withSuspense(<BugTrackingPage />, 2),
          },
          {
            path: ROUTES.bugAnalysis,
            element: withSuspense(<BugAnalysisPage />, 2),
          },
          {
            path: ROUTES.velocity,
            element: withSuspense(<VelocityPage />, 2),
          },
          {
            path: ROUTES.reopenRate,
            element: withSuspense(<ReopenRatePage />, 2),
          },
          {
            path: ROUTES.settings,
            element: withSuspense(<SettingsPage />),
          },
        ],
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
])

export const AppRouter = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthBootstrap />
    </QueryClientProvider>
  )
}
