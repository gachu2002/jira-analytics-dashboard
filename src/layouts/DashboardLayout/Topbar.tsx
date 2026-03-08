import { ChevronRight, LogOut, RefreshCw } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { useLocation, useNavigate } from 'react-router-dom'

import {
  SelectContent,
  SelectItem,
  SelectRoot,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ROUTES } from '@/config/routes'
import { useAuthStore } from '@/features/auth/stores/auth.store'
import { useDashboardFilters } from '@/features/dashboard/hooks/useDashboardFilters'

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
    isLoading,
    milestones,
    projects,
    selectedMilestoneId,
    selectedProjectId,
    selectedSprint,
    sprints,
    setSelectedMilestoneId,
    setSelectedProjectId,
    setSelectedSprint,
  } = useDashboardFilters()

  const handleLogout = () => {
    clearAuthSession()
    navigate(ROUTES.login, { replace: true })
  }

  const handleRefresh = () => {
    void queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    void queryClient.invalidateQueries({ queryKey: ['milestone-sprints'] })
    void queryClient.invalidateQueries({ queryKey: ['milestones'] })
  }

  return (
    <header className="border-border bg-background/90 sticky top-0 z-10 border-b backdrop-blur">
      <div className="px-6 py-4">
        <div className="grid gap-4 min-[1440px]:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] min-[1440px]:items-center">
          <div className="min-w-0 min-[1440px]:pr-6">
            <div className="flex flex-wrap items-center gap-1">
              {crumbs.map((crumb, index) => (
                <span
                  className="flex items-center gap-1"
                  key={`${crumb}-${index}`}
                >
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
          </div>

          <div className="flex flex-col gap-3 min-[900px]:flex-row min-[900px]:items-center min-[1440px]:justify-self-center">
            <FilterSelect
              onChange={(value) => setSelectedProjectId(Number(value))}
              options={projects.map((project) => ({
                label: project.name,
                value: String(project.id),
              }))}
              placeholder="Select project"
              value={
                selectedProjectId !== null ? String(selectedProjectId) : ''
              }
            />
            <FilterSelect
              onChange={(value) => setSelectedMilestoneId(Number(value))}
              options={milestones.map((milestone) => ({
                label: milestone.name,
                value: String(milestone.id),
              }))}
              placeholder="Select milestone"
              value={
                selectedMilestoneId !== null ? String(selectedMilestoneId) : ''
              }
            />
            <FilterSelect
              disabled={sprints.length === 0}
              onChange={(value) => setSelectedSprint(Number(value))}
              options={sprints.map((item) => ({
                label: `Sprint ${item.sprint}`,
                value: String(item.sprint),
              }))}
              placeholder={
                sprints.length === 0 ? 'No sprints' : 'Select sprint'
              }
              value={selectedSprint !== null ? String(selectedSprint) : ''}
            />
          </div>

          <div className="flex items-center gap-2 min-[1440px]:justify-end min-[1440px]:justify-self-end">
            <button
              className="border-border bg-background text-text-secondary hover:border-accent-blue hover:text-text-primary inline-flex h-10 items-center gap-1.5 rounded-[4px] border px-3 text-[11px] transition-colors disabled:opacity-60"
              disabled={isLoading}
              onClick={handleRefresh}
              type="button"
            >
              <RefreshCw size={12} strokeWidth={1.5} />
              Refresh
            </button>
            <button
              className="border-border bg-background text-text-secondary hover:border-accent-red hover:text-text-primary inline-flex h-10 items-center gap-1.5 rounded-[4px] border px-3 text-[11px] transition-colors"
              onClick={handleLogout}
              type="button"
            >
              <LogOut size={12} strokeWidth={1.5} />
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

type FilterSelectProps = {
  disabled?: boolean
  onChange: (value: string) => void
  options: Array<{ label: string; value: string }>
  placeholder: string
  value: string
}

const FilterSelect = ({
  disabled = false,
  onChange,
  options,
  placeholder,
  value,
}: FilterSelectProps) => (
  <div className="min-w-[180px]">
    <SelectRoot disabled={disabled} onValueChange={onChange} value={value}>
      <SelectTrigger className="bg-background min-w-[180px]">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </SelectRoot>
  </div>
)
