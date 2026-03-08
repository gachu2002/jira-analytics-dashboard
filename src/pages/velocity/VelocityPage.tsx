import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { KpiCard } from '@/components/common/KpiCard'
import {
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableHeader,
  DataTableHeaderCell,
  DataTableRow,
} from '@/components/common/DataTable/DataTable'
import { BugVelocityCard } from '@/features/dashboard/components/BugVelocityCard'
import { useDashboardQuery } from '@/features/dashboard/api/dashboard.api'
import { useDashboardFilters } from '@/features/dashboard/hooks/useDashboardFilters'

export const VelocityPage = () => {
  const { data } = useDashboardQuery()
  const { selectedSprintLabel } = useDashboardFilters()

  if (!data) {
    return null
  }

  if (data.velocity.length === 0) {
    return (
      <div className="dashboard-card text-text-muted p-4 text-sm">
        No sprint velocity data is available for this milestone.
      </div>
    )
  }

  const current =
    data.velocity.find((item) => item.sprint === selectedSprintLabel) ??
    data.velocity[data.velocity.length - 1]
  const peak = data.velocity.reduce(
    (max, item) => (item.rate > max.rate ? item : max),
    data.velocity[0],
  )
  const belowTarget = data.velocity.filter(
    (item) => item.rate < item.target,
  ).length

  const movingAverage = data.velocity.map((item, index, list) => {
    const slice = list.slice(Math.max(0, index - 2), index + 1)
    const average = slice.reduce((sum, row) => sum + row.rate, 0) / slice.length

    return {
      sprint: item.sprint,
      ma: Number(average.toFixed(3)),
    }
  })
  const currentMovingAverage = movingAverage[movingAverage.length - 1]?.ma ?? 0
  const previousMovingAverage = movingAverage[movingAverage.length - 2]?.ma
  const movingAverageDelta =
    previousMovingAverage === undefined
      ? 0
      : Number((currentMovingAverage - previousMovingAverage).toFixed(2))

  return (
    <div className="space-y-4">
      <header>
        <h1 className="metric-value text-text-primary text-base">
          Bug Fixing Velocity
        </h1>
        <p className="text-text-muted mt-1 text-xs">
          New vs resolved bugs - fix rate trend with target threshold
        </p>
      </header>

      <section className="grid grid-cols-1 gap-3 min-[1024px]:grid-cols-2 min-[1440px]:grid-cols-4">
        <KpiCard
          label="Current Fix Rate"
          value={current.rate.toFixed(2)}
          animatedValue={Math.round(current.rate * 100)}
          formatter={(value) => (value / 100).toFixed(2)}
          subtext={`${current.sprint} - ${current.resolvedBugs} resolved / ${current.newBugs} new`}
          delta={{
            label: `Target: ${current.target.toFixed(2)}`,
            tone: current.rate >= current.target ? 'green' : 'red',
          }}
        />
        <KpiCard
          label="3-Sprint MA"
          value={currentMovingAverage.toFixed(2)}
          animatedValue={Math.round(currentMovingAverage * 100)}
          formatter={(value) => (value / 100).toFixed(2)}
          subtext="Recent 3-sprint moving average"
          delta={{
            label:
              movingAverageDelta === 0
                ? 'Stable vs previous'
                : `${movingAverageDelta > 0 ? '+' : ''}${movingAverageDelta.toFixed(2)} vs previous`,
            tone:
              movingAverageDelta > 0
                ? 'green'
                : movingAverageDelta < 0
                  ? 'red'
                  : 'amber',
          }}
        />
        <KpiCard
          label="Season Peak"
          value={peak.rate.toFixed(2)}
          animatedValue={Math.round(peak.rate * 100)}
          formatter={(value) => (value / 100).toFixed(2)}
          subtext="Best single-sprint rate"
          delta={{ label: peak.sprint, tone: 'green' }}
        />
        <KpiCard
          label="Below Target"
          value={belowTarget.toString()}
          animatedValue={belowTarget}
          subtext={`${belowTarget} of ${data.velocity.length} sprints below target`}
          delta={{
            label: `${Math.round((belowTarget / data.velocity.length) * 100)}% of sprints`,
            tone: 'red',
          }}
        />
      </section>

      <BugVelocityCard
        activeSprint={selectedSprintLabel}
        data={data.velocity}
      />

      <section className="dashboard-card p-4">
        <p className="text-text-muted mb-3 text-[10px] tracking-[0.1em] uppercase">
          3-Sprint Moving Average - Fix Rate
        </p>
        <div className="h-[120px] min-w-0">
          <ResponsiveContainer
            minHeight={1}
            minWidth={0}
            width="100%"
            height="100%"
          >
            <LineChart
              data={movingAverage}
              margin={{ top: 4, right: 24, bottom: 0, left: 0 }}
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
                domain={[0, 2]}
                tick={{
                  fill: 'var(--text-muted)',
                  fontFamily: 'DM Mono',
                  fontSize: 10,
                }}
                tickFormatter={(value) => value.toFixed(1)}
                width={32}
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
                      <p className="metric-value text-accent-purple text-sm">
                        MA3: {Number(payload[0]?.value).toFixed(2)}
                      </p>
                    </div>
                  )
                }}
              />
              <ReferenceLine
                y={current.target}
                stroke="var(--accent-amber)"
                strokeDasharray="4 3"
              />
              <Line
                dataKey="ma"
                stroke="var(--accent-purple)"
                strokeWidth={2}
                dot={{
                  r: 3,
                  fill: 'var(--accent-purple)',
                  stroke: 'var(--surface)',
                  strokeWidth: 1.5,
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="dashboard-card p-4">
        <p className="text-text-muted mb-3 text-[10px] tracking-[0.1em] uppercase">
          Sprint Detail
        </p>
        <DataTable>
          <DataTableHeader>
            <tr>
              <DataTableHeaderCell>Sprint</DataTableHeaderCell>
              <DataTableHeaderCell>New Bugs</DataTableHeaderCell>
              <DataTableHeaderCell>Resolved</DataTableHeaderCell>
              <DataTableHeaderCell>Fix Rate</DataTableHeaderCell>
              <DataTableHeaderCell>vs Target</DataTableHeaderCell>
            </tr>
          </DataTableHeader>
          <DataTableBody>
            {data.velocity.map((row) => {
              const aboveTarget = row.rate >= row.target

              return (
                <DataTableRow
                  active={row.sprint === selectedSprintLabel}
                  key={row.sprint}
                >
                  <DataTableCell>{row.sprint}</DataTableCell>
                  <DataTableCell numeric>{row.newBugs}</DataTableCell>
                  <DataTableCell numeric>{row.resolvedBugs}</DataTableCell>
                  <DataTableCell numeric>
                    <span
                      className="metric-value rounded-[2px] px-1.5 py-0.5 text-[10px]"
                      style={{
                        background: aboveTarget
                          ? 'rgba(61,214,140,0.12)'
                          : 'rgba(247,92,92,0.12)',
                        color: aboveTarget
                          ? 'var(--accent-green)'
                          : 'var(--accent-red)',
                      }}
                    >
                      {row.rate.toFixed(2)}
                    </span>
                  </DataTableCell>
                  <DataTableCell numeric>
                    <span
                      className={`metric-value ${aboveTarget ? 'text-accent-green' : 'text-accent-red'}`}
                    >
                      {(row.rate - row.target).toFixed(2)}
                    </span>
                  </DataTableCell>
                </DataTableRow>
              )
            })}
          </DataTableBody>
        </DataTable>
      </section>
    </div>
  )
}
