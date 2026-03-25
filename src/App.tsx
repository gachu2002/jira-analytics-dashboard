import { useEffect } from 'react'

import { useAuthBootstrap, useAuthStore } from '@/features/auth'
import { setupAuthInterceptors } from '@/lib/http'
import { AppRouter } from '@/routes/app-router'
import { useThemeStore } from '@/stores/theme-store'

const App = () => {
  const theme = useThemeStore((state) => state.theme)
  const hasHydrated = useAuthStore((state) => state.hasHydrated)

  useAuthBootstrap()

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', theme === 'dark')
    root.style.colorScheme = theme
  }, [theme])

  useEffect(() => {
    const cleanup = setupAuthInterceptors()
    return cleanup
  }, [])

  if (!hasHydrated) {
    return (
      <main className="ops-shell bg-background text-foreground flex min-h-screen items-center justify-center px-4">
        <div className="ops-panel-strong w-full max-w-md rounded-[28px] px-6 py-8 text-center sm:px-8">
          <p className="ops-kicker">Session bootstrap</p>
          <h1 className="font-display mt-3 text-3xl tracking-[-0.04em]">
            Restoring access
          </h1>
          <p className="text-muted-foreground mt-3 text-sm leading-7">
            Verifying your session with the refresh token before loading the
            app.
          </p>
        </div>
      </main>
    )
  }

  return <AppRouter />
}

export default App
