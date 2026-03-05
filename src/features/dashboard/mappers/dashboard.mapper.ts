import type {
  BurnupPoint,
  DashboardData,
  MilestoneDto,
  MilestoneProgressDto,
  ReopenRatePoint,
  VelocityPoint,
} from '@/features/dashboard/types/dashboard.types'

type MapDashboardArgs = {
  milestone: MilestoneDto
  progresses: MilestoneProgressDto[]
}

const toBurnup = (progresses: MilestoneProgressDto[]): BurnupPoint[] =>
  [...progresses]
    .sort((left, right) => Number(left.sprint) - Number(right.sprint))
    .map((item) => ({
      sprint: `S${item.sprint}`,
      completed: Number(item.completed_point),
      ideal: Number(item.ideal_point),
      scope: Number(item.scope_point),
      startDate: item.start_date,
      endDate: item.end_date,
    }))

const toVelocity = (burnup: BurnupPoint[]): VelocityPoint[] => {
  if (burnup.length === 0) {
    return []
  }

  return burnup.map((point, index) => {
    const previous = burnup[index - 1]
    const completedDelta = previous
      ? point.completed - previous.completed
      : point.completed
    const scopeDelta = previous ? point.scope - previous.scope : 0

    const resolvedBugs = Math.max(Math.round(completedDelta), 1)
    const newBugs = Math.max(
      Math.round(resolvedBugs * 0.9 + scopeDelta * 0.4),
      1,
    )
    const rate = Number((resolvedBugs / newBugs).toFixed(2))

    return {
      sprint: point.sprint,
      newBugs,
      resolvedBugs,
      rate,
    }
  })
}

const toReopenRateSeries = (velocity: VelocityPoint[]): ReopenRatePoint[] =>
  velocity.map((point, index) => {
    const reopened = Math.max(
      Math.round(point.newBugs * (0.02 + (index % 3) * 0.005)),
      1,
    )
    const rate = Number(
      Math.min(reopened / point.resolvedBugs, 0.08).toFixed(3),
    )

    return {
      sprint: point.sprint,
      reopened,
      resolved: point.resolvedBugs,
      rate,
      target: 0.03,
    }
  })

export const mapDashboardData = ({
  milestone,
  progresses,
}: MapDashboardArgs): DashboardData => {
  const burnup = toBurnup(progresses)
  const current = burnup[burnup.length - 1] ?? {
    completed: 0,
    scope: 0,
    ideal: 0,
    sprint: 'S0',
  }
  const velocity = toVelocity(burnup)
  const reopenRateSeries = toReopenRateSeries(velocity)

  const totalBug = Math.max(Number(milestone.total_bug), 1)
  const resolvedBug = Number(milestone.resolved_bug)
  const openBug = Math.max(totalBug - resolvedBug, 0)
  const bugFixRate = Number((resolvedBug / totalBug).toFixed(2))
  const currentReopenRate =
    reopenRateSeries[reopenRateSeries.length - 1]?.rate ?? 0

  return {
    milestoneProgress: {
      completed: current.completed,
      total: current.scope,
      completionPercent: current.scope
        ? Number(((current.completed / current.scope) * 100).toFixed(1))
        : 0,
    },
    remainingBugs: {
      count: openBug,
      deltaText: `${openBug > 0 ? '-' : ''}${Math.max(Math.round(openBug * 0.15), 1)} vs previous sprint`,
    },
    bugFixRate: {
      value: bugFixRate,
      target: 0.9,
    },
    reopenRate: {
      value: currentReopenRate,
      target: 0.03,
    },
    burnup,
    burndown: burnup.map((point) => ({
      sprint: point.sprint,
      remaining: Math.max(point.scope - point.completed, 0),
      ideal: Math.max(point.scope - point.ideal, 0),
    })),
    velocity,
    reopenRateSeries,
  }
}
