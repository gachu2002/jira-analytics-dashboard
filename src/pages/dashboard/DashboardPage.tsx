import { DashboardOverview } from '@/features/dashboard/components/DashboardOverview'
import { useDashboardQuery } from '@/features/dashboard/api/dashboard.api'

export const DashboardPage = () => {
  const { data, isLoading } = useDashboardQuery()

  if (isLoading || !data) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            className="dashboard-card h-36 animate-pulse bg-[var(--surface-elevated)]"
            key={`kpi-skeleton-${index}`}
          />
        ))}
      </div>
    )
  }

  return <DashboardOverview data={data} />
}
