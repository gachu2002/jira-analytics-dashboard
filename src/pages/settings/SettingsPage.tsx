import { LogOut, Moon, Sun } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { ROUTES } from '@/config/routes'
import { useAuthStore } from '@/features/auth/stores/auth.store'
import { useUiStore } from '@/stores/ui.store'

export const SettingsPage = () => {
  const navigate = useNavigate()
  const theme = useUiStore((state) => state.theme)
  const toggleTheme = useUiStore((state) => state.toggleTheme)
  const clearAuthSession = useAuthStore((state) => state.clearAuthSession)

  const handleLogout = () => {
    clearAuthSession()
    navigate(ROUTES.login, { replace: true })
  }

  return (
    <section className="dashboard-card max-w-2xl p-6">
      <h2 className="metric-value text-lg font-semibold">Settings</h2>
      <p className="text-text-secondary mt-1 text-sm">
        Workspace preferences for Sprint Lens.
      </p>

      <div className="border-border bg-surface-elevated mt-5 flex items-center justify-between rounded-[4px] border px-4 py-3">
        <div>
          <p className="text-text-primary text-sm">Theme</p>
          <p className="text-text-secondary mt-1 text-xs">
            Switch between dark and light mode.
          </p>
        </div>
        <button
          className="border-border text-text-secondary hover:border-accent-blue hover:text-text-primary inline-flex items-center gap-2 rounded-[4px] border px-3 py-1.5 text-xs transition-colors"
          onClick={toggleTheme}
          type="button"
        >
          {theme === 'dark' ? (
            <Moon size={14} strokeWidth={1.5} />
          ) : (
            <Sun size={14} strokeWidth={1.5} />
          )}
          {theme === 'dark' ? 'Dark' : 'Light'}
        </button>
      </div>

      <div className="border-border bg-surface-elevated mt-3 flex items-center justify-between rounded-[4px] border px-4 py-3">
        <div>
          <p className="text-text-primary text-sm">Session</p>
          <p className="text-text-secondary mt-1 text-xs">
            Sign out from the current account.
          </p>
        </div>
        <button
          className="border-border text-text-secondary hover:border-accent-red hover:text-text-primary inline-flex items-center gap-2 rounded-[4px] border px-3 py-1.5 text-xs transition-colors"
          onClick={handleLogout}
          type="button"
        >
          <LogOut size={14} strokeWidth={1.5} />
          Logout
        </button>
      </div>
    </section>
  )
}
