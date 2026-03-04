import { Calendar, ChevronRight, LogOut, RefreshCw } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'

import { ROUTES } from '@/config/routes'
import { useAuthStore } from '@/features/auth/stores/auth.store'

const breadcrumbMap: Record<string, string[]> = {
  '/overview': ['SprintLens', 'Overview'],
  '/milestone': ['SprintLens', 'Milestone'],
  '/bug-tracking': ['SprintLens', 'Bug Tracking'],
  '/velocity': ['SprintLens', 'Velocity'],
  '/reopen-rate': ['SprintLens', 'Reopen Rate'],
  '/settings': ['SprintLens', 'Settings'],
}

export const Topbar = () => {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const crumbs = breadcrumbMap[pathname] ?? ['SprintLens']
  const clearAuthSession = useAuthStore((state) => state.clearAuthSession)

  const handleLogout = () => {
    clearAuthSession()
    navigate(ROUTES.login, { replace: true })
  }

  return (
    <header className="border-border bg-background sticky top-0 z-10 flex h-12 items-center border-b px-6">
      <div className="flex flex-1 items-center gap-1">
        {crumbs.map((crumb, index) => (
          <span className="flex items-center gap-1" key={`${crumb}-${index}`}>
            {index > 0 ? <ChevronRight className="text-[var(--text-muted)]" size={12} strokeWidth={1.5} /> : null}
            <span className={`text-xs ${index === crumbs.length - 1 ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}`}>{crumb}</span>
          </span>
        ))}
      </div>

      <div className="absolute left-1/2 flex -translate-x-1/2 items-center gap-2">
        <Calendar className="text-[var(--text-muted)]" size={12} strokeWidth={1.5} />
        <span className="metric-value text-[11px] tracking-[0.04em] text-[var(--text-secondary)]">Mar 2 - Mar 13, 2026</span>
        <span className="metric-value rounded-[2px] border border-[rgba(79,126,247,0.25)] bg-[rgba(79,126,247,0.12)] px-1.5 py-0.5 text-[10px] tracking-[0.06em] text-[var(--accent-blue)]">
          S10
        </span>
      </div>

      <div className="flex flex-1 justify-end gap-2">
        <button
          className="border-border inline-flex h-7 items-center gap-1.5 rounded-[4px] border px-2.5 text-[11px] text-[var(--text-secondary)] transition-colors hover:border-[var(--accent-blue)] hover:text-[var(--text-primary)]"
          type="button"
        >
          <RefreshCw size={12} strokeWidth={1.5} />
          Refresh
        </button>
        <button
          className="border-border inline-flex h-7 items-center gap-1.5 rounded-[4px] border px-2.5 text-[11px] text-[var(--text-secondary)] transition-colors hover:border-[var(--accent-red)] hover:text-[var(--text-primary)]"
          onClick={handleLogout}
          type="button"
        >
          <LogOut size={12} strokeWidth={1.5} />
          Logout
        </button>
      </div>
    </header>
  )
}
