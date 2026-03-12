import type {
  BurnupPoint,
  BurndownPoint,
  ReopenRatePoint,
  SprintMetricsDto,
  VelocityPoint,
} from '@/features/dashboard/types/dashboard.types'

type SprintSeriesPoint =
  | BurnupPoint
  | BurndownPoint
  | VelocityPoint
  | ReopenRatePoint

export type SprintOption = {
  label: string
  value: string
}

const bySprintDate = (left: SprintMetricsDto, right: SprintMetricsDto) => {
  const startDiff =
    new Date(left.sprint.start_date).getTime() -
    new Date(right.sprint.start_date).getTime()

  if (startDiff !== 0) {
    return startDiff
  }

  return left.sprint.id - right.sprint.id
}

export const sortSprints = <T extends SprintMetricsDto>(sprints: T[]) =>
  [...sprints].sort(bySprintDate)

export const getSprintLabel = (sprint?: { id: number; name: string } | null) =>
  sprint?.name?.trim() ? sprint.name : '--'

export const getActiveSprint = <T extends SprintSeriesPoint>(
  points: T[],
  sprintId?: number | null,
) =>
  points.find((point) => point.sprintId === sprintId) ??
  points[points.length - 1]

export const getPreviousSprint = <T extends SprintSeriesPoint>(
  points: T[],
  sprintId?: number | null,
) => {
  const activeSprint = getActiveSprint(points, sprintId)
  const activeIndex = points.findIndex(
    (point) => point.sprintId === activeSprint?.sprintId,
  )

  return activeIndex > 0 ? points[activeIndex - 1] : undefined
}

export const createSprintLookup = <T extends SprintSeriesPoint>(points: T[]) =>
  new Map(points.map((point) => [point.sprintId, point]))

export const toSeriesSprintOptions = (
  points: SprintSeriesPoint[],
): SprintOption[] =>
  points.map((point) => ({
    label: point.sprint,
    value: String(point.sprintId),
  }))

export const toRecordSprintOptions = (
  sprints: SprintMetricsDto[],
): SprintOption[] =>
  sprints.map((item) => ({
    label: item.sprint.name,
    value: String(item.sprint.id),
  }))
