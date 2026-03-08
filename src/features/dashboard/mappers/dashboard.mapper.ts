import type {
  BurnupPoint,
  BurndownPoint,
  DashboardData,
  MilestoneDto,
  MilestoneSprintDto,
  ReopenRatePoint,
  VelocityPoint,
} from '@/features/dashboard/types/dashboard.types'
import { toSprintLabel } from '@/features/dashboard/utils/sprint'

type MapDashboardArgs = {
  milestone: MilestoneDto
  sprints: MilestoneSprintDto[]
}

const DEFAULT_FIX_RATE_TARGET = 0.9
const DEFAULT_REOPEN_RATE_TARGET = 0.03

const normalizeFixRateTarget = (value: number) =>
  value > 0 ? value : DEFAULT_FIX_RATE_TARGET

const normalizeReopenRateTarget = (value: number) =>
  value > 0 ? value : DEFAULT_REOPEN_RATE_TARGET

const toBurnup = (sprints: MilestoneSprintDto[]): BurnupPoint[] =>
  sprints.map((item) => ({
    sprint: toSprintLabel(Number(item.sprint)),
    completed: Number(item.completed_point),
    ideal: Number(item.ideal_point),
    scope: Number(item.scope_point),
  }))

const toBurndown = (sprints: MilestoneSprintDto[]): BurndownPoint[] =>
  sprints.map((item) => ({
    sprint: toSprintLabel(Number(item.sprint)),
    remaining: Math.max(Number(item.total_bug) - Number(item.resolved_bug), 0),
    ideal: Math.max(Number(item.ideal_bug), 0),
  }))

const toVelocity = (sprints: MilestoneSprintDto[]): VelocityPoint[] =>
  sprints.map((item) => ({
    sprint: toSprintLabel(Number(item.sprint)),
    newBugs: Number(item.new_bug),
    resolvedBugs: Number(item.resolved_bug_velocity),
    rate: Number(item.bug_fixing_rate),
    target: normalizeFixRateTarget(Number(item.target_bug_velocity)),
  }))

const toReopenRateSeries = (sprints: MilestoneSprintDto[]): ReopenRatePoint[] =>
  sprints.map((item) => ({
    sprint: toSprintLabel(Number(item.sprint)),
    rate: Number(item.reopened_rate),
    target: normalizeReopenRateTarget(Number(item.target_reopened_rate)),
    resolved: Number(item.resolved_bug_reopened),
    reopened: Number(item.reopened_bug),
  }))

export const mapDashboardData = ({
  milestone,
  sprints,
}: MapDashboardArgs): DashboardData => {
  const sortedSprints = [...sprints].sort(
    (left, right) => Number(left.sprint) - Number(right.sprint),
  )
  const burnup = toBurnup(sortedSprints)
  const burndown = toBurndown(sortedSprints)
  const velocity = toVelocity(sortedSprints)
  const reopenRateSeries = toReopenRateSeries(sortedSprints)

  const currentBurnup = burnup[burnup.length - 1]
  const currentBurndown = burndown[burndown.length - 1]
  const previousBurndown = burndown[burndown.length - 2]
  const currentVelocity = velocity[velocity.length - 1]
  const currentReopenRate = reopenRateSeries[reopenRateSeries.length - 1]

  const remainingBugDelta = currentBurndown
    ? currentBurndown.remaining -
      (previousBurndown?.remaining ?? currentBurndown.remaining)
    : 0
  const deltaDirection =
    remainingBugDelta === 0 ? '' : remainingBugDelta > 0 ? '+' : '-'
  const deltaValue = Math.abs(remainingBugDelta)

  return {
    meta: {
      currentSprint: currentBurnup?.sprint ?? '--',
    },
    milestoneProgress: {
      completed: currentBurnup?.completed ?? 0,
      total: currentBurnup?.scope ?? 0,
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
      count:
        currentBurndown?.remaining ??
        Math.max(
          Number(milestone.total_bug) - Number(milestone.resolved_bug),
          0,
        ),
      deltaText:
        deltaValue === 0
          ? 'No change vs previous sprint'
          : `${deltaDirection}${deltaValue} vs previous sprint`,
    },
    bugFixRate: {
      value:
        currentVelocity?.rate ??
        (Number(milestone.total_bug) > 0
          ? Number(
              (
                Number(milestone.resolved_bug) / Number(milestone.total_bug)
              ).toFixed(2),
            )
          : 0),
      target: currentVelocity?.target ?? DEFAULT_FIX_RATE_TARGET,
    },
    reopenRate: {
      value: currentReopenRate?.rate ?? 0,
      target: currentReopenRate?.target ?? DEFAULT_REOPEN_RATE_TARGET,
    },
    burnup,
    burndown,
    velocity,
    reopenRateSeries,
  }
}
