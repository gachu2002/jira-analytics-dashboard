import { useEffect, useMemo } from 'react'

import { useQuery } from '@tanstack/react-query'

import { useDashboardFiltersStore } from '@/features/dashboard/stores/dashboard-filters.store'
import { dashboardService } from '@/services/dashboard.service'

export const useDashboardFilters = () => {
  const selectedProjectId = useDashboardFiltersStore(
    (state) => state.selectedProjectId,
  )
  const selectedMilestoneId = useDashboardFiltersStore(
    (state) => state.selectedMilestoneId,
  )
  const setSelectedProjectId = useDashboardFiltersStore(
    (state) => state.setSelectedProjectId,
  )
  const setSelectedMilestoneId = useDashboardFiltersStore(
    (state) => state.setSelectedMilestoneId,
  )

  const projectsQuery = useQuery({
    queryKey: ['projects'],
    queryFn: dashboardService.getProjects,
  })

  const projectId = selectedProjectId ?? projectsQuery.data?.[0]?.id ?? null

  const milestonesQuery = useQuery({
    queryKey: ['milestones', projectId],
    enabled: projectId !== null,
    queryFn: () => dashboardService.getMilestones(projectId as number),
  })

  const milestoneId =
    selectedMilestoneId ?? milestonesQuery.data?.[0]?.id ?? null

  useEffect(() => {
    if (selectedProjectId === null && projectId !== null) {
      setSelectedProjectId(projectId)
    }
  }, [projectId, selectedProjectId, setSelectedProjectId])

  useEffect(() => {
    if (selectedMilestoneId === null && milestoneId !== null) {
      setSelectedMilestoneId(milestoneId)
    }
  }, [milestoneId, selectedMilestoneId, setSelectedMilestoneId])

  const selectedMilestone = useMemo(
    () => milestonesQuery.data?.find((item) => item.id === milestoneId) ?? null,
    [milestoneId, milestonesQuery.data],
  )

  const sprintRange = selectedMilestone
    ? `${selectedMilestone.start_date} - ${selectedMilestone.end_date}`
    : '--'

  return {
    selectedProjectId: projectId,
    selectedMilestoneId: milestoneId,
    selectedMilestone,
    sprintRange,
    projects: projectsQuery.data ?? [],
    milestones: milestonesQuery.data ?? [],
    isLoading: projectsQuery.isLoading || milestonesQuery.isLoading,
    setSelectedProjectId,
    setSelectedMilestoneId,
  }
}
