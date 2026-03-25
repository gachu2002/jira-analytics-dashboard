import { Suspense, lazy } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import { useAuthStore } from '@/features/auth'
import { AppLayout } from '@/layouts/app-layout'

const LoginPage = lazy(() =>
  import('@/pages/login-page').then((module) => ({
    default: module.LoginPage,
  })),
)

const ThemePreviewPage = lazy(() =>
  import('@/pages/theme-preview-page').then((module) => ({
    default: module.ThemePreviewPage,
  })),
)

const BugPage = lazy(() =>
  import('@/pages/bug-page').then((module) => ({ default: module.BugPage })),
)

const MilestonePage = lazy(() =>
  import('@/pages/milestone-page').then((module) => ({
    default: module.MilestonePage,
  })),
)

export function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<RouteShell />}>
        <Routes>
          <Route path="/" element={<HomeRedirect />} />
          <Route path="/login" element={<LoginGate />} />
          <Route element={<ProtectedLayout />}>
            <Route path="/milestones" element={<MilestonePage />} />
            <Route path="/bugs" element={<BugPage />} />
          </Route>
          <Route path="/preview" element={<PreviewGate />} />
          <Route path="*" element={<Navigate replace to="/" />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

function HomeRedirect() {
  const isAuthenticated = useAuthStore((state) => Boolean(state.session))

  return <Navigate replace to={isAuthenticated ? '/bugs' : '/login'} />
}

function LoginGate() {
  const isAuthenticated = useAuthStore((state) => Boolean(state.session))

  return isAuthenticated ? <Navigate replace to="/bugs" /> : <LoginPage />
}

function ProtectedLayout() {
  const isAuthenticated = useAuthStore((state) => Boolean(state.session))

  return isAuthenticated ? <AppLayout /> : <Navigate replace to="/login" />
}

function PreviewGate() {
  const isAuthenticated = useAuthStore((state) => Boolean(state.session))

  return isAuthenticated ? (
    <ThemePreviewPage />
  ) : (
    <Navigate replace to="/login" />
  )
}

function RouteShell() {
  return (
    <main className="ops-shell bg-background text-foreground flex min-h-screen items-center justify-center px-4">
      <div className="ops-panel-strong w-full max-w-md rounded-[28px] px-6 py-8 text-center sm:px-8">
        <p className="ops-kicker">Loading</p>
      </div>
    </main>
  )
}
