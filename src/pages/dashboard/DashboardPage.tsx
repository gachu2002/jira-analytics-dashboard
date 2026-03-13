import { DashboardStateNotice } from '@/features/dashboard/components/DashboardStateNotice'
import { DashboardOverview } from '@/features/dashboard/components/DashboardOverview'
import { useDashboardQuery } from '@/features/dashboard/api/dashboard.api'
import { useDashboardFilters } from '@/features/dashboard/hooks/useDashboardFilters'

export const DashboardPage = () => {
  const { data, isJqlDraftMode, isLoading, isUsingJqlResults } =
    useDashboardQuery()
  const { selectedSprint } = useDashboardFilters()

  if (isJqlDraftMode) {
    return (
      <DashboardStateNotice
        message="Run the current JQL to load overview metrics and sprint charts."
        title="JQL draft only"
      />
    )
  }

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

  if (isUsingJqlResults && data.burnup.length === 0) {
    return (
      <DashboardStateNotice
        message="The current JQL ran successfully, but it did not return sprint data that can drive the overview charts."
        title="No JQL sprint results"
      />
    )
  }

  return <DashboardOverview activeSprintId={selectedSprint} data={data} />
}
