import type {
  MonthGroup,
  TimelinePackageBar,
  TimelineProjectGroup,
  TimelineViewModel,
  TimelineZoomLevel,
  VisibleTimelineViewModel,
  WeekColumn,
} from '@/features/timeline-workspace/types/timeline-workspace.types'
import {
  addDays,
  addMonths,
  formatDayNumber,
  formatMonthLabel,
  formatMonthShortLabel,
  formatQuarterLabel,
  formatWeekLabel,
  formatWeekShortLabel,
  formatWeekdayLabel,
  parseInputDate,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from '@/features/timeline-workspace/utils/timeline-workspace.utils'

function buildTimeColumns(
  rangeStart: Date,
  rangeEnd: Date,
  zoom: TimelineZoomLevel,
) {
  const columns: WeekColumn[] = []

  if (zoom === 'week') {
    for (
      let cursor = startOfDay(rangeStart);
      cursor < rangeEnd;
      cursor = addDays(cursor, 1)
    ) {
      const start = new Date(Math.max(cursor.getTime(), rangeStart.getTime()))
      const end = new Date(
        Math.min(addDays(cursor, 1).getTime(), rangeEnd.getTime()),
      )

      columns.push({
        key: `${start.toISOString()}-${end.toISOString()}`,
        label: formatDayNumber(start),
        shortLabel: formatWeekdayLabel(start),
        start,
        end,
      })
    }

    return columns
  }

  if (zoom === 'quarter') {
    for (
      let cursor = startOfMonth(rangeStart);
      cursor < rangeEnd;
      cursor = addMonths(cursor, 1)
    ) {
      const start = new Date(Math.max(cursor.getTime(), rangeStart.getTime()))
      const end = new Date(
        Math.min(addMonths(cursor, 1).getTime(), rangeEnd.getTime()),
      )

      columns.push({
        key: `${start.toISOString()}-${end.toISOString()}`,
        label: formatMonthShortLabel(start),
        shortLabel: '',
        start,
        end,
      })
    }

    return columns
  }

  for (
    let cursor = startOfWeek(rangeStart);
    cursor < rangeEnd;
    cursor = addDays(cursor, 7)
  ) {
    const start = new Date(Math.max(cursor.getTime(), rangeStart.getTime()))
    const end = new Date(
      Math.min(addDays(cursor, 7).getTime(), rangeEnd.getTime()),
    )
    columns.push({
      key: `${start.toISOString()}-${end.toISOString()}`,
      label: formatWeekLabel(start),
      shortLabel: formatWeekShortLabel(start, end),
      start,
      end,
    })
  }

  return columns
}

function buildHeaderGroups(columns: WeekColumn[], zoom: TimelineZoomLevel) {
  const groups: MonthGroup[] = []

  columns.forEach((column, index) => {
    const midpoint = new Date(
      column.start.getTime() +
        (column.end.getTime() - column.start.getTime()) / 2,
    )

    const key =
      zoom === 'quarter'
        ? `${midpoint.getFullYear()}-q${Math.floor(midpoint.getMonth() / 3)}`
        : `${midpoint.getFullYear()}-${midpoint.getMonth()}`

    const label =
      zoom === 'quarter'
        ? formatQuarterLabel(midpoint)
        : formatMonthLabel(midpoint)

    const lastGroup = groups.at(-1)
    if (lastGroup?.key === key) {
      lastGroup.span += 1
      return
    }

    groups.push({
      key,
      label,
      start: index + 1,
      span: 1,
    })
  })

  return groups
}

export function buildVisibleTimelineViewModel(
  viewModel: TimelineViewModel,
  fromDate: string,
  toDate: string,
  zoom: TimelineZoomLevel,
): VisibleTimelineViewModel {
  const rawStart = startOfDay(parseInputDate(fromDate, viewModel.rangeStart))
  const rawEnd = addDays(
    startOfDay(parseInputDate(toDate, addDays(viewModel.rangeEnd, -1))),
    1,
  )
  const rangeStart = rawStart
  const rangeEnd = rawEnd > rawStart ? rawEnd : addDays(rawStart, 1)
  const totalDuration = rangeEnd.getTime() - rangeStart.getTime()

  const weekColumns = buildTimeColumns(rangeStart, rangeEnd, zoom)
  const monthGroups = buildHeaderGroups(weekColumns, zoom)

  const projects = viewModel.projects
    .map<TimelineProjectGroup>((project) => {
      const projectPackages = project.packages
        .map((item) => {
          const itemStart = startOfDay(new Date(`${item.startDate}T00:00:00`))
          const itemEnd = addDays(
            startOfDay(new Date(`${item.endDate}T00:00:00`)),
            1,
          )

          if (itemEnd <= rangeStart || itemStart >= rangeEnd) return null

          const clippedStart = new Date(
            Math.max(itemStart.getTime(), rangeStart.getTime()),
          )
          const clippedEnd = new Date(
            Math.min(itemEnd.getTime(), rangeEnd.getTime()),
          )

          return {
            ...item,
            leftPercent:
              ((clippedStart.getTime() - rangeStart.getTime()) /
                totalDuration) *
              100,
            widthPercent: Math.max(
              ((clippedEnd.getTime() - clippedStart.getTime()) /
                totalDuration) *
                100,
              3,
            ),
          }
        })
        .filter((item): item is TimelinePackageBar => item !== null)

      return {
        ...project,
        packageCount: projectPackages.length,
        totalBug: projectPackages.reduce((sum, item) => sum + item.totalBug, 0),
        resolvedBug: projectPackages.reduce(
          (sum, item) => sum + item.resolvedBug,
          0,
        ),
        packages: projectPackages,
      }
    })
    .filter((project) => project.packages.length > 0)

  return { rangeStart, rangeEnd, monthGroups, weekColumns, projects }
}
