import { Calendar, ChevronRight, LogOut, RefreshCw } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { useLocation, useNavigate } from 'react-router-dom'

import { ROUTES } from '@/config/routes'
import { useDashboardFilters } from '@/features/dashboard/hooks/useDashboardFilters'
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
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const crumbs = breadcrumbMap[pathname] ?? ['SprintLens']
  const clearAuthSession = useAuthStore((state) => state.clearAuthSession)
  const {
    milestones,
    projects,
    selectedMilestone,
    selectedMilestoneId,
    selectedProjectId,
    sprintRange,
    setSelectedMilestoneId,
    setSelectedProjectId,
  } = useDashboardFilters()

  const handleLogout = () => {
    clearAuthSession()
    navigate(ROUTES.login, { replace: true })
  }

  const handleRefresh = () => {
    void queryClient.invalidateQueries({ queryKey: ['dashboard'] })
  }

  return (
    <header className="border-border bg-background sticky top-0 z-10 flex h-12 items-center border-b px-6">
      <div className="flex flex-1 items-center gap-1">
        {crumbs.map((crumb, index) => (
          <span className="flex items-center gap-1" key={`${crumb}-${index}`}>
            {index > 0 ? (
              <ChevronRight
                className="text-text-muted"
                size={12}
                strokeWidth={1.5}
              />
            ) : null}
            <span
              className={`text-xs ${index === crumbs.length - 1 ? 'text-text-primary' : 'text-text-muted'}`}
            >
              {crumb}
            </span>
          </span>
        ))}
      </div>

      <div className="absolute left-1/2 flex -translate-x-1/2 items-center gap-2">
        <select
          className="border-border bg-surface-elevated text-text-secondary h-7 rounded-[4px] border px-2 text-[11px]"
          onChange={(event) => setSelectedProjectId(Number(event.target.value))}
          value={selectedProjectId ?? ''}
        >
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
        <select
          className="border-border bg-surface-elevated text-text-secondary h-7 rounded-[4px] border px-2 text-[11px]"
          onChange={(event) =>
            setSelectedMilestoneId(Number(event.target.value))
          }
          value={selectedMilestoneId ?? ''}
        >
          {milestones.map((milestone) => (
            <option key={milestone.id} value={milestone.id}>
              {milestone.name}
            </option>
          ))}
        </select>
        <Calendar className="text-text-muted" size={12} strokeWidth={1.5} />
        <span className="metric-value text-text-secondary text-[11px] tracking-[0.04em]">
          {sprintRange}
        </span>
        <span className="metric-value text-accent-blue rounded-[2px] border border-[#4f7ef740] bg-[#4f7ef720] px-1.5 py-0.5 text-[10px] tracking-[0.06em]">
          {selectedMilestone?.name ?? '--'}
        </span>
      </div>

      <div className="flex flex-1 justify-end gap-2">
        <button
          className="border-border text-text-secondary hover:border-accent-blue hover:text-text-primary inline-flex h-7 items-center gap-1.5 rounded-[4px] border px-2.5 text-[11px] transition-colors"
          onClick={handleRefresh}
          type="button"
        >
          <RefreshCw size={12} strokeWidth={1.5} />
          Refresh
        </button>
        <button
          className="border-border text-text-secondary hover:border-accent-red hover:text-text-primary inline-flex h-7 items-center gap-1.5 rounded-[4px] border px-2.5 text-[11px] transition-colors"
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
