import { useMemo } from 'react'

import { useQuery } from '@tanstack/react-query'

import { useDashboardFilters } from '@/features/dashboard/hooks/useDashboardFilters'
import { mapDashboardData } from '@/features/dashboard/mappers/dashboard.mapper'
import { dashboardService } from '@/services/dashboard.service'

export const useDashboardQuery = () => {
  const { milestones, selectedMilestoneId, selectedProjectId } =
    useDashboardFilters()

  const sprintsQuery = useQuery({
    queryKey: ['milestone-sprints', selectedMilestoneId],
    enabled: selectedProjectId !== null && selectedMilestoneId !== null,
    queryFn: () =>
      dashboardService.getMilestoneSprints(selectedMilestoneId as number),
  })

  const data = useMemo(() => {
    const milestone = milestones.find((item) => item.id === selectedMilestoneId)

    if (!milestone || !sprintsQuery.data) {
      return undefined
    }

    return mapDashboardData({
      milestone,
      sprints: sprintsQuery.data,
    })
  }, [milestones, selectedMilestoneId, sprintsQuery.data])

  return {
    ...sprintsQuery,
    data,
  }
}
