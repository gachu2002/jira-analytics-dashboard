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
      <p className="mt-1 text-sm text-[var(--text-secondary)]">
        Workspace preferences for Sprint Lens.
      </p>

      <div className="mt-5 flex items-center justify-between rounded-[4px] border border-[var(--border)] bg-[var(--surface-elevated)] px-4 py-3">
        <div>
          <p className="text-sm text-[var(--text-primary)]">Theme</p>
          <p className="mt-1 text-xs text-[var(--text-secondary)]">
            Switch between dark and light mode.
          </p>
        </div>
        <button
          className="inline-flex items-center gap-2 rounded-[4px] border border-[var(--border)] px-3 py-1.5 text-xs text-[var(--text-secondary)] transition-colors hover:border-[var(--accent-blue)] hover:text-[var(--text-primary)]"
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

      <div className="mt-3 flex items-center justify-between rounded-[4px] border border-[var(--border)] bg-[var(--surface-elevated)] px-4 py-3">
        <div>
          <p className="text-sm text-[var(--text-primary)]">Session</p>
          <p className="mt-1 text-xs text-[var(--text-secondary)]">Sign out from the current account.</p>
        </div>
        <button
          className="inline-flex items-center gap-2 rounded-[4px] border border-[var(--border)] px-3 py-1.5 text-xs text-[var(--text-secondary)] transition-colors hover:border-[var(--accent-red)] hover:text-[var(--text-primary)]"
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
