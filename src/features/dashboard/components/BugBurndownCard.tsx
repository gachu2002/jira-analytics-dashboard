import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { ChartTooltip } from '@/components/common/ChartTooltip'
import { ChartLegendItem } from '@/features/dashboard/components/shared/ChartLegendItem'
import type { BurndownPoint } from '@/features/dashboard/types/dashboard.types'
import { getActiveSprint } from '@/features/dashboard/utils/sprint'

type BugBurndownCardProps = {
  activeSprintId?: number | null
  data: BurndownPoint[]
  showTable?: boolean
}

export const BugBurndownCard = ({
  activeSprintId,
  data,
  showTable = true,
}: BugBurndownCardProps) => {
  const currentPoint = getActiveSprint(data, activeSprintId)
  const sprintWindow =
    data.length > 0
      ? `${data[0]?.sprint} - ${data[data.length - 1]?.sprint}`
      : '--'
  const yMax = Math.max(
    10,
    ...data.flatMap((row) => [row.resolved, row.total, row.ideal]),
  )

  return (
    <section className="dashboard-card px-5 py-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-text-muted text-[10px] tracking-[0.1em] uppercase">
            Bug Fix Progress
          </p>
          <p className="text-text-primary mt-1 text-[13px]">{sprintWindow}</p>
        </div>
        <div className="flex items-center gap-4">
          <ChartLegendItem color="var(--chart-resolved)" label="Resolved" />
          <ChartLegendItem color="var(--chart-bugs)" label="Total Bugs" />
          <ChartLegendItem color="var(--status-warning)" dashed label="Ideal" />
        </div>
      </div>

      <div className="min-w-0" style={{ height: 220 }}>
        <ResponsiveContainer
          height="100%"
          minHeight={1}
          minWidth={0}
          width="100%"
        >
          <ComposedChart
            data={data}
            margin={{ left: 0, right: 60, top: 10, bottom: 0 }}
          >
            <defs>
              <linearGradient id="resolvedFill" x1="0" x2="0" y1="0" y2="1">
                <stop
                  offset="0%"
                  stopColor="var(--chart-resolved)"
                  stopOpacity={0.18}
                />
                <stop
                  offset="100%"
                  stopColor="var(--chart-resolved)"
                  stopOpacity={0.01}
                />
              </linearGradient>
            </defs>
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
              tickLine={false}
            />
            <YAxis
              domain={[0, Math.ceil(yMax / 10) * 10]}
              tick={{
                fill: 'var(--text-muted)',
                fontFamily: 'DM Mono',
                fontSize: 10,
              }}
              tickLine={false}
              width={32}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload || payload.length === 0) {
                  return null
                }

                const point = payload[0]?.payload as BurndownPoint

                return (
                  <ChartTooltip
                    sprintLabel={String(label ?? '')}
                    rows={[
                      {
                        label: 'Resolved',
                        value: point.resolved,
                        color: 'var(--chart-resolved)',
                      },
                      {
                        label: 'Total Bugs',
                        value: point.total,
                        color: 'var(--chart-bugs)',
                      },
                      {
                        label: 'Ideal',
                        value: point.ideal.toFixed(1),
                        color: 'var(--status-warning)',
                      },
                    ]}
                  />
                )
              }}
            />
            <Area
              activeDot={{ r: 4, fill: 'var(--chart-resolved)' }}
              animationBegin={0}
              animationDuration={1000}
              dataKey="resolved"
              dot={{
                r: 3,
                fill: 'var(--chart-resolved)',
                stroke: 'var(--surface)',
                strokeWidth: 1.5,
              }}
              fill="url(#resolvedFill)"
              stroke="var(--chart-resolved)"
              strokeWidth={2.5}
              type="linear"
            />
            <Line
              dataKey="total"
              dot={false}
              stroke="var(--chart-bugs)"
              strokeDasharray="10 3"
              strokeWidth={2}
              type="linear"
            />
            <Line
              dataKey="ideal"
              dot={false}
              stroke="var(--status-warning)"
              strokeDasharray="1 5"
              strokeWidth={1.5}
              type="linear"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {showTable ? (
        <div className="mt-4">
          <table className="w-full border-collapse text-[11px]">
            <thead>
              <tr className="border-border border-b">
                {['Sprint', 'Resolved', 'Total Bugs', 'Ideal'].map(
                  (header, index) => (
                    <th
                      className={`text-text-muted px-2 py-1 text-[10px] font-normal tracking-[0.08em] uppercase ${
                        index === 0 ? 'text-left' : 'text-right'
                      }`}
                      key={header}
                    >
                      {header}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {data.map((row) => {
                const active = row.sprintId === currentPoint?.sprintId

                return (
                  <tr
                    className="data-row"
                    key={row.sprint}
                    style={{
                      background: active
                        ? 'var(--row-active-bg)'
                        : 'transparent',
                      borderLeft: active
                        ? '2px solid var(--primary)'
                        : '2px solid transparent',
                    }}
                  >
                    <td
                      className={`metric-value px-2 py-1 text-left ${
                        active
                          ? 'text-text-primary font-medium'
                          : 'text-text-secondary'
                      }`}
                    >
                      {row.sprint}
                    </td>
                    <td
                      className={`metric-value px-2 py-1 text-right ${
                        active
                          ? 'text-text-primary font-medium'
                          : 'text-text-secondary'
                      }`}
                    >
                      {row.resolved}
                    </td>
                    <td
                      className={`metric-value px-2 py-1 text-right ${
                        active
                          ? 'text-text-primary font-medium'
                          : 'text-text-secondary'
                      }`}
                    >
                      {row.total}
                    </td>
                    <td
                      className={`metric-value px-2 py-1 text-right ${
                        active
                          ? 'text-text-primary font-medium'
                          : 'text-text-secondary'
                      }`}
                    >
                      {row.ideal.toFixed(1)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  )
}
