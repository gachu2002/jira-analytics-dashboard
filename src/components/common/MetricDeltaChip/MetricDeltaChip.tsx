import { cn } from '@/lib/utils'

type DeltaTone = 'green' | 'red' | 'amber' | 'blue' | 'purple'

type MetricDeltaChipProps = {
  label: string
  tone: DeltaTone
}

const toneClasses: Record<DeltaTone, string> = {
  green: 'bg-[#3dd68c26] text-accent-green',
  red: 'bg-[#f75c5c26] text-accent-red',
  amber: 'bg-[#f5a62326] text-accent-amber',
  blue: 'bg-[#4f7ef726] text-accent-blue',
  purple: 'bg-[#9b7ef726] text-accent-purple',
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
