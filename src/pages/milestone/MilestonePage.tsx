import { KpiCard } from '@/components/common/KpiCard'
import { MilestoneProgressCard } from '@/features/dashboard/components/MilestoneProgressCard'
import { useDashboardQuery } from '@/features/dashboard/api/dashboard.api'
import { useDashboardFilters } from '@/features/dashboard/hooks/useDashboardFilters'
import {
  getActiveSprint,
  getPreviousSprint,
} from '@/features/dashboard/utils/sprint'

export const MilestonePage = () => {
  const { data } = useDashboardQuery()
  const { selectedSprint } = useDashboardFilters()

  if (!data) {
    return null
  }

  if (data.burnup.length === 0) {
    return (
      <div className="dashboard-card text-text-muted p-4 text-sm">
        No milestone sprint data is available yet.
      </div>
    )
  }

  const current =
    getActiveSprint(data.burnup, selectedSprint) ??
    ({ sprintId: 0, sprint: 'S0', completed: 0, scope: 0 } as const)
  const previous = getPreviousSprint(data.burnup, selectedSprint)
  const sprintCount = data.burnup.length
  const scopeDelta = current.scope - (previous?.scope ?? current.scope)
  const remainingScope = Math.max(current.scope - current.completed, 0)
  const previousRemainingScope = Math.max(
    (previous?.scope ?? current.scope) -
      (previous?.completed ?? current.completed),
    0,
  )
  const remainingScopeDelta = remainingScope - previousRemainingScope

  return (
    <div className="space-y-4">
      <header>
        <h1 className="metric-value text-text-primary text-base">
          Milestone Progress
        </h1>
        <p className="text-text-muted mt-1 text-xs">
          Milestone burnup tracking - scope vs completion trajectory
        </p>
      </header>

      <section className="grid grid-cols-1 gap-3 min-[1024px]:grid-cols-2 min-[1440px]:grid-cols-4">
        <KpiCard
          label="Points Completed"
          value={current.completed.toString()}
          animatedValue={current.completed}
          subtext={`${current.sprint} completed points`}
          delta={{
            label: `${data.milestoneProgress.completionPercent.toFixed(1)}% complete`,
            tone: 'blue',
          }}
          progress={{
            value: current.completed,
            max: current.scope,
          }}
        />
        <KpiCard
          label="Scope (pts)"
          value={data.milestoneProgress.total.toString()}
          animatedValue={data.milestoneProgress.total}
          subtext="Current scope for selected milestone"
          delta={{
            label: `${scopeDelta >= 0 ? '↑' : '↓'}${Math.abs(scopeDelta)} vs previous sprint`,
            tone: 'amber',
          }}
        />
        <KpiCard
          label="Remaining Scope"
          value={remainingScope.toString()}
          animatedValue={remainingScope}
          subtext={`${current.sprint} points left to finish`}
          delta={{
            label: `${remainingScopeDelta >= 0 ? '↑' : '↓'}${Math.abs(remainingScopeDelta)} vs previous sprint`,
            tone: remainingScopeDelta <= 0 ? 'green' : 'amber',
          }}
        />
        <KpiCard
          label="Tracked Sprints"
          value={sprintCount.toString()}
          animatedValue={sprintCount}
          subtext="Sprints returned for this milestone"
        />
      </section>

      <MilestoneProgressCard
        activeSprintId={selectedSprint}
        data={data.burnup}
        fullWidth
      />
    </div>
  )
}
