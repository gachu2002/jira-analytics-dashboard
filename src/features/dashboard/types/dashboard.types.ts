export type BurnupPoint = {
  sprint: string
  completed: number
  ideal: number
  scope: number
}

export type BurndownPoint = {
  sprint: string
  remaining: number
  ideal: number
}

export type VelocityPoint = {
  sprint: string
  newBugs: number
  resolvedBugs: number
  rate: number
}

export type ReopenRatePoint = {
  sprint: string
  rate: number
  target: number
  resolved: number
  reopened: number
}

export type DashboardData = {
  milestoneProgress: {
    completed: number
    total: number
    completionPercent: number
  }
  remainingBugs: {
    count: number
    deltaText: string
  }
  bugFixRate: {
    value: number
    target: number
  }
  reopenRate: {
    value: number
    target: number
  }
  burnup: BurnupPoint[]
  burndown: BurndownPoint[]
  velocity: VelocityPoint[]
  reopenRateSeries: ReopenRatePoint[]
  filters: string[]
  jql: string
}
