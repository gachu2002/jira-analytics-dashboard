import {
  CartesianGrid,
  Line,
  LineChart,
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
import { getActiveSprint } from '@/features/dashboard/utils/sprint'

export const VelocityPage = () => {
  const { data } = useDashboardQuery()
  const { selectedSprint } = useDashboardFilters()

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

  const current = getActiveSprint(data.velocity, selectedSprint)
  const currentDelta = current.resolvedBugs - current.newBugs
  const fixRateSeries = data.velocity.map((item) => ({
    sprint: item.sprint,
    rate: item.rate,
  }))

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
          label="Resolved Bugs"
          value={current.resolvedBugs.toString()}
          animatedValue={current.resolvedBugs}
          subtext={`${current.sprint} resolved bug count`}
        />
        <KpiCard
          label="New Bugs"
          value={current.newBugs.toString()}
          animatedValue={current.newBugs}
          subtext={`${current.sprint} newly reported bugs`}
        />
        <KpiCard
          label="Net Bug Change"
          value={`${currentDelta >= 0 ? '+' : ''}${currentDelta}`}
          animatedValue={Math.abs(currentDelta)}
          formatter={() => `${currentDelta >= 0 ? '+' : ''}${currentDelta}`}
          subtext="Resolved bugs minus new bugs for the active sprint"
          delta={{
            label: `Target: ${current.target.toFixed(2)}`,
            tone: current.rate >= current.target ? 'green' : 'amber',
          }}
        />
      </section>

      <BugVelocityCard activeSprintId={selectedSprint} data={data.velocity} />

      <section className="dashboard-card p-4">
        <p className="text-text-muted mb-3 text-[10px] tracking-[0.1em] uppercase">
          Fix Rate by Sprint
        </p>
        <div className="h-[120px] min-w-0">
          <ResponsiveContainer
            minHeight={1}
            minWidth={0}
            width="100%"
            height="100%"
          >
            <LineChart
              data={fixRateSeries}
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
                      <p className="metric-value text-chart-trend text-sm">
                        Rate: {Number(payload[0]?.value).toFixed(2)}
                      </p>
                    </div>
                  )
                }}
              />
              <Line
                dataKey="rate"
                stroke="var(--chart-trend)"
                strokeWidth={2}
                type="linear"
                dot={{
                  r: 3,
                  fill: 'var(--chart-trend)',
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
              <DataTableHeaderCell numeric>New Bugs</DataTableHeaderCell>
              <DataTableHeaderCell numeric>Resolved</DataTableHeaderCell>
              <DataTableHeaderCell numeric>Fix Rate</DataTableHeaderCell>
              <DataTableHeaderCell numeric>vs Target</DataTableHeaderCell>
            </tr>
          </DataTableHeader>
          <DataTableBody>
            {data.velocity.map((row) => {
              const aboveTarget = row.rate >= row.target

              return (
                <DataTableRow
                  active={row.sprintId === current?.sprintId}
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
                          ? 'var(--status-success-soft)'
                          : 'var(--status-danger-soft)',
                        color: aboveTarget
                          ? 'var(--status-success)'
                          : 'var(--status-danger)',
                      }}
                    >
                      {row.rate.toFixed(2)}
                    </span>
                  </DataTableCell>
                  <DataTableCell numeric>
                    <span
                      className={`metric-value ${aboveTarget ? 'text-success' : 'text-danger'}`}
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
