import { useQuery } from '@tanstack/react-query'

import {
  getAllProjectMilestones,
  getDashboardProjects,
  getMilestoneSprintStatistics,
} from '@/features/milestones/api/milestone.api'
import { createTimelineQueryKeys } from '@/features/timeline-workspace/utils/create-timeline-query-keys'

const timelineQueryKeys = createTimelineQueryKeys('milestones')

export const milestoneTimelineQueryKeys = {
  ...timelineQueryKeys,
  milestoneSprintStatistics: (packageId: number) =>
    [...timelineQueryKeys.all, 'package-sprint-statistics', packageId] as const,
}

export function useDashboardProjectsQuery() {
  return useQuery({
    queryKey: milestoneTimelineQueryKeys.projects(),
    queryFn: getDashboardProjects,
  })
}

export function useDashboardMilestonesQuery() {
  return useQuery({
    queryKey: milestoneTimelineQueryKeys.packages(),
    queryFn: getAllProjectMilestones,
  })
}

export function useMilestoneSprintStatisticsQuery(
  packageId: number,
  enabled = true,
) {
  return useQuery({
    queryKey: milestoneTimelineQueryKeys.milestoneSprintStatistics(packageId),
    queryFn: () => getMilestoneSprintStatistics(packageId),
    enabled,
  })
}
