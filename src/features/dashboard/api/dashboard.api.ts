import { useMemo } from 'react'

import { useQuery } from '@tanstack/react-query'

import { useDashboardFilters } from '@/features/dashboard/hooks/useDashboardFilters'
import { mapDashboardData } from '@/features/dashboard/mappers/dashboard.mapper'
import { useDashboardDataSourceStore } from '@/features/dashboard/stores/dashboard-data-source.store'
import { dashboardService } from '@/services/dashboard.service'
import { jqlService } from '@/services/jql.service'

export const useDashboardQuery = () => {
  const { milestones, selectedMilestoneId, selectedProjectId } =
    useDashboardFilters()
  const { appliedJql, sourceMode } = useDashboardDataSourceStore()
  const isJqlModeActive = sourceMode === 'jql' && Boolean(appliedJql)

  const milestoneSprintsQuery = useQuery({
    queryKey: ['milestone-sprints', selectedMilestoneId],
    enabled:
      (sourceMode === 'record' || !isJqlModeActive) &&
      selectedProjectId !== null &&
      selectedMilestoneId !== null,
    queryFn: () =>
      dashboardService.getMilestoneSprints(selectedMilestoneId as number),
  })

  const customJqlQuery = useQuery({
    queryKey: ['custom-jql-dashboard', appliedJql],
    enabled: isJqlModeActive,
    queryFn: () => jqlService.executeCustomJql(appliedJql as string),
  })

  const data = useMemo(() => {
    if (isJqlModeActive) {
      if (!customJqlQuery.data) {
        return undefined
      }

      return mapDashboardData({
        summary: customJqlQuery.data,
        sprints: customJqlQuery.data.sprints,
      })
    }

    const milestone = milestones.find((item) => item.id === selectedMilestoneId)

    if (!milestone || !milestoneSprintsQuery.data) {
      return undefined
    }

    return mapDashboardData({
      summary: milestone,
      sprints: milestoneSprintsQuery.data,
    })
  }, [
    customJqlQuery.data,
    milestoneSprintsQuery.data,
    milestones,
    selectedMilestoneId,
    isJqlModeActive,
  ])

  const activeQuery = isJqlModeActive ? customJqlQuery : milestoneSprintsQuery

  return {
    ...activeQuery,
    data,
  }
}
