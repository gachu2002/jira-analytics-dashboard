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

export const VelocityPage = () => {
  const { data } = useDashboardQuery()

  if (!data) {
    return null
  }

  const movingAverage = data.velocity.map((item, index, list) => {
    const slice = list.slice(Math.max(0, index - 2), index + 1)
    const average = slice.reduce((sum, row) => sum + row.rate, 0) / slice.length

    return {
      sprint: item.sprint,
      ma: Number(average.toFixed(3)),
    }
  })

  return (
    <div className="space-y-4">
      <header>
        <h1 className="metric-value text-base text-[var(--text-primary)]">
          Bug Fixing Velocity
        </h1>
        <p className="mt-1 text-xs text-[var(--text-muted)]">
          New vs resolved bugs - fix rate trend with target threshold
        </p>
      </header>

      <section className="grid grid-cols-1 gap-3 min-[1024px]:grid-cols-2 min-[1440px]:grid-cols-4">
        <KpiCard
          label="Current Fix Rate"
          value="0.82"
          animatedValue={82}
          formatter={(value) => (value / 100).toFixed(2)}
          subtext="Sprint 10 - 84 resolved / 102 new"
          delta={{ label: 'Target: 0.90', tone: 'red' }}
        />
        <KpiCard
          label="3-Sprint MA"
          value="0.76"
          animatedValue={76}
          formatter={(value) => (value / 100).toFixed(2)}
          subtext="S8-S10 moving average"
          delta={{ label: 'Trending flat', tone: 'amber' }}
        />
        <KpiCard
          label="Season Peak"
          value="1.25"
          animatedValue={125}
          formatter={(value) => (value / 100).toFixed(2)}
          subtext="Best single-sprint rate"
          delta={{ label: 'Sprint S2', tone: 'green' }}
        />
        <KpiCard
          label="Below Target"
          value="8"
          animatedValue={8}
          subtext="8 of 12 sprints < 0.90"
          delta={{ label: '66% of sprints', tone: 'red' }}
        />
      </section>

      <BugVelocityCard data={data.velocity} />

      <section className="dashboard-card p-4">
        <p className="mb-3 text-[10px] tracking-[0.1em] text-[var(--text-muted)] uppercase">
          3-Sprint Moving Average - Fix Rate
        </p>
        <div className="h-30">
          <ResponsiveContainer width="100%" height="100%">
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
                    <div className="rounded-[4px] border border-[var(--border)] bg-[var(--surface-elevated)] px-3 py-2">
                      <p className="metric-value text-[11px] text-[var(--text-secondary)]">
                        {String(label)}
                      </p>
                      <p className="metric-value text-sm text-[var(--accent-purple)]">
                        MA3: {Number(payload[0]?.value).toFixed(2)}
                      </p>
                    </div>
                  )
                }}
              />
              <ReferenceLine
                y={0.9}
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
        <p className="mb-3 text-[10px] tracking-[0.1em] text-[var(--text-muted)] uppercase">
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
              const aboveTarget = row.rate >= 0.9

              return (
                <DataTableRow active={row.sprint === 'S10'} key={row.sprint}>
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
                      className={`metric-value ${aboveTarget ? 'text-[var(--accent-green)]' : 'text-[var(--accent-red)]'}`}
                    >
                      {(row.rate - 0.9).toFixed(2)}
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
