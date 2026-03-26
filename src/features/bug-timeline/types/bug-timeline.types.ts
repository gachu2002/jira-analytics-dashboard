export type BugTrackerProject = {
  id: number
  name: string
}

export type BugTrackerProjectPayload = {
  name: string
}

export type BugTrackerPackage = {
  id: number
  name: string
  keys: string
  labels: string
  members: string
  jql: string
  start_date: string
  end_date: string
  resolved_bug: number
  total_bug: number
  issues: BugTrackerIssue[]
  bug_tracker_project: number
}

export type BugTrackerIssue = {
  url: string
  key: string
  summary: string
  assignee: string
  status: string
}

export type BugTrackerBugCategory = {
  id: number
  name: string
}

export type PackageBugStatistic = {
  id: number
  bug_category: BugTrackerBugCategory
  number_of_bugs: number
  created_at: string
  active: boolean
  package: number
}

export type BugTrackerPackagePayload = {
  name: string
  keys: string
  labels: string
  members: string
  jql: string
  start_date: string
  end_date: string
  bug_tracker_project: number
}

export type TimelineZoomLevel = 'month' | 'quarter' | 'half'

export type TimelineColumn = {
  key: string
  label: string
  shortLabel: string
  start: Date
  end: Date
}

export type TimelinePackageBar = {
  id: number
  projectId: number
  name: string
  leftPercent: number
  widthPercent: number
  startDate: string
  endDate: string
  resolvedBug: number
  totalBug: number
  progress: number
  members: string[]
  labels: string[]
  keys: string[]
  jql: string
  health: 'healthy' | 'watch' | 'risk'
}

export type TimelineProjectGroup = {
  id: number
  name: string
  packageCount: number
  totalBug: number
  resolvedBug: number
  packages: TimelinePackageBar[]
}

export type BugTimelineViewModel = {
  rangeStart: Date
  rangeEnd: Date
  columns: TimelineColumn[]
  projects: TimelineProjectGroup[]
  totals: {
    projects: number
    packages: number
    bugs: number
    resolved: number
  }
}

export type BugTimelineSelectedEntity =
  | { type: 'project'; projectId: number }
  | { type: 'package'; projectId: number; packageId: number }

export type BugTimelineInspectorMode =
  | 'view-project'
  | 'edit-project'
  | 'create-project'
  | 'view-package'
  | 'edit-package'
  | 'create-package'

export type BugTimelineDeleteTarget =
  | { type: 'project'; projectId: number; name: string }
  | { type: 'package'; projectId: number; packageId: number; name: string }
