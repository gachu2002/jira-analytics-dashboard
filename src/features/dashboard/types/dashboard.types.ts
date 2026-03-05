export type BurnupPoint = {
  sprint: string
  completed: number
  ideal: number
  scope: number
  startDate?: string
  endDate?: string
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
}

export type ApiUser = {
  id: number
  username: string
  email: string
  is_superuser: boolean
  is_staff: boolean
  is_active: boolean
  cn: string
  name: string
  display_name_printable: string
  title: string
  department: string
  desc: string
}

export type ProjectDto = {
  id: number
  pm: ApiUser
  pl: ApiUser
  name: string
  key: string
  description: string
  members: string
  labels: string
}

export type MilestoneDto = {
  id: number
  name: string
  description: string
  start_date: string
  end_date: string
  closed_ticket: number
  total_ticket: number
  resolved_bug: number
  total_bug: number
  project: number
}

export type MilestoneProgressDto = {
  id: number
  sprint: number
  start_date: string
  end_date: string
  completed_point: number
  scope_point: number
  ideal_point: number
  created_at: string
  milestone: number
}
