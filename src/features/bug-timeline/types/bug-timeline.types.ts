import type {
  TimelineDeleteTarget,
  TimelineInspectorMode,
  TimelineIssue,
  TimelineSelectedEntity,
  TimelineZoomLevel as WorkspaceTimelineZoomLevel,
  TimelinePackageBar as WorkspaceTimelinePackageBar,
  TimelineProjectGroup as WorkspaceTimelineProjectGroup,
} from '@/features/timeline-workspace/types/timeline-workspace.types'

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
  start_date: string
  end_date: string
  resolved_bug: number
  total_bug: number
  issues: BugTrackerIssue[]
  bug_tracker_project: number
}

export type BugTrackerIssue = TimelineIssue

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

export type PackageSprintStatistic = {
  id: number
  resolved_bug: number
  total_bug: number
  new_bug: number
  resolved_bug_velocity: number
  target_bug_velocity: number
  target_reopened_rate: number
  resolved_bug_reopened: number
  reopened_bug: number
  created_at: string
  active: boolean
  package: number
  sprint: number
}

export type BugTrackerPackagePayload = {
  name: string
  keys: string
  labels: string
  members: string
  start_date: string
  end_date: string
  bug_tracker_project: number
}

export type TimelineZoomLevel = WorkspaceTimelineZoomLevel

export type TimelinePackageBar = WorkspaceTimelinePackageBar

export type TimelineProjectGroup = WorkspaceTimelineProjectGroup

export type BugTimelineSelectedEntity = TimelineSelectedEntity

export type BugTimelineInspectorMode = TimelineInspectorMode

export type BugTimelineDeleteTarget = TimelineDeleteTarget
