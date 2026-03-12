import { Check, LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { ROUTES } from '@/config/routes'
import { useAuthStore } from '@/features/auth/stores/auth.store'
import { THEME_OPTIONS, useUiStore } from '@/stores/ui.store'

export const SettingsPage = () => {
  const navigate = useNavigate()
  const theme = useUiStore((state) => state.theme)
  const setTheme = useUiStore((state) => state.setTheme)
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

      <div className="border-border bg-surface-elevated mt-5 rounded-[4px] border px-4 py-4">
        <div>
          <p className="text-text-primary text-sm">Theme</p>
          <p className="text-text-secondary mt-1 text-xs">
            Choose the dashboard atmosphere that fits your workspace.
          </p>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {THEME_OPTIONS.map((option) => {
            const active = option.value === theme

            return (
              <button
                className="border-border bg-card hover:border-primary relative overflow-hidden rounded-[4px] border p-3 text-left transition-colors"
                key={option.value}
                onClick={() => setTheme(option.value)}
                type="button"
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-text-primary text-sm">{option.label}</p>
                    <p className="text-text-secondary mt-1 text-[11px] leading-5">
                      {option.description}
                    </p>
                  </div>
                  <span
                    className={`inline-flex h-5 w-5 items-center justify-center rounded-full border ${active ? 'border-primary bg-info-soft text-primary' : 'border-border text-text-muted'}`}
                  >
                    {active ? <Check size={12} strokeWidth={2} /> : null}
                  </span>
                </div>

                <div
                  className="grid grid-cols-4 gap-2"
                  data-theme={option.value}
                >
                  <span
                    className="h-10 rounded-[3px] border"
                    style={{
                      background:
                        'linear-gradient(135deg, var(--background), var(--surface-elevated))',
                      borderColor: 'var(--border)',
                    }}
                  />
                  <span
                    className="h-10 rounded-[3px] border"
                    style={{
                      background: 'var(--surface)',
                      borderColor: 'var(--border)',
                    }}
                  />
                  <span
                    className="h-10 rounded-[3px] border"
                    style={{
                      background: 'var(--primary)',
                      borderColor: 'var(--primary)',
                    }}
                  />
                  <span
                    className="h-10 rounded-[3px] border"
                    style={{
                      background: 'var(--status-success)',
                      borderColor: 'var(--status-success)',
                    }}
                  />
                </div>
              </button>
            )
          })}
        </div>
      </div>

      <div className="border-border bg-surface-elevated mt-3 flex items-center justify-between rounded-[4px] border px-4 py-3">
        <div>
          <p className="text-text-primary text-sm">Session</p>
          <p className="text-text-secondary mt-1 text-xs">
            Sign out from the current account.
          </p>
        </div>
        <button
          className="border-border text-text-secondary hover:border-danger hover:text-text-primary inline-flex items-center gap-2 rounded-[4px] border px-3 py-1.5 text-xs transition-colors"
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
