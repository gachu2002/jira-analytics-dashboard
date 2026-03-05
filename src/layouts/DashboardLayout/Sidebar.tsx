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
        'border-sidebar-border bg-sidebar sticky top-0 flex h-screen flex-col border-r px-2 py-3',
        compact ? 'w-12' : 'w-[220px] px-3',
      )}
    >
      <div
        className={cn(
          'border-sidebar-border mb-3 flex items-center gap-2 border-b pb-3',
          compact ? 'px-0.5' : 'px-1',
        )}
      >
        <div className="bg-accent-blue flex h-6 w-6 items-center justify-center rounded-[4px] text-[11px] font-semibold text-white">
          SL
        </div>
        {compact ? null : (
          <p className="metric-value text-text-primary text-[13px] tracking-[0.02em]">
            Sprint<span className="text-accent-blue">Lens</span>
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
                  'text-text-secondary relative flex items-center gap-2 rounded-[4px] px-2 py-2 text-sm transition-colors',
                  'hover:bg-surface-elevated hover:text-text-primary',
                  isActive && 'bg-surface-elevated text-text-primary',
                )
              }
              key={item.label}
              to={item.to}
            >
              {({ isActive }) => (
                <>
                  {isActive ? (
                    <span className="bg-accent-blue absolute top-0 bottom-0 left-0 w-[2px]" />
                  ) : null}
                  <Icon size={16} strokeWidth={1.5} />
                  {compact ? null : <span>{item.label}</span>}
                </>
              )}
            </NavLink>
          )
        })}
      </nav>

      <div className="text-text-muted border-sidebar-border mt-auto border-t pt-3 text-[10px]">
        {compact ? 'v1' : 'Sprint Lens v1.0'}
      </div>
    </aside>
  )
}
