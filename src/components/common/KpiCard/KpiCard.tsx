import { useMemo } from 'react'

import { MetricDeltaChip } from '@/components/common/MetricDeltaChip'
import { useCountUp } from '@/hooks/useCountUp'

type MetricDeltaChipProps = Parameters<typeof MetricDeltaChip>[0]

type KpiCardProps = {
  label: string
  value: string
  animatedValue?: number
  formatter?: (value: number) => string
  subtext: string
  delta?: MetricDeltaChipProps
  progress?: {
    value: number
    max: number
  }
}

const kpiFormatter = (value: number) => value.toString()

export const KpiCard = ({
  label,
  value,
  animatedValue,
  formatter = kpiFormatter,
  subtext,
  delta,
  progress,
}: KpiCardProps) => {
  const count = useCountUp(animatedValue ?? 0)
  const displayValue = useMemo(
    () => (animatedValue !== undefined ? formatter(count) : value),
    [animatedValue, count, formatter, value],
  )

  return (
    <article className="dashboard-card px-5 pt-4 pb-[18px]">
      <p className="text-text-muted mb-2 text-[10px] font-medium tracking-[0.1em] uppercase">
        {label}
      </p>
      <div className="flex items-end gap-2.5">
        <p className="metric-value text-text-primary text-[32px] leading-none tracking-[-0.02em]">
          {displayValue}
        </p>
        {delta ? <MetricDeltaChip {...delta} /> : null}
      </div>
      {progress ? (
        <div className="mt-3">
          <div className="bg-border h-[3px] overflow-hidden rounded-[2px]">
            <div
              className="bg-accent-blue h-full transition-all duration-500"
              style={{
                width: `${Math.min((progress.value / progress.max) * 100, 100)}%`,
              }}
            />
          </div>
          <p className="text-text-secondary mt-1.5 text-[11px]">{subtext}</p>
        </div>
      ) : (
        <p className="text-text-muted mt-2 text-[11px]">{subtext}</p>
      )}
    </article>
  )
}
