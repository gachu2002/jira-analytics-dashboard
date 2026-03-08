import { Check, LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { ROUTES } from '@/config/routes'
import { useAuthStore } from '@/features/auth/stores/auth.store'
import { THEME_OPTIONS, useUiStore } from '@/stores/ui.store'

const THEME_PREVIEWS = {
  dark: {
    background: {
      background: 'linear-gradient(135deg, #0f1117, #1b2030)',
      borderColor: '#2a2f45',
    },
    surface: { background: '#1e2335', borderColor: '#2a2f45' },
    accent: { background: '#4f7ef7', borderColor: '#4f7ef7' },
    support: { background: '#3dd68c', borderColor: '#3dd68c' },
  },
  light: {
    background: {
      background: 'linear-gradient(135deg, #f7f8fc, #eef1f9)',
      borderColor: '#d9deec',
    },
    surface: { background: '#ffffff', borderColor: '#d9deec' },
    accent: { background: '#4f7ef7', borderColor: '#4f7ef7' },
    support: { background: '#f5a623', borderColor: '#f5a623' },
  },
  ocean: {
    background: {
      background: 'linear-gradient(135deg, #08161b, #12303a)',
      borderColor: '#224652',
    },
    surface: { background: '#10262f', borderColor: '#224652' },
    accent: { background: '#2fc7c4', borderColor: '#2fc7c4' },
    support: { background: '#7bd389', borderColor: '#7bd389' },
  },
  sand: {
    background: {
      background: 'linear-gradient(135deg, #f5efe4, #ece2d0)',
      borderColor: '#d3c1a3',
    },
    surface: { background: '#fffaf0', borderColor: '#d3c1a3' },
    accent: { background: '#2a6f97', borderColor: '#2a6f97' },
    support: { background: '#c77432', borderColor: '#c77432' },
  },
} as const

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
                className="border-border bg-card hover:border-accent-blue relative overflow-hidden rounded-[4px] border p-3 text-left transition-colors"
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
                    className={`inline-flex h-5 w-5 items-center justify-center rounded-full border ${active ? 'border-accent-blue bg-accent-blue/15 text-accent-blue' : 'border-border text-text-muted'}`}
                  >
                    {active ? <Check size={12} strokeWidth={2} /> : null}
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  <span
                    className="h-10 rounded-[3px] border"
                    style={THEME_PREVIEWS[option.value].background}
                  />
                  <span
                    className="h-10 rounded-[3px] border"
                    style={THEME_PREVIEWS[option.value].surface}
                  />
                  <span
                    className="h-10 rounded-[3px] border"
                    style={THEME_PREVIEWS[option.value].accent}
                  />
                  <span
                    className="h-10 rounded-[3px] border"
                    style={THEME_PREVIEWS[option.value].support}
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
