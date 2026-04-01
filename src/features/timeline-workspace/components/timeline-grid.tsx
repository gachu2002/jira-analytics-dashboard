import { getGridStyle } from '@/features/timeline-workspace/utils/timeline-workspace.utils'

export function TimelineGrid({ columns }: { columns: number }) {
  return (
    <div
      className="pointer-events-none absolute inset-0 grid h-full w-full"
      style={getGridStyle(columns)}
    >
      {Array.from({ length: columns }, (_, index) => (
        <div
          key={index}
          className="ops-gantt-column h-full"
          style={{ borderLeftWidth: index === 0 ? 0 : 1 }}
        />
      ))}
    </div>
  )
}

export function TimelineTodayMarker({ offset }: { offset: number }) {
  return (
    <div
      className="pointer-events-none absolute top-0 bottom-0 z-10 w-px bg-[color:var(--primary)]/60"
      style={{ left: `${offset}%` }}
    />
  )
}
