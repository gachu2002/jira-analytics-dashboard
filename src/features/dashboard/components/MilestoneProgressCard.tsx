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
import type { BurnupPoint } from '@/features/dashboard/types/dashboard.types'
import { getActiveSprint } from '@/features/dashboard/utils/sprint'

type MilestoneProgressCardProps = {
  activeSprintId?: number | null
  data: BurnupPoint[]
  fullWidth?: boolean
  showTable?: boolean
}

export const MilestoneProgressCard = ({
  activeSprintId,
  data,
  fullWidth = false,
  showTable = true,
}: MilestoneProgressCardProps) => {
  const highlightedSprintId = getActiveSprint(data, activeSprintId)?.sprintId
  const sprintWindow =
    data.length > 0
      ? `${data[0]?.sprint} - ${data[data.length - 1]?.sprint}`
      : '--'
  const yMax = Math.max(
    10,
    ...data.flatMap((row) => [row.completed, row.scope]),
  )

  return (
    <section className="dashboard-card px-5 py-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-text-muted text-[10px] tracking-[0.1em] uppercase">
            Milestone Burndown
          </p>
          <p className="text-text-primary mt-1 text-[13px]">{sprintWindow}</p>
        </div>
        <div className="flex items-center gap-4">
          <ChartLegendItem
            color="var(--chart-completed)"
            label="Completed"
            width={20}
          />
          <ChartLegendItem
            color="var(--chart-trend)"
            dashed
            label="Scope"
            width={20}
          />
          <ChartLegendItem
            color="var(--status-warning)"
            dashed
            label="Ideal"
            width={20}
          />
        </div>
      </div>

      <div className="min-w-0" style={{ height: fullWidth ? 280 : 220 }}>
        <ResponsiveContainer
          height="100%"
          minHeight={1}
          minWidth={0}
          width="100%"
        >
          <ComposedChart
            data={data}
            margin={{ top: 10, right: 20, bottom: 0, left: 0 }}
          >
            <defs>
              <linearGradient id="completedFill" x1="0" x2="0" y1="0" y2="1">
                <stop
                  offset="0%"
                  stopColor="var(--chart-completed)"
                  stopOpacity={0.12}
                />
                <stop
                  offset="100%"
                  stopColor="var(--chart-completed)"
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
                if (!active || !payload?.length) return null

                const completed = payload.find(
                  (entry) => entry.dataKey === 'completed',
                )?.value
                const scope = payload.find(
                  (entry) => entry.dataKey === 'scope',
                )?.value
                const ideal = payload.find(
                  (entry) => entry.dataKey === 'ideal',
                )?.value

                return (
                  <ChartTooltip
                    sprintLabel={String(label ?? '')}
                    rows={[
                      {
                        label: 'Completed',
                        value: `${completed ?? '-'} pts`,
                        color: 'var(--chart-completed)',
                      },
                      {
                        label: 'Scope',
                        value: `${scope ?? '-'} pts`,
                        color: 'var(--chart-trend)',
                      },
                      {
                        label: 'Ideal',
                        value: `${ideal ?? '-'} pts`,
                        color: 'var(--status-warning)',
                      },
                    ]}
                  />
                )
              }}
              cursor={{ stroke: 'var(--border)', strokeWidth: 1 }}
            />

            <Line
              animationBegin={100}
              animationDuration={800}
              dataKey="ideal"
              dot={false}
              stroke="var(--status-warning)"
              strokeDasharray="1 5"
              strokeLinecap="round"
              strokeWidth={1.5}
              type="linear"
            />
            <Line
              animationBegin={150}
              animationDuration={800}
              dataKey="scope"
              dot={false}
              stroke="var(--chart-trend)"
              strokeDasharray="10 4"
              strokeWidth={2.25}
              type="linear"
            />
            <Area
              activeDot={{ r: 4, fill: 'var(--chart-completed)' }}
              animationBegin={0}
              animationDuration={900}
              dataKey="completed"
              dot={{
                r: 3,
                fill: 'var(--chart-completed)',
                stroke: 'var(--surface)',
                strokeWidth: 1.5,
              }}
              fill="url(#completedFill)"
              stroke="var(--chart-completed)"
              strokeWidth={2}
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
                {['Sprint', 'Completed', 'Scope', 'Ideal'].map(
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
                const active = row.sprintId === highlightedSprintId

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
                      {row.completed}
                    </td>
                    <td
                      className={`metric-value px-2 py-1 text-right ${
                        active
                          ? 'text-text-primary font-medium'
                          : 'text-text-secondary'
                      }`}
                    >
                      {row.scope}
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
