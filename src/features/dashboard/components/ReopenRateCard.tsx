import {
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import type { ReopenRatePoint } from '@/features/dashboard/types/dashboard.types'

type ReopenRateCardProps = {
  activeSprint?: string
  data: ReopenRatePoint[]
  fullWidth?: boolean
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: Array<{ dataKey: string; value: number }>
  label?: string | number
}) => {
  if (!active || !payload?.length) {
    return null
  }

  const rate = payload.find((item) => item.dataKey === 'rate')?.value

  if (rate === undefined) {
    return null
  }

  return (
    <div className="border-border bg-surface-elevated min-w-36 rounded-[4px] border px-3.5 py-2.5">
      <p className="metric-value text-text-secondary mb-2 text-[11px]">
        {String(label ?? '')}
      </p>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{
              background:
                rate <= 0.03 ? 'var(--accent-green)' : 'var(--accent-red)',
            }}
          />
          <span className="text-text-secondary text-[11px]">Reopen Rate</span>
        </div>
        <span className="metric-value text-text-primary text-[11px]">
          {(rate * 100).toFixed(1)}%
        </span>
      </div>
    </div>
  )
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
    payload.rate <= 0.03 ? 'var(--accent-green)' : 'var(--accent-red)'
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
  activeSprint,
  data,
  fullWidth = false,
}: ReopenRateCardProps) => {
  const current =
    data.find((item) => item.sprint === activeSprint) ?? data[data.length - 1]
  const currentTarget = current?.target ?? 0.03
  const sprintWindow =
    data.length > 0
      ? `${data[0]?.sprint} - ${data[data.length - 1]?.sprint}`
      : '--'
  const yMax = Math.max(
    currentTarget,
    ...data.flatMap((row) => [row.rate, row.target]),
    0.06,
  )

  return (
    <section className="dashboard-card px-5 py-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-text-muted text-[10px] tracking-[0.1em] uppercase">
            Reopen Rate
          </p>
          <p className="text-text-primary mt-1 text-[13px]">{sprintWindow}</p>
        </div>
        <span className="text-accent-green rounded-[2px] border border-[rgba(61,214,140,0.25)] bg-[rgba(61,214,140,0.12)] px-2 py-1 text-[10px]">
          {((current?.rate ?? 0) * 100).toFixed(1)}% current
        </span>
      </div>

      <div className="min-w-0" style={{ height: fullWidth ? 220 : 200 }}>
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
              content={<CustomTooltip />}
              cursor={{ stroke: 'var(--border)', strokeWidth: 1 }}
            />

            <ReferenceArea
              fill="var(--accent-green)"
              fillOpacity={0.06}
              label={{
                value: `Target <=${Math.round(currentTarget * 100)}%`,
                position: 'insideTopRight',
                fill: 'var(--accent-green)',
                fontSize: 9,
              }}
              stroke="var(--accent-green)"
              strokeDasharray="3 3"
              strokeOpacity={0.35}
              strokeWidth={1}
              y1={0}
              y2={0.03}
            />
            <ReferenceLine
              stroke="var(--accent-green)"
              strokeDasharray="3 3"
              strokeWidth={1}
              y={currentTarget}
            />

            <Line
              animationDuration={900}
              dataKey="rate"
              dot={<ColoredDot />}
              stroke="var(--text-secondary)"
              strokeWidth={1.5}
              type="monotone"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

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
              const isActive = row.sprint === (activeSprint ?? current?.sprint)
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
                      ? '2px solid var(--accent-blue)'
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
                          ? 'rgba(247,92,92,0.15)'
                          : 'rgba(61,214,140,0.12)',
                        color: aboveTarget
                          ? 'var(--accent-red)'
                          : 'var(--accent-green)',
                      }}
                    >
                      {(row.rate * 100).toFixed(1)}%
                    </span>
                  </td>
                  <td className="metric-value text-text-secondary px-1.5 text-right">
                    {row.resolved}
                  </td>
                  <td
                    className={`metric-value px-1.5 text-right ${row.reopened > 0 ? 'text-accent-amber' : 'text-text-muted'}`}
                  >
                    {row.reopened}
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
