export type BurnupPoint = {
  sprintId: number
  sprint: string
  sprintNumber: number
  completed: number
  scope: number
  ideal: number
}

export type BurndownPoint = {
  sprintId: number
  sprint: string
  sprintNumber: number
  resolved: number
  total: number
  ideal: number
}

export type VelocityPoint = {
  sprintId: number
  sprint: string
  newBugs: number
  resolvedBugs: number
  rate: number
  target: number
}

export type ReopenRatePoint = {
  sprintId: number
  sprint: string
  rate: number
  target: number
  resolved: number
  reopened: number
}

export type BugStatisticPoint = {
  category: string
  count: number
  share: number
}

export type DashboardData = {
  meta: {
    currentSprint: string
  }
  milestoneProgress: {
    completed: number
    total: number
    completionPercent: number
  }
  remainingBugs: {
    count: number
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

export type SprintMetricsDto = {
  sprint: {
    id: number
    name: string
    start_date: string
    end_date: string
  }
  completed_point: number
  scope_point: number
  resolved_bug: number
  total_bug: number
  new_bug: number
  resolved_bug_velocity: number
  target_bug_velocity: number
  target_reopened_rate: number
  resolved_bug_reopened: number
  reopened_bug: number
}

export type MilestoneSprintDto = SprintMetricsDto & {
  id: number
  created_at: string
  active: boolean
  milestone: number
}

export type MilestoneJqlDto = {
  jql: string
}

export type MilestoneBugStatisticDto = {
  id: number
  bug_category: string
  number_of_bugs: number
  created_at: string
  active: boolean
  milestone: number
}

export type CustomJqlBugStatisticDto = {
  bug_category: string
  number_of_bugs: number
}

export type CustomJqlSummaryDto = {
  start_date: string
  end_date: string
  closed_ticket: number
  total_ticket: number
  resolved_bug: number
  total_bug: number
}

export type CustomJqlDashboardDto = {
  summary: CustomJqlSummaryDto
  sprints: SprintMetricsDto[]
}
