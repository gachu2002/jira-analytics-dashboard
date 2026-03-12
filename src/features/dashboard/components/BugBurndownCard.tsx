import {
  Area,
  CartesianGrid,
  Label,
  ComposedChart,
  ReferenceDot,
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
}

const CurrentLabel = ({
  viewBox,
}: {
  viewBox?: { cx: number; cy: number }
}) => {
  if (!viewBox) {
    return null
  }

  return (
    <g>
      <circle cx={viewBox.cx} cy={viewBox.cy} fill="var(--chart-bugs)" r={5} />
      <text
        fill="var(--chart-bugs)"
        fontSize={9}
        x={viewBox.cx + 8}
        y={viewBox.cy + 4}
      >
        Current
      </text>
    </g>
  )
}

export const BugBurndownCard = ({
  activeSprintId,
  data,
}: BugBurndownCardProps) => {
  const currentPoint = getActiveSprint(data, activeSprintId)
  const sprintWindow =
    data.length > 0
      ? `${data[0]?.sprint} - ${data[data.length - 1]?.sprint}`
      : '--'
  const yMax = Math.max(10, ...data.map((row) => row.remaining))

  return (
    <section className="dashboard-card px-5 py-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-text-muted text-[10px] tracking-[0.1em] uppercase">
            Bug Burndown
          </p>
          <p className="text-text-primary mt-1 text-[13px]">{sprintWindow}</p>
        </div>
        <span className="status-chip status-chip-warning px-2.5 py-1">
          {currentPoint?.remaining ?? 0} bugs open
        </span>
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
              <linearGradient id="remainingFill" x1="0" x2="0" y1="0" y2="1">
                <stop
                  offset="0%"
                  stopColor="var(--chart-bugs)"
                  stopOpacity={0.09}
                />
                <stop
                  offset="100%"
                  stopColor="var(--chart-bugs)"
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
                        label: 'Remaining',
                        value: point.remaining,
                        color: 'var(--chart-bugs)',
                      },
                    ]}
                  />
                )
              }}
            />
            <Area
              activeDot={{ r: 4, fill: 'var(--chart-bugs)' }}
              animationBegin={0}
              animationDuration={1000}
              dataKey="remaining"
              dot={{
                r: 3,
                fill: 'var(--chart-bugs)',
                stroke: 'var(--surface)',
                strokeWidth: 1.5,
              }}
              fill="url(#remainingFill)"
              stroke="var(--chart-bugs)"
              strokeWidth={2}
            />
            {currentPoint ? (
              <ReferenceDot
                fill="var(--chart-bugs)"
                r={0}
                x={currentPoint.sprint}
                y={currentPoint.remaining}
              >
                <Label content={<CurrentLabel />} />
              </ReferenceDot>
            ) : null}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 flex items-center gap-4">
        <ChartLegendItem color="var(--chart-bugs)" label="Remaining Bugs" />
      </div>
    </section>
  )
}
