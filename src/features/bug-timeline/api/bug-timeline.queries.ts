import { useQueries, useQuery } from '@tanstack/react-query'

import {
  getBugTrackerProjects,
  getBugTrackerProject,
  getProjectPackage,
  getProjectPackages,
} from '@/features/bug-timeline/api/bug-timeline.api'
import type { BugTrackerPackage } from '@/features/bug-timeline/types/bug-timeline.types'

export const bugTimelineQueryKeys = {
  all: ['bug-timeline'] as const,
  projects: () => [...bugTimelineQueryKeys.all, 'projects'] as const,
  project: (projectId: number) =>
    [...bugTimelineQueryKeys.all, 'project', projectId] as const,
  packages: (projectId: number) =>
    [...bugTimelineQueryKeys.all, 'packages', projectId] as const,
  package: (projectId: number, packageId: number) =>
    [...bugTimelineQueryKeys.all, 'package', projectId, packageId] as const,
}

export function useBugTrackerProjectsQuery() {
  return useQuery({
    queryKey: bugTimelineQueryKeys.projects(),
    queryFn: getBugTrackerProjects,
  })
}

export function useBugTrackerPackagesQueries(projectIds: number[]) {
  return useQueries({
    queries: projectIds.map((projectId) => ({
      queryKey: bugTimelineQueryKeys.packages(projectId),
      queryFn: () => getProjectPackages(projectId),
    })),
    combine: (results) => ({
      data: results.flatMap(
        (result) => result.data ?? [],
      ) as BugTrackerPackage[],
      isPending: results.some((result) => result.isPending),
      isError: results.some((result) => result.isError),
    }),
  })
}

export function useBugTrackerProjectQuery(projectId: number, enabled = true) {
  return useQuery({
    queryKey: bugTimelineQueryKeys.project(projectId),
    queryFn: () => getBugTrackerProject(projectId),
    enabled,
  })
}

export function useProjectPackageQuery(
  projectId: number,
  packageId: number,
  enabled = true,
) {
  return useQuery({
    queryKey: bugTimelineQueryKeys.package(projectId, packageId),
    queryFn: () => getProjectPackage(projectId, packageId),
    enabled,
  })
}
