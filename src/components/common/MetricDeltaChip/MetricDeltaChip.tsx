import { cn } from '@/lib/utils'

type DeltaTone = 'green' | 'red' | 'amber' | 'blue' | 'purple'

type MetricDeltaChipProps = {
  label: string
  tone: DeltaTone
}

const toneClasses: Record<DeltaTone, string> = {
  green: 'bg-success-soft text-success',
  red: 'bg-danger-soft text-danger',
  amber: 'bg-warning-soft text-warning',
  blue: 'bg-info-soft text-info',
  purple: 'bg-info-soft text-chart-trend',
}

export const MetricDeltaChip = ({ label, tone }: MetricDeltaChipProps) => {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-[2px] px-1.5 py-0.5 text-[10px] font-medium tracking-wide',
        toneClasses[tone],
      )}
    >
      {label}
    </span>
  )
}
