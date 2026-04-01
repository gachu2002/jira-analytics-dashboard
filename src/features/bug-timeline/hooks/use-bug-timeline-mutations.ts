import {
  createBugTrackerProject,
  createProjectPackage,
  deleteBugTrackerProject,
  deleteProjectPackage,
  updateBugTrackerProject,
  updateProjectPackage,
} from '@/features/bug-timeline/api/bug-timeline.api'
import { bugTimelineQueryKeys } from '@/features/bug-timeline/api/bug-timeline.queries'
import type {
  BugTrackerPackage,
  BugTrackerPackagePayload,
  BugTrackerProject,
  BugTrackerProjectPayload,
} from '@/features/bug-timeline/types/bug-timeline.types'
import { createTimelineCrudMutations } from '@/features/timeline-workspace/hooks/create-timeline-crud-mutations'

export const useBugTimelineMutations = createTimelineCrudMutations<
  BugTrackerProject,
  BugTrackerProjectPayload,
  BugTrackerPackage,
  BugTrackerPackagePayload
>({
  queryKeys: bugTimelineQueryKeys,
  createProject: createBugTrackerProject,
  updateProject: updateBugTrackerProject,
  deleteProject: deleteBugTrackerProject,
  createPackage: createProjectPackage,
  updatePackage: updateProjectPackage,
  deletePackage: deleteProjectPackage,
  getPackageProjectId: (pkg) => pkg.bug_tracker_project,
  getPayloadProjectId: (payload) => payload.bug_tracker_project,
})
