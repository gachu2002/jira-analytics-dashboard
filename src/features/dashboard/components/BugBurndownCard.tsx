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

type BugBurndownCardProps = {
  data: BurndownPoint[]
}

const BehindLabel = ({ viewBox }: { viewBox?: { cx: number; cy: number } }) => {
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
        Behind target
      </text>
    </g>
  )
}

export const BugBurndownCard = ({ data }: BugBurndownCardProps) => {
  return (
    <section className="dashboard-card px-5 py-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-[10px] tracking-[0.1em] text-[var(--text-muted)] uppercase">
            Bug Burndown
          </p>
          <p className="mt-1 text-[13px] text-[var(--text-primary)]">
            Sprint 1 - Sprint 12
          </p>
        </div>
        <span className="rounded-[2px] border border-[rgba(245,166,35,0.25)] bg-[rgba(245,166,35,0.15)] px-2.5 py-1 text-[10px] text-[var(--accent-amber)]">
          21 bugs open
        </span>
      </div>

      <div style={{ height: 220 }}>
        <ResponsiveContainer height="100%" width="100%">
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
              <linearGradient id="idealFill" x1="0" x2="0" y1="0" y2="1">
                <stop
                  offset="0%"
                  stopColor="var(--chart-ideal)"
                  stopOpacity={0.05}
                />
                <stop
                  offset="100%"
                  stopColor="var(--chart-ideal)"
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
              domain={[0, 55]}
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
                      {
                        label: 'Ideal',
                        value: point.ideal,
                        color: 'var(--chart-ideal)',
                      },
                    ]}
                  />
                )
              }}
            />
            <Area
              animationBegin={100}
              animationDuration={900}
              dataKey="ideal"
              dot={false}
              fill="url(#idealFill)"
              stroke="var(--chart-ideal)"
              strokeDasharray="4 3"
              strokeWidth={1.5}
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
            <ReferenceDot r={0} x="S12" y={10}>
              <Label content={<BehindLabel />} />
            </ReferenceDot>
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 flex items-center gap-4">
        <ChartLegendItem color="var(--accent-red)" label="Remaining Bugs" />
        <ChartLegendItem
          color="var(--text-muted)"
          dashed
          label="Ideal Burndown"
        />
      </div>
    </section>
  )
}
