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
    <div className="min-w-36 rounded-[4px] border border-[var(--border)] bg-[var(--surface-elevated)] px-3.5 py-2.5">
      <p className="metric-value mb-2 text-[11px] text-[var(--text-secondary)]">
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
          <span className="text-[11px] text-[var(--text-secondary)]">
            Reopen Rate
          </span>
        </div>
        <span className="metric-value text-[11px] text-[var(--text-primary)]">
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
  data,
  fullWidth = false,
}: ReopenRateCardProps) => {
  return (
    <section className="dashboard-card px-5 py-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-[10px] tracking-[0.1em] text-[var(--text-muted)] uppercase">
            Reopen Rate
          </p>
          <p className="mt-1 text-[13px] text-[var(--text-primary)]">
            Bug Reopen Trend
          </p>
        </div>
        <span className="rounded-[2px] border border-[rgba(61,214,140,0.25)] bg-[rgba(61,214,140,0.12)] px-2 py-1 text-[10px] text-[var(--accent-green)]">
          1.5% current
        </span>
      </div>

      <div style={{ height: fullWidth ? 220 : 200 }}>
        <ResponsiveContainer height="100%" width="100%">
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
              domain={[0, 0.09]}
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
                value: 'Target ≤3%',
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
              y={0.03}
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
            <tr className="border-b border-[var(--border)]">
              {['Sprint', 'Target', 'Rate', 'Resolved', 'Reopened'].map(
                (header, index) => (
                  <th
                    className={`px-1.5 py-1 text-[10px] font-normal tracking-[0.08em] text-[var(--text-muted)] uppercase ${index === 0 ? 'text-left' : 'text-right'}`}
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
              const current = row.sprint === 'S10'
              const aboveTarget = row.rate > row.target

              return (
                <tr
                  className="data-row h-9"
                  key={row.sprint}
                  style={{
                    background: current
                      ? 'var(--row-active-bg)'
                      : 'transparent',
                    borderLeft: current
                      ? '2px solid var(--accent-blue)'
                      : '2px solid transparent',
                  }}
                >
                  <td
                    className={`metric-value px-1.5 ${current ? 'font-medium text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}
                  >
                    {row.sprint}
                  </td>
                  <td className="metric-value px-1.5 text-right text-[var(--text-muted)]">
                    3.0%
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
                  <td className="metric-value px-1.5 text-right text-[var(--text-secondary)]">
                    {row.resolved}
                  </td>
                  <td
                    className={`metric-value px-1.5 text-right ${row.reopened > 0 ? 'text-[var(--accent-amber)]' : 'text-[var(--text-muted)]'}`}
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
