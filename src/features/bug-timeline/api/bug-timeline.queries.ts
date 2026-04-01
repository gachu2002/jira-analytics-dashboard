import { useQuery } from '@tanstack/react-query'

import {
  getAllProjectPackages,
  getBugTrackerProjects,
  getPackageBugStatistics,
  getPackageSprintStatistics,
} from '@/features/bug-timeline/api/bug-timeline.api'
import { createTimelineQueryKeys } from '@/features/timeline-workspace/utils/create-timeline-query-keys'

const timelineQueryKeys = createTimelineQueryKeys('bug-timeline')

export const bugTimelineQueryKeys = {
  ...timelineQueryKeys,
  packageBugStatistics: (packageId: number) =>
    [...timelineQueryKeys.all, 'package-bug-statistics', packageId] as const,
  packageSprintStatistics: (packageId: number) =>
    [...timelineQueryKeys.all, 'package-sprint-statistics', packageId] as const,
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
