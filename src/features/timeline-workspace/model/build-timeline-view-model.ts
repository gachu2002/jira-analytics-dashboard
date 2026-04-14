import type {
  TimelinePackageLike,
  TimelineProjectGroup,
  TimelineProjectLike,
  TimelineViewModel,
  TimelineZoomLevel,
} from '@/features/timeline-workspace/types/timeline-workspace.types'
import {
  addDays,
  getHealthFromProgress,
  startOfDay,
} from '@/features/timeline-workspace/utils/timeline-workspace.utils'

function parseDate(value: string) {
  return new Date(`${value}T00:00:00`)
}

function endOfDay(date: Date) {
  const next = startOfDay(date)
  next.setDate(next.getDate() + 1)
  return next
}

function getTimelineDays(zoom: TimelineZoomLevel) {
  if (zoom === 'week') return 28
  if (zoom === 'quarter') return 180
  return 90
}

function getRangeBounds(
  packages: TimelinePackageLike[],
  zoom: TimelineZoomLevel,
) {
  if (!packages.length) {
    const now = startOfDay(new Date())
    return { rangeStart: now, rangeEnd: addDays(now, getTimelineDays(zoom)) }
  }

  const starts = packages.map((item) => parseDate(item.start_date).getTime())
  const ends = packages.map((item) => parseDate(item.end_date).getTime())
  const rawStart = new Date(Math.min(...starts))
  const rawEnd = new Date(Math.max(...ends))
  const paddedStart = addDays(startOfDay(rawStart), -7)
  const paddedEnd = addDays(endOfDay(rawEnd), 7)

  return { rangeStart: paddedStart, rangeEnd: paddedEnd }
}

function mapProjectGroups(
  projects: TimelineProjectLike[],
  packages: TimelinePackageLike[],
  rangeStart: Date,
  rangeEnd: Date,
  search: string,
) {
  const totalDuration = rangeEnd.getTime() - rangeStart.getTime()
  const searchValue = search.trim().toLowerCase()

  return projects
    .map<TimelineProjectGroup>((project) => {
      const projectPackages = packages
        .filter((item) => item.bug_tracker_project === project.id)
        .filter((item) => {
          if (!searchValue) return true

          return `${project.name} ${item.name} ${item.keys} ${item.labels} ${item.members} ${item.note ?? ''}`
            .toLowerCase()
            .includes(searchValue)
        })
        .map((item) => {
          const start = parseDate(item.start_date).getTime()
          const end = parseDate(item.end_date).getTime()
          const leftPercent =
            ((start - rangeStart.getTime()) / totalDuration) * 100
          const widthPercent = Math.max(
            ((end - start) / totalDuration) * 100,
            3,
          )

          return {
            id: item.id,
            projectId: project.id,
            name: item.name,
            leftPercent,
            widthPercent,
            startDate: item.start_date,
            endDate: item.end_date,
            resolvedBug: item.resolved_bug,
            totalBug: item.total_bug,
            progress:
              item.total_bug > 0 ? item.resolved_bug / item.total_bug : 0,
            members: item.members
              ? item.members
                  .split(',')
                  .map((entry) => entry.trim())
                  .filter(Boolean)
              : [],
            labels: item.labels
              ? item.labels
                  .split(',')
                  .map((entry) => entry.trim())
                  .filter(Boolean)
              : [],
            keys: item.keys
              ? item.keys
                  .split(',')
                  .map((entry) => entry.trim())
                  .filter(Boolean)
              : [],
            health: getHealthFromProgress(item.resolved_bug, item.total_bug),
            taskId: item.task_id ?? null,
            syncStatus: item.sync_status ?? null,
            isSyncing:
              Boolean(item.task_id) &&
              (item.sync_status ?? 'PROCESSING') !== 'SUCCESS',
          }
        })

      return {
        id: project.id,
        name: project.name,
        packageCount: projectPackages.length,
        totalBug: projectPackages.reduce((sum, item) => sum + item.totalBug, 0),
        resolvedBug: projectPackages.reduce(
          (sum, item) => sum + item.resolvedBug,
          0,
        ),
        packages: projectPackages,
      }
    })
    .filter((project) => project.packageCount > 0 || !searchValue)
}

export function buildTimelineViewModel(
  projects: TimelineProjectLike[],
  packages: TimelinePackageLike[],
  zoom: TimelineZoomLevel,
  search: string,
): TimelineViewModel {
  const { rangeStart, rangeEnd } = getRangeBounds(packages, zoom)
  const groupedProjects = mapProjectGroups(
    projects,
    packages,
    rangeStart,
    rangeEnd,
    search,
  )

  return {
    rangeStart,
    rangeEnd,
    projects: groupedProjects,
    totals: {
      projects: groupedProjects.length,
      packages: groupedProjects.reduce(
        (sum, project) => sum + project.packageCount,
        0,
      ),
      bugs: groupedProjects.reduce((sum, project) => sum + project.totalBug, 0),
      resolved: groupedProjects.reduce(
        (sum, project) => sum + project.resolvedBug,
        0,
      ),
    },
  }
}
