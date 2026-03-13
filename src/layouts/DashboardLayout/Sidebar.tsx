import {
  AlertTriangle,
  Gauge,
  LayoutDashboard,
  LogOut,
  Milestone,
  RefreshCw,
  Settings,
  TrendingUp,
} from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { NavLink, useNavigate } from 'react-router-dom'

import { ROUTES } from '@/config/routes'
import { useAuthStore } from '@/features/auth/stores/auth.store'
import { cn } from '@/lib/utils'

type SidebarProps = {
  compact?: boolean
}

const navItems = [
  { label: 'Overview', to: ROUTES.overview, icon: LayoutDashboard },
  { label: 'Milestone', to: ROUTES.milestone, icon: Milestone },
  { label: 'Bug Fix', to: ROUTES.bugTracking, icon: AlertTriangle },
  { label: 'Bug Fix Velocity', to: ROUTES.velocity, icon: Gauge },
  { label: 'Reopened Rate', to: ROUTES.reopenRate, icon: TrendingUp },
]

export const Sidebar = ({ compact = false }: SidebarProps) => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const clearAuthSession = useAuthStore((state) => state.clearAuthSession)

  const handleRefresh = () => {
    void queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    void queryClient.invalidateQueries({ queryKey: ['milestone-sprints'] })
    void queryClient.invalidateQueries({ queryKey: ['milestones'] })
    void queryClient.invalidateQueries({ queryKey: ['milestone-jql'] })
    void queryClient.invalidateQueries({ queryKey: ['custom-jql-dashboard'] })
  }

  const handleLogout = () => {
    clearAuthSession()
    navigate(ROUTES.login, { replace: true })
  }

  return (
    <aside
      className={cn(
        'border-sidebar-border/80 bg-sidebar/94 fixed inset-y-0 left-0 z-30 flex flex-col overflow-y-auto border-r px-2 py-3 shadow-[8px_0_24px_rgba(15,23,42,0.05)] backdrop-blur-md',
        compact ? 'w-12' : 'w-[220px] px-3',
      )}
    >
      <div
        className={cn(
          'border-sidebar-border mb-3 flex items-center gap-2 border-b pb-3',
          compact ? 'px-0.5' : 'px-1',
        )}
      >
        <div className="bg-primary text-primary-foreground flex h-6 w-6 items-center justify-center rounded-[4px] text-[11px] font-semibold">
          SL
        </div>
        {compact ? null : (
          <p className="metric-value text-text-primary text-[13px] tracking-[0.02em]">
            Sprint<span className="text-primary">Lens</span>
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
                    <span className="bg-primary absolute top-0 bottom-0 left-0 w-[2px]" />
                  ) : null}
                  <Icon size={16} strokeWidth={1.5} />
                  {compact ? null : <span>{item.label}</span>}
                </>
              )}
            </NavLink>
          )
        })}
      </nav>

      <div className="border-sidebar-border mt-auto space-y-2 border-t pt-3">
        <NavLink
          className={({ isActive }) =>
            cn(
              'text-text-secondary relative flex items-center gap-2 rounded-[4px] px-2 py-2 text-sm transition-colors',
              'hover:bg-surface-elevated hover:text-text-primary',
              isActive && 'bg-surface-elevated text-text-primary',
            )
          }
          to={ROUTES.settings}
        >
          {({ isActive }) => (
            <>
              {isActive ? (
                <span className="bg-primary absolute top-0 bottom-0 left-0 w-[2px]" />
              ) : null}
              <Settings size={16} strokeWidth={1.5} />
              {compact ? null : <span>Settings</span>}
            </>
          )}
        </NavLink>
        <button
          className="text-text-secondary hover:bg-surface-elevated hover:text-text-primary flex w-full items-center gap-2 rounded-[4px] px-2 py-2 text-sm transition-colors"
          onClick={handleRefresh}
          type="button"
        >
          <RefreshCw size={16} strokeWidth={1.5} />
          {compact ? null : <span>Refresh</span>}
        </button>
        <button
          className="text-text-secondary hover:bg-surface-elevated hover:text-text-primary flex w-full items-center gap-2 rounded-[4px] px-2 py-2 text-sm transition-colors"
          onClick={handleLogout}
          type="button"
        >
          <LogOut size={16} strokeWidth={1.5} />
          {compact ? null : <span>Logout</span>}
        </button>
      </div>
    </aside>
  )
}
