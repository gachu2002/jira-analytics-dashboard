import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { KpiCard } from '@/components/common/KpiCard'
import { MilestoneProgressCard } from '@/features/dashboard/components/MilestoneProgressCard'
import { useDashboardQuery } from '@/features/dashboard/api/dashboard.api'
import { useDashboardFilters } from '@/features/dashboard/hooks/useDashboardFilters'

export const MilestonePage = () => {
  const { data } = useDashboardQuery()
  const { selectedSprintLabel } = useDashboardFilters()

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
    data.burnup.find((item) => item.sprint === selectedSprintLabel) ??
    data.burnup[data.burnup.length - 1] ??
    ({ sprint: 'S0', completed: 0, ideal: 0, scope: 0 } as const)
  const currentIndex = data.burnup.findIndex(
    (item) => item.sprint === current.sprint,
  )
  const previous = data.burnup[currentIndex - 1]
  const sprintCount = data.burnup.length
  const scopeDelta = current.scope - (previous?.scope ?? current.scope)
  const idealGap = current.completed - current.ideal

  const sprintVelocity = data.burnup.map((item, index, list) => ({
    sprint: item.sprint,
    delta:
      index === 0 ? item.completed : item.completed - list[index - 1].completed,
  }))
  const averageVelocity =
    sprintVelocity.length === 0
      ? 0
      : sprintVelocity.reduce((sum, item) => sum + item.delta, 0) /
        sprintVelocity.length

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
          value={data.milestoneProgress.completed.toString()}
          animatedValue={data.milestoneProgress.completed}
          subtext={`${data.milestoneProgress.completionPercent.toFixed(1)}% complete`}
          delta={{
            label: `of ${data.milestoneProgress.total} pts scope`,
            tone: 'blue',
          }}
          progress={{
            value: data.milestoneProgress.completed,
            max: data.milestoneProgress.total,
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
          label="Tracked Sprints"
          value={sprintCount.toString()}
          animatedValue={sprintCount}
          subtext={`${Math.abs(idealGap)} pts ${idealGap >= 0 ? 'ahead of' : 'behind'} ideal`}
          delta={{
            label: `Current: ${current.sprint}`,
            tone: idealGap >= 0 ? 'green' : 'red',
          }}
        />
        <KpiCard
          label="Sprint Avg Velocity"
          value={`${averageVelocity.toFixed(1)} pts`}
          animatedValue={Math.round(averageVelocity * 10)}
          formatter={(value) => `${(value / 10).toFixed(1)} pts`}
          subtext="Average completed points per sprint"
          delta={{ label: `Ideal now: ${current.ideal} pts`, tone: 'amber' }}
        />
      </section>

      <MilestoneProgressCard
        activeSprint={selectedSprintLabel}
        data={data.burnup}
        fullWidth
      />

      <section className="dashboard-card p-4">
        <p className="text-text-muted mb-3 text-[10px] tracking-[0.1em] uppercase">
          Sprint Velocity (pts added per sprint)
        </p>
        <div className="h-[120px] min-w-0">
          <ResponsiveContainer
            minHeight={1}
            minWidth={0}
            width="100%"
            height="100%"
          >
            <BarChart
              data={sprintVelocity}
              margin={{ top: 4, right: 8, bottom: 0, left: 0 }}
            >
              <CartesianGrid
                stroke="var(--border)"
                strokeDasharray="2 4"
                vertical={false}
              />
              <XAxis
                dataKey="sprint"
                tick={{
                  fill: 'var(--text-muted)',
                  fontFamily: 'DM Mono',
                  fontSize: 10,
                }}
              />
              <YAxis
                width={28}
                tick={{
                  fill: 'var(--text-muted)',
                  fontFamily: 'DM Mono',
                  fontSize: 10,
                }}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload || payload.length === 0) {
                    return null
                  }

                  return (
                    <div className="border-border bg-surface-elevated rounded-[4px] border px-3 py-2">
                      <p className="metric-value text-text-secondary text-[11px]">
                        {String(label)}
                      </p>
                      <p className="metric-value text-accent-blue text-sm">
                        +{payload[0]?.value} pts
                      </p>
                    </div>
                  )
                }}
              />
              <Bar
                dataKey="delta"
                fill="var(--accent-blue)"
                fillOpacity={0.7}
                maxBarSize={28}
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  )
}
