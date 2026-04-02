import { useEffect } from 'react'

import { AppLoadingScreen } from '@/components/common/loading-state'
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
    return <AppLoadingScreen title="Restoring session" />
  }

  return <AppRouter />
}

export default App
