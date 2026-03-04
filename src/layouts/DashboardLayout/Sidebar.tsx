import {
  AlertTriangle,
  Gauge,
  LayoutDashboard,
  Milestone,
  Settings,
  TrendingUp,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'

import { ROUTES } from '@/config/routes'
import { cn } from '@/lib/utils'

type SidebarProps = {
  compact?: boolean
}

const navItems = [
  { label: 'Overview', to: ROUTES.overview, icon: LayoutDashboard },
  { label: 'Milestone', to: ROUTES.milestone, icon: Milestone },
  { label: 'Bug Tracking', to: ROUTES.bugTracking, icon: AlertTriangle },
  { label: 'Velocity', to: ROUTES.velocity, icon: Gauge },
  { label: 'Reopen Rate', to: ROUTES.reopenRate, icon: TrendingUp },
  { label: 'Settings', to: ROUTES.settings, icon: Settings },
]

export const Sidebar = ({ compact = false }: SidebarProps) => {
  return (
    <aside
      className={cn(
        'sticky top-0 flex h-screen flex-col border-r border-[var(--sidebar-border)] bg-[var(--sidebar)] px-2 py-3',
        compact ? 'w-12' : 'w-[220px] px-3',
      )}
    >
      <div
        className={cn(
          'mb-3 flex items-center gap-2 border-b border-[var(--sidebar-border)] pb-3',
          compact ? 'px-0.5' : 'px-1',
        )}
      >
        <div className="flex h-6 w-6 items-center justify-center rounded-[4px] bg-[var(--accent-blue)] text-[11px] font-semibold text-white">
          SL
        </div>
        {compact ? null : (
          <p className="metric-value text-[13px] tracking-[0.02em] text-[var(--text-primary)]">
            Sprint<span className="text-[var(--accent-blue)]">Lens</span>
          </p>
        )}
      </div>

      <nav className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon

          return (
            <NavLink
              className={({ isActive }) =>
                cn(
                  'relative flex items-center gap-2 rounded-[4px] px-2 py-2 text-sm text-[var(--text-secondary)] transition-colors',
                  'hover:bg-[var(--surface-elevated)] hover:text-[var(--text-primary)]',
                  isActive &&
                    'bg-[var(--surface-elevated)] text-[var(--text-primary)]',
                )
              }
              key={item.label}
              to={item.to}
            >
              {({ isActive }) => (
                <>
                  {isActive ? (
                    <span className="absolute top-0 bottom-0 left-0 w-[2px] bg-[var(--accent-blue)]" />
                  ) : null}
                  <Icon size={16} strokeWidth={1.5} />
                  {compact ? null : <span>{item.label}</span>}
                </>
              )}
            </NavLink>
          )
        })}
      </nav>

      <div className="mt-auto border-t border-[var(--sidebar-border)] pt-3 text-[10px] text-[var(--text-muted)]">
        {compact ? 'v1' : 'Sprint Lens v1.0'}
      </div>
    </aside>
  )
}
