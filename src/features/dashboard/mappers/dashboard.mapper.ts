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

const createBurnupPoint = (sprint: SprintMetricsDto): BurnupPoint => ({
  sprintId: sprint.sprint.id,
  sprint: getSprintLabel(sprint.sprint),
  completed: Math.max(toNumber(sprint.completed_point), 0),
  scope: Math.max(toNumber(sprint.scope_point), 0),
})

const createBurndownPoint = (
  sprint: SprintMetricsDto,
  totalBugs: number,
): BurndownPoint => {
  const resolvedBugs = Math.max(toNumber(sprint.resolved_bug), 0)

  return {
    sprintId: sprint.sprint.id,
    sprint: getSprintLabel(sprint.sprint),
    remaining: Math.max(totalBugs - resolvedBugs, 0),
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
    rate: Number((resolvedBugs / Math.max(newBugs, 1)).toFixed(2)),
    target: Math.max(toNumber(sprint.target_bug_velocity), 0),
  }
}

const createReopenRatePoint = (sprint: SprintMetricsDto): ReopenRatePoint => {
  const reopened = Math.max(toNumber(sprint.reopened_bug), 0)
  const resolved = getResolvedForReopenRate(sprint)

  return {
    sprintId: sprint.sprint.id,
    sprint: getSprintLabel(sprint.sprint),
    rate: Number((reopened / Math.max(resolved, 1)).toFixed(3)),
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
  const totalScope = Math.max(
    ...sortedSprints.map((sprint) => toNumber(sprint.scope_point)),
    0,
  )
  const totalBugs = Math.max(toNumber(summary.total_bug), 0)

  const burnup = sortedSprints.map(createBurnupPoint)
  const burndown = sortedSprints.map((sprint) =>
    createBurndownPoint(sprint, totalBugs),
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
      count: currentBurndown?.remaining ?? Math.max(totalBugs, 0),
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
