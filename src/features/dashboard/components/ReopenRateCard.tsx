import {
  Bar,
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
import type { ReopenRatePoint } from '@/features/dashboard/types/dashboard.types'
import { getActiveSprint } from '@/features/dashboard/utils/sprint'

type ReopenRateCardProps = {
  activeSprintId?: number | null
  data: ReopenRatePoint[]
  fullWidth?: boolean
  showTable?: boolean
}

const ColoredDot = ({
  cx,
  cy,
  payload,
}: {
  cx?: number
  cy?: number
  payload?: ReopenRatePoint
}) => {
  if (typeof cx !== 'number' || typeof cy !== 'number' || !payload) {
    return null
  }

  const color =
    payload.rate <= payload.target
      ? 'var(--status-success)'
      : 'var(--status-danger)'
  return (
    <circle
      cx={cx}
      cy={cy}
      fill={color}
      r={3.5}
      stroke="var(--surface)"
      strokeWidth={1.5}
    />
  )
}

export const ReopenRateCard = ({
  activeSprintId,
  data,
  fullWidth = false,
  showTable = true,
}: ReopenRateCardProps) => {
  const current = getActiveSprint(data, activeSprintId)
  const currentTarget = current?.target ?? 0
  const sprintWindow =
    data.length > 0
      ? `${data[0]?.sprint} - ${data[data.length - 1]?.sprint}`
      : '--'
  const yMax = Math.max(
    currentTarget,
    ...data.flatMap((row) => [row.rate, row.target]),
    0.06,
  )
  const countMax = Math.max(
    10,
    ...data.flatMap((row) => [row.resolved, row.reopened]),
  )

  return (
    <section className="dashboard-card px-5 py-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-text-muted text-[10px] tracking-[0.1em] uppercase">
            Reopened Rate
          </p>
          <p className="text-text-primary mt-1 text-[13px]">{sprintWindow}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 rounded-[1px] opacity-70"
              style={{ background: 'var(--status-info)' }}
            />
            <span className="text-text-secondary text-[11px]">Resolved</span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 rounded-[1px] opacity-70"
              style={{ background: 'var(--status-warning)' }}
            />
            <span className="text-text-secondary text-[11px]">Reopened</span>
          </div>
          <ChartLegendItem color="var(--text-secondary)" label="Rate" />
          <ChartLegendItem
            color="var(--status-success)"
            dashed
            label="Target"
          />
        </div>
      </div>

      <div className="min-w-0" style={{ height: fullWidth ? 260 : 220 }}>
        <ResponsiveContainer
          height="100%"
          minHeight={1}
          minWidth={0}
          width="100%"
        >
          <ComposedChart
            barCategoryGap="14%"
            barGap={0}
            data={data}
            margin={{ top: 10, right: 48, bottom: 0, left: 0 }}
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
              tickLine={false}
            />
            <YAxis
              yAxisId="left"
              domain={[0, Math.ceil(countMax / 10) * 10]}
              tick={{
                fill: 'var(--text-muted)',
                fontFamily: 'DM Mono',
                fontSize: 10,
              }}
              tickLine={false}
              width={32}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              domain={[0, Number((Math.ceil(yMax * 100) / 100).toFixed(2))]}
              tick={{
                fill: 'var(--text-muted)',
                fontFamily: 'DM Mono',
                fontSize: 10,
              }}
              tickFormatter={(value) => `${Math.round(value * 100)}%`}
              tickLine={false}
              width={36}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) {
                  return null
                }

                const point = payload[0]?.payload as ReopenRatePoint

                return (
                  <ChartTooltip
                    sprintLabel={String(label ?? '')}
                    rows={[
                      {
                        label: 'Resolved',
                        value: point.resolved,
                        color: 'var(--status-info)',
                      },
                      {
                        label: 'Reopened',
                        value: point.reopened,
                        color: 'var(--status-warning)',
                      },
                      {
                        label: 'Reopened Rate',
                        value: `${(point.rate * 100).toFixed(1)}%`,
                        color: 'var(--text-secondary)',
                      },
                      {
                        label: 'Target',
                        value: `${(point.target * 100).toFixed(1)}%`,
                        color: 'var(--status-success)',
                      },
                    ]}
                  />
                )
              }}
              cursor={{ stroke: 'var(--border)', strokeWidth: 1 }}
            />

            <Bar
              yAxisId="left"
              barSize={16}
              dataKey="resolved"
              fill="var(--status-info)"
              fillOpacity={0.7}
              radius={[2, 2, 0, 0]}
            />
            <Bar
              yAxisId="left"
              barSize={16}
              dataKey="reopened"
              fill="var(--status-warning)"
              fillOpacity={0.75}
              radius={[2, 2, 0, 0]}
            />

            <Line
              yAxisId="right"
              animationDuration={900}
              dataKey="rate"
              dot={<ColoredDot />}
              stroke="var(--text-secondary)"
              strokeWidth={1.5}
              type="linear"
            />
            <Line
              yAxisId="right"
              animationDuration={900}
              dataKey="target"
              dot={false}
              stroke="var(--status-success)"
              strokeDasharray="4 3"
              strokeWidth={1.5}
              type="linear"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {showTable ? (
        <div className="mt-3">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="border-border border-b">
                {['Sprint', 'Target', 'Rate', 'Resolved', 'Reopened'].map(
                  (header, index) => (
                    <th
                      className={`text-text-muted px-1.5 py-1 text-[10px] font-normal tracking-[0.08em] uppercase ${index === 0 ? 'text-left' : 'text-right'}`}
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
                const isActive = row.sprintId === current?.sprintId
                const aboveTarget = row.rate > row.target

                return (
                  <tr
                    className="data-row h-9"
                    key={row.sprint}
                    style={{
                      background: isActive
                        ? 'var(--row-active-bg)'
                        : 'transparent',
                      borderLeft: isActive
                        ? '2px solid var(--primary)'
                        : '2px solid transparent',
                    }}
                  >
                    <td
                      className={`metric-value px-1.5 ${isActive ? 'text-text-primary font-medium' : 'text-text-secondary'}`}
                    >
                      {row.sprint}
                    </td>
                    <td className="metric-value text-text-muted px-1.5 text-right">
                      {(row.target * 100).toFixed(1)}%
                    </td>
                    <td className="px-1.5 text-right">
                      <span
                        className="metric-value rounded-[2px] px-1.5 py-0.5 text-[10px]"
                        style={{
                          background: aboveTarget
                            ? 'var(--status-danger-soft)'
                            : 'var(--status-success-soft)',
                          color: aboveTarget
                            ? 'var(--status-danger)'
                            : 'var(--status-success)',
                        }}
                      >
                        {(row.rate * 100).toFixed(1)}%
                      </span>
                    </td>
                    <td className="metric-value text-text-secondary px-1.5 text-right">
                      {row.resolved}
                    </td>
                    <td
                      className={`metric-value px-1.5 text-right ${row.reopened > 0 ? 'text-warning' : 'text-text-muted'}`}
                    >
                      {row.reopened}
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
