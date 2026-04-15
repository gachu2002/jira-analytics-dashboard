import type {
  TimelineDeleteTarget,
  TimelineInspectorMode,
  TimelineIssue,
  TimelinePackageBar,
  TimelineSelectedEntity,
  TimelineZoomLevel as WorkspaceTimelineZoomLevel,
  TimelineProjectGroup as WorkspaceTimelineProjectGroup,
} from '@/features/timeline-workspace/types/timeline-workspace.types'

export type DashboardProject = {
  id: number
  name: string
  description: string
  pm: number | null
  pl: number | null
}

export type DashboardProjectPayload = {
  name: string
  description: string
  pm: number
  pl: number
}

export type DashboardMilestone = {
  id: number
  name: string
  description: string
  start_date: string
  end_date: string
  resolved_bug: number
  total_bug: number
  jql: string
  issues: DashboardIssue[]
  bug_tracker_project: number
  keys: string
  labels: string
  members: string
  task_id: string | null
  sync_status?: string | null
}

export type DashboardIssue = TimelineIssue

export type DashboardMilestonePayload = {
  name: string
  description: string
  start_date: string
  end_date: string
  keys: string
  labels: string
  members: string
  bug_tracker_project: number
}

export type DashboardMilestoneSprintStatistic = {
  id: number
  sprint: {
    id: number
    name: string
    start_date: string
    end_date: string
  }
  completed_point: number
  scope_point: number
  created_at: string
  active: boolean
  milestone: number
}

export type TimelineZoomLevel = WorkspaceTimelineZoomLevel

export type TimelineMilestoneBar = TimelinePackageBar

export type TimelineProjectGroup = WorkspaceTimelineProjectGroup

export type MilestoneTimelineSelectedEntity = TimelineSelectedEntity

export type MilestoneTimelineInspectorMode = TimelineInspectorMode

export type MilestoneTimelineDeleteTarget = TimelineDeleteTarget
