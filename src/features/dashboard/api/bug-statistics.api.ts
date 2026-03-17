import { useMemo } from 'react'

import { useQuery } from '@tanstack/react-query'

import { useDashboardFilters } from '@/features/dashboard/hooks/useDashboardFilters'
import { mapBugStatistics } from '@/features/dashboard/mappers/bug-statistics.mapper'
import { useDashboardDataSourceStore } from '@/features/dashboard/stores/dashboard-data-source.store'
import { dashboardService } from '@/services/dashboard.service'
import { jqlService } from '@/services/jql.service'

export const useBugStatisticsQuery = () => {
  const { selectedMilestoneId } = useDashboardFilters()
  const { appliedJql, sourceMode } = useDashboardDataSourceStore()
  const isJqlMode = sourceMode === 'jql'
  const isJqlModeActive = isJqlMode && Boolean(appliedJql)

  const milestoneQuery = useQuery({
    queryKey: ['milestone-bug-statistics', selectedMilestoneId],
    enabled: sourceMode === 'record' && selectedMilestoneId !== null,
    queryFn: () =>
      dashboardService.getMilestoneBugStatistics(selectedMilestoneId as number),
  })

  const customJqlQuery = useQuery({
    queryKey: ['custom-jql-bug-statistics', appliedJql],
    enabled: isJqlModeActive,
    placeholderData: (previousData) => previousData,
    queryFn: () => jqlService.getCustomJqlBugStatistics(appliedJql as string),
  })

  const activeQuery = isJqlModeActive ? customJqlQuery : milestoneQuery

  const data = useMemo(() => {
    if (isJqlModeActive) {
      return customJqlQuery.data
        ? mapBugStatistics(customJqlQuery.data)
        : undefined
    }

    return milestoneQuery.data
      ? mapBugStatistics(milestoneQuery.data)
      : undefined
  }, [customJqlQuery.data, isJqlModeActive, milestoneQuery.data])

  return {
    ...activeQuery,
    data,
    isJqlDraftMode: isJqlMode && !appliedJql,
    isJqlMode,
    isUsingJqlResults: isJqlModeActive,
  }
}
