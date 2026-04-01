import type {
  TimelineHealth,
  TimelinePackageBar,
  TimelineZoomLevel,
  WeekColumn,
} from '@/features/timeline-workspace/types/timeline-workspace.types'

export function formatSlashDate(value: string) {
  return value.replaceAll('-', '/')
}

export function parseCommaList(value: string) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

export function isIssueDoneStatus(status: string) {
  const normalized = status.toLowerCase()
  return normalized === 'closed' || normalized === 'resolved'
}

export function getIssueStatusTone(status: string) {
  if (isIssueDoneStatus(status)) return 'var(--status-success)'

  const normalized = status.toLowerCase()
  if (normalized.includes('progress')) return 'var(--status-warning)'
  if (normalized.includes('review')) return 'var(--primary)'

  return 'var(--status-danger)'
}

export function getMemberLoadTone(openCount: number) {
  if (openCount === 0) {
    return {
      chip: 'border-[color:var(--status-success)]/24 bg-[color:var(--status-success)]/6 text-[var(--muted-foreground)]',
      count: 'text-[color:var(--status-success)]',
    }
  }

  if (openCount >= 3) {
    return {
      chip: 'border-[color:var(--status-danger)]/24 bg-[color:var(--status-danger)]/6 text-[var(--foreground)]',
      count: 'text-[color:var(--status-danger)]',
    }
  }

  return {
    chip: 'border-[color:var(--status-warning)]/24 bg-[color:var(--status-warning)]/6 text-[var(--foreground)]',
    count: 'text-[color:var(--status-warning)]',
  }
}

export function getGridStyle(columns: number) {
  return { gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }
}

export function getHealthFromProgress(
  resolvedBug: number,
  totalBug: number,
): TimelineHealth {
  if (totalBug === 0) return 'healthy'
  const progress = resolvedBug / totalBug
  if (progress >= 0.75) return 'healthy'
  if (progress >= 0.4) return 'watch'
  return 'risk'
}

export function getBarColor(health: TimelineHealth) {
  if (health === 'healthy') return 'var(--timeline-bar-healthy)'
  if (health === 'watch') return 'var(--timeline-bar-watch)'
  return 'var(--timeline-bar-risk)'
}

export function getBarTrackColor(health: TimelineHealth) {
  const color = getBarColor(health)
  return `color-mix(in srgb, ${color} 32%, var(--workspace-pane))`
}

export function getProjectBandColor(health: TimelineHealth) {
  const color = getBarColor(health)
  return `color-mix(in srgb, ${color} 22%, transparent)`
}

export function cnSelected(base: string, selected: boolean) {
  return `${base} ${selected ? 'ops-bug-selected' : ''}`
}

export function getProjectWindow(packages: TimelinePackageBar[]) {
  if (!packages.length) return null

  const leftPercent = Math.min(...packages.map((item) => item.leftPercent))
  const rightEdge = Math.max(
    ...packages.map((item) => item.leftPercent + item.widthPercent),
  )

  return {
    leftPercent,
    widthPercent: Math.max(rightEdge - leftPercent, 6),
  }
}

export function toInputDate(value: Date) {
  return value.toISOString().slice(0, 10)
}

export function parseInputDate(value: string, fallback: Date) {
  return value ? new Date(`${value}T00:00:00`) : fallback
}

export function addDays(date: Date, amount: number) {
  const next = new Date(date)
  next.setDate(next.getDate() + amount)
  return next
}

export function addMonths(date: Date, amount: number) {
  const next = new Date(date)
  next.setMonth(next.getMonth() + amount)
  return next
}

export function startOfDay(date: Date) {
  const next = new Date(date)
  next.setHours(0, 0, 0, 0)
  return next
}

export function startOfWeek(date: Date) {
  const next = startOfDay(date)
  const day = next.getDay()
  const diff = day === 0 ? -6 : 1 - day
  return addDays(next, diff)
}

export function startOfMonth(date: Date) {
  const next = startOfDay(date)
  next.setDate(1)
  return next
}

export function formatDateLabel(value: string) {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
  }).format(new Date(`${value}T00:00:00`))
}

export function formatMonthLabel(value: Date) {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    year: 'numeric',
  }).format(value)
}

export function formatWeekLabel(value: Date) {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
  }).format(value)
}

export function formatWeekShortLabel(start: Date, end: Date) {
  return `${start.getDate()}-${addDays(end, -1).getDate()}`
}

export function formatDayNumber(date: Date) {
  return new Intl.DateTimeFormat('en', { day: 'numeric' }).format(date)
}

export function formatWeekdayLabel(date: Date) {
  return new Intl.DateTimeFormat('en', { weekday: 'short' }).format(date)
}

export function formatMonthShortLabel(date: Date) {
  return new Intl.DateTimeFormat('en', { month: 'short' }).format(date)
}

export function formatQuarterLabel(date: Date) {
  return `Q${Math.floor(date.getMonth() / 3) + 1} ${date.getFullYear()}`
}

export function getTimelineColumnWidthRem(zoom: TimelineZoomLevel) {
  if (zoom === 'week') return 4.25
  if (zoom === 'quarter') return 8.5
  return 7.5
}

export function getTodayOffsetPercent(weekColumns: WeekColumn[]) {
  if (!weekColumns.length) return null

  const now = new Date()
  const current = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  ).getTime()

  const columnIndex = weekColumns.findIndex(
    (column) =>
      current >= column.start.getTime() && current < column.end.getTime(),
  )

  if (columnIndex === -1) return null

  const column = weekColumns[columnIndex]
  const columnDuration = column.end.getTime() - column.start.getTime()
  const withinColumn =
    columnDuration > 0 ? (current - column.start.getTime()) / columnDuration : 0

  return ((columnIndex + withinColumn) / weekColumns.length) * 100
}

export function getExportBackgroundColor() {
  return (
    getComputedStyle(document.documentElement)
      .getPropertyValue('--workspace-pane')
      .trim() || '#ffffff'
  )
}

export function buildTimelineItemExportFileName(
  projectName: string,
  itemName: string,
) {
  const value = `${projectName || 'package'} ${itemName}`.trim().toLowerCase()

  return (
    value.replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'package-view'
  )
}

export function downloadDataUrl(dataUrl: string, fileName: string) {
  const link = document.createElement('a')
  link.href = dataUrl
  link.download = fileName
  link.click()
}
