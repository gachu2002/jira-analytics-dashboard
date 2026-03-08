import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { ChartTooltip } from '@/components/common/ChartTooltip'
import { ChartLegendItem } from '@/features/dashboard/components/shared/ChartLegendItem'
import type { VelocityPoint } from '@/features/dashboard/types/dashboard.types'

type BugVelocityCardProps = {
  activeSprint?: string
  data: VelocityPoint[]
}

const DiamondDot = ({
  cx,
  cy,
  payload,
}: {
  cx?: number
  cy?: number
  payload?: VelocityPoint
}) => {
  if (typeof cx !== 'number' || typeof cy !== 'number' || !payload) return null

  const color =
    payload.rate >= payload.target ? 'var(--accent-green)' : 'var(--accent-red)'
  const size = 5

  return (
    <polygon
      fill={color}
      points={`${cx},${cy - size} ${cx + size},${cy} ${cx},${cy + size} ${cx - size},${cy}`}
      stroke="var(--surface)"
      strokeWidth={1}
    />
  )
}

export const BugVelocityCard = ({
  activeSprint,
  data,
}: BugVelocityCardProps) => {
  const current =
    data.find((item) => item.sprint === activeSprint) ?? data[data.length - 1]
  const rates = data.map((item) => item.rate)
  const averageRate =
    rates.reduce((sum, value) => sum + value, 0) / rates.length
  const bestSprint = data.reduce(
    (best, current) => (current.rate > best.rate ? current : best),
    data[0],
  )
  const worstSprint = data.reduce(
    (worst, current) => (current.rate < worst.rate ? current : worst),
    data[0],
  )
  const belowTargetCount = data.filter((item) => item.rate < item.target).length
  const sprintWindow = `${data[0]?.sprint} - ${data[data.length - 1]?.sprint}`
  const countMax = Math.max(
    10,
    ...data.flatMap((item) => [item.newBugs, item.resolvedBugs]),
  )
  const rateMax = Math.max(
    1,
    ...data.flatMap((item) => [item.rate, item.target]),
  )

  return (
    <section className="dashboard-card px-5 py-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-text-muted text-[10px] tracking-[0.1em] uppercase">
            Bug Fixing Velocity
          </p>
          <p className="text-text-primary mt-1 text-[13px]">{sprintWindow}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="bg-accent-red h-2.5 w-2.5 rounded-[1px] opacity-70" />
            <span className="text-text-secondary text-[11px]">New Bugs</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-accent-green h-2.5 w-2.5 rounded-[1px] opacity-70" />
            <span className="text-text-secondary text-[11px]">Resolved</span>
          </div>
          <ChartLegendItem color="var(--accent-blue)" label="Fix Rate" />
        </div>
      </div>

      <div className="min-w-0" style={{ height: 260 }}>
        <ResponsiveContainer
          height="100%"
          minHeight={1}
          minWidth={0}
          width="100%"
        >
          <ComposedChart
            barGap={2}
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
              domain={[0, Number((Math.ceil(rateMax * 10) / 10).toFixed(1))]}
              tick={{
                fill: 'var(--text-muted)',
                fontFamily: 'DM Mono',
                fontSize: 10,
              }}
              tickFormatter={(value) => value.toFixed(1)}
              tickLine={false}
              width={36}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null
                const newBugs = payload.find(
                  (entry) => entry.dataKey === 'newBugs',
                )?.value
                const resolved = payload.find(
                  (entry) => entry.dataKey === 'resolvedBugs',
                )?.value
                const rate = payload.find(
                  (entry) => entry.dataKey === 'rate',
                )?.value

                return (
                  <ChartTooltip
                    sprintLabel={String(label ?? '')}
                    rows={[
                      {
                        label: 'New Bugs',
                        value: newBugs ?? '-',
                        color: 'var(--accent-red)',
                      },
                      {
                        label: 'Resolved',
                        value: resolved ?? '-',
                        color: 'var(--accent-green)',
                      },
                      {
                        label: 'Fix Rate',
                        value: typeof rate === 'number' ? rate.toFixed(2) : '-',
                        color: 'var(--accent-blue)',
                      },
                    ]}
                  />
                )
              }}
              cursor={{ fill: 'rgba(79,126,247,0.04)' }}
            />

            <ReferenceLine
              yAxisId="right"
              y={current?.target ?? 0.9}
              stroke="var(--accent-amber)"
              strokeDasharray="4 3"
              strokeWidth={1}
              label={{
                value: `Target ${(current?.target ?? 0.9).toFixed(2)}`,
                fill: 'var(--accent-amber)',
                fontFamily: 'DM Mono',
                fontSize: 9,
                position: 'insideTopRight',
              }}
            />

            <Bar
              yAxisId="left"
              dataKey="newBugs"
              fill="var(--accent-red)"
              fillOpacity={0.6}
              radius={[2, 2, 0, 0]}
              maxBarSize={18}
              animationBegin={0}
              animationDuration={700}
            />
            <Bar
              yAxisId="left"
              dataKey="resolvedBugs"
              fill="var(--accent-green)"
              fillOpacity={0.7}
              radius={[2, 2, 0, 0]}
              maxBarSize={18}
              animationBegin={100}
              animationDuration={700}
            />
            <Line
              yAxisId="right"
              dataKey="rate"
              stroke="var(--accent-blue)"
              strokeWidth={2}
              dot={<DiamondDot />}
              animationBegin={300}
              animationDuration={900}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-border mt-4 grid gap-[1px] overflow-hidden rounded-[4px] min-[1200px]:grid-cols-4">
        <StatCell
          label="Avg Rate"
          value={averageRate.toFixed(2)}
          sub="all sprints"
        />
        <StatCell
          label="Best Sprint"
          value={bestSprint.rate.toFixed(2)}
          sub={bestSprint.sprint}
        />
        <StatCell
          label="Worst Sprint"
          value={worstSprint.rate.toFixed(2)}
          sub={worstSprint.sprint}
        />
        <StatCell
          label="Below Target"
          value={`${belowTargetCount}`}
          sub={`of ${data.length} sprints`}
        />
      </div>
    </section>
  )
}

const StatCell = ({
  label,
  value,
  sub,
}: {
  label: string
  value: string
  sub: string
}) => {
  return (
    <div className="bg-surface px-3.5 py-2.5">
      <p className="text-text-muted text-[10px] tracking-[0.08em] uppercase">
        {label}
      </p>
      <p className="metric-value text-text-primary text-lg tracking-[-0.01em]">
        {value}
      </p>
      <p className="text-text-muted text-[10px]">{sub}</p>
    </div>
  )
}
