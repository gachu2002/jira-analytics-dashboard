import { KpiCard } from '@/components/common/KpiCard'
import { ReopenRateCard } from '@/features/dashboard/components/ReopenRateCard'
import { useDashboardQuery } from '@/features/dashboard/api/dashboard.api'
import { useDashboardFilters } from '@/features/dashboard/hooks/useDashboardFilters'
import { getActiveSprint } from '@/features/dashboard/utils/sprint'

export const ReopenRatePage = () => {
  const { data } = useDashboardQuery()
  const { selectedSprint } = useDashboardFilters()

  if (!data) {
    return null
  }

  if (data.reopenRateSeries.length === 0) {
    return (
      <div className="dashboard-card text-text-muted p-4 text-sm">
        No reopen-rate data is available for this milestone.
      </div>
    )
  }

  const totalReopened = data.reopenRateSeries.reduce(
    (sum, point) => sum + point.reopened,
    0,
  )
  const totalResolved = data.reopenRateSeries.reduce(
    (sum, point) => sum + point.resolved,
    0,
  )
  const current = getActiveSprint(data.reopenRateSeries, selectedSprint)
  const overallRate =
    totalResolved > 0 ? (totalReopened / totalResolved) * 100 : 0
  const currentTargetDelta = current.target - current.rate

  return (
    <div className="space-y-4">
      <header>
        <h1 className="metric-value text-text-primary text-base">
          Reopen Rate
        </h1>
        <p className="text-text-muted mt-1 text-xs">
          Bug reopen trend - quality signal with 3% target threshold
        </p>
      </header>

      <section className="grid grid-cols-1 gap-3 min-[1024px]:grid-cols-2 min-[1440px]:grid-cols-4">
        <KpiCard
          label="Current Rate"
          value={`${(current.rate * 100).toFixed(1)}%`}
          animatedValue={Math.round(current.rate * 1000)}
          formatter={(value) => `${(value / 10).toFixed(1)}%`}
          subtext={`${current.sprint} reopen rate`}
          delta={{
            label: `Target: ${(current.target * 100).toFixed(1)}%`,
            tone: current.rate <= current.target ? 'green' : 'red',
          }}
        />
        <KpiCard
          label="Resolved Bugs"
          value={current.resolved.toString()}
          animatedValue={current.resolved}
          subtext={`${current.sprint} resolved bugs used in reopen-rate calculations`}
        />
        <KpiCard
          label="Reopened Bugs"
          value={current.reopened.toString()}
          animatedValue={current.reopened}
          subtext={`${current.sprint} reopened bug count`}
          delta={{
            label: `${overallRate.toFixed(1)}% overall rate`,
            tone: 'amber',
          }}
        />
        <KpiCard
          label="Target Gap"
          value={`${(Math.abs(currentTargetDelta) * 100).toFixed(1)}%`}
          animatedValue={Math.round(Math.abs(currentTargetDelta) * 1000)}
          formatter={(value) => `${(value / 10).toFixed(1)}%`}
          subtext={
            currentTargetDelta >= 0
              ? 'Below target threshold'
              : 'Above target threshold'
          }
          delta={{
            label: `Target: ${(current.target * 100).toFixed(1)}%`,
            tone: currentTargetDelta >= 0 ? 'green' : 'red',
          }}
        />
        <KpiCard
          label="Overall Reopen Rate"
          value={`${overallRate.toFixed(1)}%`}
          animatedValue={Math.round(overallRate * 10)}
          formatter={(value) => `${(value / 10).toFixed(1)}%`}
          subtext="Across all returned sprints"
        />
      </section>

      <section className="grid grid-cols-1 gap-4 min-[1320px]:grid-cols-2">
        <ReopenRateCard
          activeSprintId={selectedSprint}
          data={data.reopenRateSeries}
          fullWidth
        />

        <section className="dashboard-card p-4">
          <p className="text-text-muted mb-3 text-[10px] tracking-[0.1em] uppercase">
            Current Sprint Details
          </p>
          <div className="grid gap-3 min-[768px]:grid-cols-2">
            <div className="border-border rounded-[4px] border p-3">
              <p className="text-text-muted text-[10px] tracking-[0.08em] uppercase">
                Sprint
              </p>
              <p className="metric-value text-text-primary mt-1 text-lg">
                {current.sprint}
              </p>
            </div>
            <div className="border-border rounded-[4px] border p-3">
              <p className="text-text-muted text-[10px] tracking-[0.08em] uppercase">
                Reopened / Resolved
              </p>
              <p className="metric-value text-text-primary mt-1 text-lg">
                {current.reopened} / {current.resolved}
              </p>
            </div>
          </div>
        </section>
      </section>
    </div>
  )
}
