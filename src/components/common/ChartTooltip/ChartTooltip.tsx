import type { ReactNode } from 'react'

type TooltipRow = {
  label: string
  value: ReactNode
  color: string
}

type ChartTooltipProps = {
  sprintLabel: string
  rows: TooltipRow[]
}

export const ChartTooltip = ({ sprintLabel, rows }: ChartTooltipProps) => {
  return (
    <div className="border-border bg-surface-elevated min-w-44 rounded-[4px] border p-3">
      <p className="text-text-muted mb-2 text-[10px] tracking-[0.08em] uppercase">
        {sprintLabel}
      </p>
      <div className="space-y-1.5">
        {rows.map((row) => (
          <div
            className="flex items-center justify-between gap-3 text-xs"
            key={row.label}
          >
            <div className="text-text-secondary flex items-center gap-1.5">
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: row.color }}
              />
              {row.label}
            </div>
            <span className="metric-value text-text-primary text-right">
              {row.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
