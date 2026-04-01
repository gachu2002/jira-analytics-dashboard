import { useMutation, useQueryClient } from '@tanstack/react-query'

import type { TimelineQueryKeys } from '@/features/timeline-workspace/types/timeline-workspace.types'

type TimelineCrudConfig<TProject, TProjectPayload, TPackage, TPackagePayload> =
  {
    queryKeys: TimelineQueryKeys
    createProject: (payload: TProjectPayload) => Promise<TProject>
    updateProject: (
      projectId: number,
      payload: Partial<TProjectPayload>,
    ) => Promise<TProject>
    deleteProject: (projectId: number) => Promise<void>
    createPackage: (payload: TPackagePayload) => Promise<TPackage>
    updatePackage: (
      packageId: number,
      payload: Partial<TPackagePayload>,
    ) => Promise<TPackage>
    deletePackage: (packageId: number) => Promise<void>
    getPackageProjectId: (pkg: TPackage) => number
    getPayloadProjectId: (payload: TPackagePayload) => number
  }

export function createTimelineCrudMutations<
  TProject,
  TProjectPayload,
  TPackage,
  TPackagePayload,
>(
  config: TimelineCrudConfig<
    TProject,
    TProjectPayload,
    TPackage,
    TPackagePayload
  >,
) {
  return function useTimelineCrudMutations() {
    const queryClient = useQueryClient()

    const invalidateProjects = () =>
      queryClient.invalidateQueries({ queryKey: config.queryKeys.projects() })

    const invalidatePackages = (projectId: number) =>
      Promise.all([
        queryClient.invalidateQueries({
          queryKey: config.queryKeys.packages(),
        }),
        queryClient.invalidateQueries({
          queryKey: config.queryKeys.packages(projectId),
        }),
        invalidateProjects(),
      ])

    const createProject = useMutation({
      mutationFn: (payload: TProjectPayload) => config.createProject(payload),
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
        payload: Partial<TProjectPayload>
      }) => config.updateProject(projectId, payload),
      onSuccess: async (_, variables) => {
        await Promise.all([
          invalidateProjects(),
          queryClient.invalidateQueries({
            queryKey: config.queryKeys.project(variables.projectId),
          }),
        ])
      },
    })

    const removeProject = useMutation({
      mutationFn: (projectId: number) => config.deleteProject(projectId),
      onSuccess: async (_, projectId) => {
        await Promise.all([
          invalidateProjects(),
          queryClient.invalidateQueries({
            queryKey: config.queryKeys.packages(),
          }),
          queryClient.removeQueries({
            queryKey: config.queryKeys.packages(projectId),
          }),
        ])
      },
    })

    const createPackage = useMutation({
      mutationFn: ({ payload }: { payload: TPackagePayload }) =>
        config.createPackage(payload),
      onSuccess: async (_, variables) => {
        await invalidatePackages(config.getPayloadProjectId(variables.payload))
      },
    })

    const updatePackage = useMutation({
      mutationFn: ({
        packageId,
        payload,
      }: {
        packageId: number
        payload: Partial<TPackagePayload>
      }) => config.updatePackage(packageId, payload),
      onSuccess: async (updatedPackage, variables) => {
        await Promise.all([
          invalidatePackages(config.getPackageProjectId(updatedPackage)),
          queryClient.invalidateQueries({
            queryKey: config.queryKeys.package(variables.packageId),
          }),
        ])
      },
    })

    const removePackage = useMutation({
      mutationFn: ({ packageId }: { projectId: number; packageId: number }) =>
        config.deletePackage(packageId),
      onSuccess: async (_, variables) => {
        await Promise.all([
          invalidatePackages(variables.projectId),
          queryClient.removeQueries({
            queryKey: config.queryKeys.package(variables.packageId),
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
}
