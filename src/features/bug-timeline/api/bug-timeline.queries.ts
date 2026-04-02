import { useQuery } from '@tanstack/react-query'

import {
  getCustomJqlBugStatistics,
  getCustomJqlPackage,
  getCustomJqlSprintStatistics,
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
  customJqlPackage: (jql: string) =>
    [...timelineQueryKeys.all, 'custom-jql-package', jql] as const,
  customJqlBugStatistics: (jql: string) =>
    [...timelineQueryKeys.all, 'custom-jql-bug-statistics', jql] as const,
  customJqlSprintStatistics: (jql: string) =>
    [...timelineQueryKeys.all, 'custom-jql-sprint-statistics', jql] as const,
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

export function useCustomJqlPackageQuery(jql: string, enabled = true) {
  return useQuery({
    queryKey: bugTimelineQueryKeys.customJqlPackage(jql),
    queryFn: () => getCustomJqlPackage(jql),
    enabled: enabled && Boolean(jql.trim()),
  })
}

export function useCustomJqlBugStatisticsQuery(jql: string, enabled = true) {
  return useQuery({
    queryKey: bugTimelineQueryKeys.customJqlBugStatistics(jql),
    queryFn: () => getCustomJqlBugStatistics(jql),
    enabled: enabled && Boolean(jql.trim()),
  })
}

export function useCustomJqlSprintStatisticsQuery(jql: string, enabled = true) {
  return useQuery({
    queryKey: bugTimelineQueryKeys.customJqlSprintStatistics(jql),
    queryFn: () => getCustomJqlSprintStatistics(jql),
    enabled: enabled && Boolean(jql.trim()),
  })
}
