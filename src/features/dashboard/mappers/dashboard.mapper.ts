import type {
  BurnupPoint,
  BurndownPoint,
  CustomJqlResponseDto,
  DashboardData,
  MilestoneDto,
  ReopenRatePoint,
  SprintMetricsDto,
  VelocityPoint,
} from '@/features/dashboard/types/dashboard.types'
import { getSprintLabel, sortSprints } from '@/features/dashboard/utils/sprint'

type MapDashboardArgs = {
  summary: Pick<
    MilestoneDto | CustomJqlResponseDto,
    'start_date' | 'end_date' | 'resolved_bug' | 'total_bug'
  >
  sprints: SprintMetricsDto[]
}

const toNumber = (value: number) => Number(value)

const getResolvedVelocity = (sprint: SprintMetricsDto) =>
  Math.max(toNumber(sprint.resolved_bug_velocity), 0)

const getResolvedForReopenRate = (sprint: SprintMetricsDto) =>
  Math.max(toNumber(sprint.resolved_bug_reopened), 0)

const getIdealValue = (
  total: number,
  sprintCount: number,
  sprintNumber: number,
) =>
  sprintCount > 0
    ? Number(((total / sprintCount) * sprintNumber).toFixed(2))
    : 0

const createBurnupPoint = (
  sprint: SprintMetricsDto,
  sprintCount: number,
  sprintNumber: number,
): BurnupPoint => ({
  sprintId: sprint.sprint.id,
  sprint: getSprintLabel(sprint.sprint),
  sprintNumber,
  completed: Math.max(toNumber(sprint.completed_point), 0),
  scope: Math.max(toNumber(sprint.scope_point), 0),
  ideal: getIdealValue(
    Math.max(toNumber(sprint.scope_point), 0),
    sprintCount,
    sprintNumber,
  ),
})

const createBurndownPoint = (
  sprint: SprintMetricsDto,
  totalBugs: number,
  sprintCount: number,
  sprintNumber: number,
): BurndownPoint => {
  const resolvedBugs = Math.max(toNumber(sprint.resolved_bug), 0)

  return {
    sprintId: sprint.sprint.id,
    sprint: getSprintLabel(sprint.sprint),
    sprintNumber,
    resolved: resolvedBugs,
    total: totalBugs,
    ideal: getIdealValue(totalBugs, sprintCount, sprintNumber),
  }
}

const createVelocityPoint = (sprint: SprintMetricsDto): VelocityPoint => {
  const newBugs = Math.max(toNumber(sprint.new_bug), 0)
  const resolvedBugs = getResolvedVelocity(sprint)

  return {
    sprintId: sprint.sprint.id,
    sprint: getSprintLabel(sprint.sprint),
    newBugs,
    resolvedBugs,
    rate: Number((newBugs > 0 ? resolvedBugs / newBugs : 0).toFixed(2)),
    target: Math.max(toNumber(sprint.target_bug_velocity), 0),
  }
}

const createReopenRatePoint = (sprint: SprintMetricsDto): ReopenRatePoint => {
  const reopened = Math.max(toNumber(sprint.reopened_bug), 0)
  const resolved = getResolvedForReopenRate(sprint)

  return {
    sprintId: sprint.sprint.id,
    sprint: getSprintLabel(sprint.sprint),
    rate: Number((resolved > 0 ? reopened / resolved : 0).toFixed(3)),
    target: Math.max(toNumber(sprint.target_reopened_rate), 0),
    resolved,
    reopened,
  }
}

export const mapDashboardData = ({
  summary,
  sprints,
}: MapDashboardArgs): DashboardData => {
  const sortedSprints = sortSprints(sprints)
  const sprintCount = sortedSprints.length
  const totalScope = Math.max(
    ...sortedSprints.map((sprint) => toNumber(sprint.scope_point)),
    0,
  )
  const totalBugs = Math.max(toNumber(summary.total_bug), 0)

  const burnup = sortedSprints.map((sprint, index) =>
    createBurnupPoint(sprint, sprintCount, index + 1),
  )
  const burndown = sortedSprints.map((sprint, index) =>
    createBurndownPoint(sprint, totalBugs, sprintCount, index + 1),
  )
  const velocity = sortedSprints.map(createVelocityPoint)
  const reopenRateSeries = sortedSprints.map(createReopenRatePoint)

  const currentBurnup = burnup[burnup.length - 1]
  const currentBurndown = burndown[burndown.length - 1]
  const currentVelocity = velocity[velocity.length - 1]
  const currentReopenRate = reopenRateSeries[reopenRateSeries.length - 1]

  return {
    meta: {
      currentSprint: currentBurnup?.sprint ?? '--',
    },
    milestoneProgress: {
      completed: currentBurnup?.completed ?? 0,
      total: currentBurnup?.scope ?? totalScope,
      completionPercent:
        currentBurnup && currentBurnup.scope > 0
          ? Number(
              ((currentBurnup.completed / currentBurnup.scope) * 100).toFixed(
                1,
              ),
            )
          : 0,
    },
    remainingBugs: {
      count: Math.max(totalBugs - (currentBurndown?.resolved ?? 0), 0),
    },
    bugFixRate: {
      value: currentVelocity?.rate ?? 0,
      target: currentVelocity?.target ?? 0,
    },
    reopenRate: {
      value: currentReopenRate?.rate ?? 0,
      target: currentReopenRate?.target ?? 0,
    },
    burnup,
    burndown,
    velocity,
    reopenRateSeries,
  }
}
