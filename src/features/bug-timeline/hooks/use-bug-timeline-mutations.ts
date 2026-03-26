import { useMutation, useQueryClient } from '@tanstack/react-query'

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
  BugTrackerPackagePayload,
  BugTrackerProjectPayload,
} from '@/features/bug-timeline/types/bug-timeline.types'

export function useBugTimelineMutations() {
  const queryClient = useQueryClient()

  const invalidateProjects = () =>
    queryClient.invalidateQueries({ queryKey: bugTimelineQueryKeys.projects() })

  const invalidatePackages = (projectId: number) =>
    Promise.all([
      queryClient.invalidateQueries({
        queryKey: bugTimelineQueryKeys.packages(),
      }),
      queryClient.invalidateQueries({
        queryKey: bugTimelineQueryKeys.packages(projectId),
      }),
      invalidateProjects(),
    ])

  const createProject = useMutation({
    mutationFn: (payload: BugTrackerProjectPayload) =>
      createBugTrackerProject(payload),
    onSuccess: async () => {
      await invalidateProjects()
    },
  })

  const updateProject = useMutation({
    mutationFn: ({
      projectId,
      payload,
    }: {
      projectId: number
      payload: Partial<BugTrackerProjectPayload>
    }) => updateBugTrackerProject(projectId, payload),
    onSuccess: async (_, variables) => {
      await Promise.all([
        invalidateProjects(),
        queryClient.invalidateQueries({
          queryKey: bugTimelineQueryKeys.project(variables.projectId),
        }),
      ])
    },
  })

  const removeProject = useMutation({
    mutationFn: (projectId: number) => deleteBugTrackerProject(projectId),
    onSuccess: async (_, projectId) => {
      await Promise.all([
        invalidateProjects(),
        queryClient.invalidateQueries({
          queryKey: bugTimelineQueryKeys.packages(),
        }),
        queryClient.removeQueries({
          queryKey: bugTimelineQueryKeys.packages(projectId),
        }),
      ])
    },
  })

  const createPackage = useMutation({
    mutationFn: ({ payload }: { payload: BugTrackerPackagePayload }) =>
      createProjectPackage(payload),
    onSuccess: async (_, variables) => {
      await invalidatePackages(variables.payload.bug_tracker_project)
    },
  })

  const updatePackage = useMutation({
    mutationFn: ({
      packageId,
      payload,
    }: {
      packageId: number
      payload: Partial<BugTrackerPackagePayload>
    }) => updateProjectPackage(packageId, payload),
    onSuccess: async (updatedPackage, variables) => {
      await Promise.all([
        invalidatePackages(updatedPackage.bug_tracker_project),
        queryClient.invalidateQueries({
          queryKey: bugTimelineQueryKeys.package(variables.packageId),
        }),
      ])
    },
  })

  const removePackage = useMutation({
    mutationFn: ({ packageId }: { projectId: number; packageId: number }) =>
      deleteProjectPackage(packageId),
    onSuccess: async (_, variables) => {
      await Promise.all([
        invalidatePackages(variables.projectId),
        queryClient.removeQueries({
          queryKey: bugTimelineQueryKeys.package(variables.packageId),
        }),
      ])
    },
  })

  return {
    createProject,
    updateProject,
    removeProject,
    createPackage,
    updatePackage,
    removePackage,
  }
}
