import {
  Area,
  CartesianGrid,
  ComposedChart,
  Label,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { ChartTooltip } from '@/components/common/ChartTooltip'
import { ChartLegendItem } from '@/features/dashboard/components/shared/ChartLegendItem'
import type { BurnupPoint } from '@/features/dashboard/types/dashboard.types'

type MilestoneProgressCardProps = {
  data: BurnupPoint[]
  fullWidth?: boolean
}

const ScopeLabel = ({ viewBox }: { viewBox?: { x: number; y: number } }) => {
  if (!viewBox) return null
  return (
    <g>
      <line
        stroke="var(--accent-amber)"
        strokeDasharray="3 3"
        strokeOpacity={0.5}
        strokeWidth={1}
        x1={viewBox.x}
        x2={viewBox.x}
        y1={viewBox.y}
        y2={viewBox.y + 200}
      />
      <text
        fill="var(--accent-amber)"
        fontFamily="DM Mono"
        fontSize={9}
        x={viewBox.x + 4}
        y={viewBox.y + 14}
      >
        Scope ↑80
      </text>
    </g>
  )
}

export const MilestoneProgressCard = ({
  data,
  fullWidth = false,
}: MilestoneProgressCardProps) => {
  const currentSprint = data[data.length - 2]?.sprint

  return (
    <section className="dashboard-card px-5 py-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-[10px] tracking-[0.1em] text-[var(--text-muted)] uppercase">
            Milestone Burnup
          </p>
          <p className="mt-1 text-[13px] text-[var(--text-primary)]">
            Sprint 1 - Sprint 10
          </p>
        </div>
        <div className="flex items-center gap-4">
          <ChartLegendItem
            color="var(--accent-blue)"
            label="Completed"
            width={20}
          />
          <ChartLegendItem
            color="var(--text-muted)"
            dashed
            label="Ideal"
            width={20}
          />
          <ChartLegendItem
            color="var(--accent-amber)"
            dashed
            label="Scope"
            width={20}
          />
        </div>
      </div>

      <div style={{ height: fullWidth ? 280 : 220 }}>
        <ResponsiveContainer height="100%" width="100%">
          <ComposedChart
            data={data}
            margin={{ top: 10, right: 20, bottom: 0, left: 0 }}
          >
            <defs>
              <linearGradient id="completedFill" x1="0" x2="0" y1="0" y2="1">
                <stop
                  offset="0%"
                  stopColor="var(--accent-blue)"
                  stopOpacity={0.12}
                />
                <stop
                  offset="100%"
                  stopColor="var(--accent-blue)"
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
              domain={[0, 90]}
              tick={{
                fill: 'var(--text-muted)',
                fontFamily: 'DM Mono',
                fontSize: 10,
              }}
              tickLine={false}
              ticks={[0, 25, 50, 75, 90]}
              width={32}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null

                const completed = payload.find(
                  (entry) => entry.dataKey === 'completed',
                )?.value
                const ideal = payload.find(
                  (entry) => entry.dataKey === 'ideal',
                )?.value
                const scope = payload.find(
                  (entry) => entry.dataKey === 'scope',
                )?.value

                return (
                  <ChartTooltip
                    sprintLabel={String(label ?? '')}
                    rows={[
                      {
                        label: 'Completed',
                        value: `${completed ?? '-'} pts`,
                        color: 'var(--accent-blue)',
                      },
                      {
                        label: 'Ideal',
                        value: `${ideal ?? '-'} pts`,
                        color: 'var(--text-muted)',
                      },
                      {
                        label: 'Scope',
                        value: `${scope ?? '-'} pts`,
                        color: 'var(--accent-amber)',
                      },
                    ]}
                  />
                )
              }}
              cursor={{ stroke: 'var(--border)', strokeWidth: 1 }}
            />

            <ReferenceLine stroke="transparent" x="S6">
              <Label content={<ScopeLabel />} />
            </ReferenceLine>

            <Line
              animationBegin={100}
              animationDuration={800}
              dataKey="ideal"
              dot={false}
              stroke="var(--text-muted)"
              strokeDasharray="4 3"
              strokeWidth={1.5}
              type="monotone"
            />
            <Line
              animationBegin={200}
              animationDuration={800}
              dataKey="scope"
              dot={false}
              stroke="var(--accent-amber)"
              strokeDasharray="3 3"
              strokeWidth={1}
              type="stepAfter"
            />
            <Area
              activeDot={{ r: 4, fill: 'var(--accent-blue)' }}
              animationBegin={0}
              animationDuration={900}
              dataKey="completed"
              dot={{
                r: 3,
                fill: 'var(--accent-blue)',
                stroke: 'var(--surface)',
                strokeWidth: 1.5,
              }}
              fill="url(#completedFill)"
              stroke="var(--accent-blue)"
              strokeWidth={2}
              type="monotone"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4">
        <table className="w-full border-collapse text-[11px]">
          <thead>
            <tr className="border-b border-[var(--border)]">
              {['Sprint', 'Completed', 'vs Ideal'].map((header, index) => (
                <th
                  className={`px-2 py-1 text-[10px] font-normal tracking-[0.08em] text-[var(--text-muted)] uppercase ${
                    index === 0 ? 'text-left' : 'text-right'
                  }`}
                  key={header}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row) => {
              const delta = row.completed - row.ideal
              const active = row.sprint === currentSprint

              return (
                <tr
                  className="data-row"
                  key={row.sprint}
                  style={{
                    background: active ? 'var(--row-active-bg)' : 'transparent',
                    borderLeft: active
                      ? '2px solid var(--accent-blue)'
                      : '2px solid transparent',
                  }}
                >
                  <td
                    className={`metric-value px-2 py-1 text-left ${
                      active
                        ? 'font-medium text-[var(--text-primary)]'
                        : 'text-[var(--text-secondary)]'
                    }`}
                  >
                    {row.sprint}
                  </td>
                  <td
                    className={`metric-value px-2 py-1 text-right ${
                      active
                        ? 'font-medium text-[var(--text-primary)]'
                        : 'text-[var(--text-secondary)]'
                    }`}
                  >
                    {row.completed}
                  </td>
                  <td
                    className={`metric-value px-2 py-1 text-right ${
                      delta >= 0
                        ? 'text-[var(--accent-green)]'
                        : 'text-[var(--accent-red)]'
                    }`}
                  >
                    {delta >= 0 ? `+${delta}` : delta}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}
