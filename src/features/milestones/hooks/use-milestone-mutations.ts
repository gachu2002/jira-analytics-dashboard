import {
  createDashboardProject,
  createProjectMilestone,
  deleteDashboardProject,
  deleteProjectMilestone,
  updateDashboardProject,
  updateProjectMilestone,
} from '@/features/milestones/api/milestone.api'
import { milestoneTimelineQueryKeys } from '@/features/milestones/api/milestone.queries'
import type {
  DashboardMilestone,
  DashboardMilestonePayload,
  DashboardProject,
  DashboardProjectPayload,
} from '@/features/milestones/types/milestone.types'
import { createTimelineCrudMutations } from '@/features/timeline-workspace/hooks/create-timeline-crud-mutations'

export const useMilestoneTimelineMutations = createTimelineCrudMutations<
  DashboardProject,
  DashboardProjectPayload,
  DashboardMilestone,
  DashboardMilestonePayload
>({
  queryKeys: milestoneTimelineQueryKeys,
  createProject: createDashboardProject,
  updateProject: updateDashboardProject,
  deleteProject: deleteDashboardProject,
  createPackage: createProjectMilestone,
  updatePackage: updateProjectMilestone,
  deletePackage: deleteProjectMilestone,
  getPackageProjectId: (pkg) => pkg.bug_tracker_project,
  getPayloadProjectId: (payload) => payload.bug_tracker_project,
})
