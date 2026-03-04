import { cn } from '@/lib/utils'

type DeltaTone = 'green' | 'red' | 'amber' | 'blue' | 'purple'

type MetricDeltaChipProps = {
  label: string
  tone: DeltaTone
}

const toneClasses: Record<DeltaTone, string> = {
  green:
    'bg-[color:color-mix(in_oklab,var(--accent-green)_15%,transparent)] text-[var(--accent-green)]',
  red: 'bg-[color:color-mix(in_oklab,var(--accent-red)_15%,transparent)] text-[var(--accent-red)]',
  amber:
    'bg-[color:color-mix(in_oklab,var(--accent-amber)_15%,transparent)] text-[var(--accent-amber)]',
  blue: 'bg-[color:color-mix(in_oklab,var(--accent-blue)_15%,transparent)] text-[var(--accent-blue)]',
  purple:
    'bg-[color:color-mix(in_oklab,var(--accent-purple)_15%,transparent)] text-[var(--accent-purple)]',
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
