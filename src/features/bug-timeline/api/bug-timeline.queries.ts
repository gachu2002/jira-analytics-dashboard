import { useQuery } from '@tanstack/react-query'

import {
  getAllProjectPackages,
  getBugTrackerProjects,
  getBugTrackerProject,
  getPackageBugStatistics,
  getPackageSprintStatistics,
  getProjectPackage,
} from '@/features/bug-timeline/api/bug-timeline.api'

export const bugTimelineQueryKeys = {
  all: ['bug-timeline'] as const,
  projects: () => [...bugTimelineQueryKeys.all, 'projects'] as const,
  project: (projectId: number) =>
    [...bugTimelineQueryKeys.all, 'project', projectId] as const,
  packages: (projectId?: number) =>
    projectId === undefined
      ? ([...bugTimelineQueryKeys.all, 'packages'] as const)
      : ([...bugTimelineQueryKeys.all, 'packages', projectId] as const),
  package: (packageId: number) =>
    [...bugTimelineQueryKeys.all, 'package', packageId] as const,
  packageBugStatistics: (packageId: number) =>
    [...bugTimelineQueryKeys.all, 'package-bug-statistics', packageId] as const,
  packageSprintStatistics: (packageId: number) =>
    [
      ...bugTimelineQueryKeys.all,
      'package-sprint-statistics',
      packageId,
    ] as const,
}

export function useBugTrackerProjectsQuery() {
  return useQuery({
    queryKey: bugTimelineQueryKeys.projects(),
    queryFn: getBugTrackerProjects,
  })
}

export function useBugTrackerPackagesQuery() {
  return useQuery({
    queryKey: bugTimelineQueryKeys.packages(),
    queryFn: getAllProjectPackages,
  })
}

export function useBugTrackerProjectQuery(projectId: number, enabled = true) {
  return useQuery({
    queryKey: bugTimelineQueryKeys.project(projectId),
    queryFn: () => getBugTrackerProject(projectId),
    enabled,
  })
}

export function useProjectPackageQuery(packageId: number, enabled = true) {
  return useQuery({
    queryKey: bugTimelineQueryKeys.package(packageId),
    queryFn: () => getProjectPackage(packageId),
    enabled,
  })
}

export function usePackageBugStatisticsQuery(
  packageId: number,
  enabled = true,
) {
  return useQuery({
    queryKey: bugTimelineQueryKeys.packageBugStatistics(packageId),
    queryFn: () => getPackageBugStatistics(packageId),
    enabled,
  })
}

export function usePackageSprintStatisticsQuery(
  packageId: number,
  enabled = true,
) {
  return useQuery({
    queryKey: bugTimelineQueryKeys.packageSprintStatistics(packageId),
    queryFn: () => getPackageSprintStatistics(packageId),
    enabled,
  })
}
