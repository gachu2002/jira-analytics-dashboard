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

export const MilestonePage = () => {
  const { data } = useDashboardQuery()

  if (!data) {
    return null
  }

  const sprintVelocity = data.burnup
    .map((item, index, list) => ({
      sprint: item.sprint,
      delta:
        index === 0
          ? item.completed
          : item.completed - list[index - 1].completed,
    }))
    .slice(1)

  return (
    <div className="space-y-4">
      <header>
        <h1 className="metric-value text-base text-[var(--text-primary)]">
          Milestone Progress
        </h1>
        <p className="mt-1 text-xs text-[var(--text-muted)]">
          Sprint burnup tracking - scope vs completion trajectory
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
          subtext="Expanded from 60 -> 80"
          delta={{ label: '↑20 from S6', tone: 'amber' }}
        />
        <KpiCard
          label="Sprints Remaining"
          value="1"
          animatedValue={1}
          subtext="27 pts behind ideal"
          delta={{ label: 'S10 final sprint', tone: 'red' }}
        />
        <KpiCard
          label="Sprint Avg Velocity"
          value="5.9 pts"
          animatedValue={59}
          formatter={(value) => `${(value / 10).toFixed(1)} pts`}
          subtext="Target: 8.0 pts/sprint"
          delta={{ label: 'Need 27 to close', tone: 'amber' }}
        />
      </section>

      <MilestoneProgressCard data={data.burnup} fullWidth />

      <section className="dashboard-card p-4">
        <p className="mb-3 text-[10px] tracking-[0.1em] text-[var(--text-muted)] uppercase">
          Sprint Velocity (pts added per sprint)
        </p>
        <div className="h-30">
          <ResponsiveContainer width="100%" height="100%">
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
                    <div className="rounded-[4px] border border-[var(--border)] bg-[var(--surface-elevated)] px-3 py-2">
                      <p className="metric-value text-[11px] text-[var(--text-secondary)]">
                        {String(label)}
                      </p>
                      <p className="metric-value text-sm text-[var(--accent-blue)]">
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
