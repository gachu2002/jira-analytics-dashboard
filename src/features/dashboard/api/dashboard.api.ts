import { useQuery } from '@tanstack/react-query'

import { useDashboardFilters } from '@/features/dashboard/hooks/useDashboardFilters'
import { mapDashboardData } from '@/features/dashboard/mappers/dashboard.mapper'
import { dashboardService } from '@/services/dashboard.service'

export const useDashboardQuery = () => {
  const { milestones, selectedMilestoneId, selectedProjectId } =
    useDashboardFilters()

  return useQuery({
    queryKey: ['dashboard', selectedProjectId, selectedMilestoneId],
    enabled: selectedProjectId !== null && selectedMilestoneId !== null,
    queryFn: async () => {
      const milestone = milestones.find(
        (item) => item.id === selectedMilestoneId,
      )

      if (!milestone) {
        throw new Error('Missing dashboard context')
      }

      const progresses = await dashboardService.getMilestoneProgresses(
        selectedMilestoneId as number,
      )

      return mapDashboardData({
        milestone,
        progresses,
      })
    },
  })
}
