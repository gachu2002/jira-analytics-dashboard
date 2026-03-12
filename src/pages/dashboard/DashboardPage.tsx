import { DashboardOverview } from '@/features/dashboard/components/DashboardOverview'
import { useDashboardQuery } from '@/features/dashboard/api/dashboard.api'
import { useDashboardFilters } from '@/features/dashboard/hooks/useDashboardFilters'

export const DashboardPage = () => {
  const { data, isLoading } = useDashboardQuery()
  const { selectedSprint } = useDashboardFilters()

  if (isLoading || !data) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            className="dashboard-card bg-surface-elevated h-36 animate-pulse"
            key={`kpi-skeleton-${index}`}
          />
        ))}
      </div>
    )
  }

  return <DashboardOverview activeSprintId={selectedSprint} data={data} />
}
