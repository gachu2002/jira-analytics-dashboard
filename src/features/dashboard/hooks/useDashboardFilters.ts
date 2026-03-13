import { useEffect, useMemo } from 'react'

import { useQuery } from '@tanstack/react-query'

import { useDashboardFiltersStore } from '@/features/dashboard/stores/dashboard-filters.store'
import { useDashboardDataSourceStore } from '@/features/dashboard/stores/dashboard-data-source.store'
import { sortSprints } from '@/features/dashboard/utils/sprint'
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
  const selectedRecordSprint = useDashboardFiltersStore(
    (state) => state.selectedSprint,
  )
  const setSelectedRecordSprint = useDashboardFiltersStore(
    (state) => state.setSelectedSprint,
  )
  const sourceMode = useDashboardDataSourceStore((state) => state.sourceMode)
  const selectedJqlSprint = useDashboardDataSourceStore(
    (state) => state.selectedJqlSprint,
  )
  const setSelectedJqlSprint = useDashboardDataSourceStore(
    (state) => state.setSelectedJqlSprint,
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

  const milestoneId = milestonesQuery.data?.some(
    (item) => item.id === selectedMilestoneId,
  )
    ? selectedMilestoneId
    : (milestonesQuery.data?.[0]?.id ?? null)

  const sprintsQuery = useQuery({
    queryKey: ['milestone-sprints', milestoneId],
    enabled: sourceMode === 'record' && milestoneId !== null,
    queryFn: () => dashboardService.getMilestoneSprints(milestoneId as number),
  })

  const sprints = useMemo(
    () => sortSprints(sprintsQuery.data ?? []),
    [sprintsQuery.data],
  )

  const sprint = sprints.some((item) => item.sprint.id === selectedRecordSprint)
    ? selectedRecordSprint
    : (sprints.find((item) => item.active)?.sprint.id ??
      sprints[sprints.length - 1]?.sprint.id ??
      null)

  const selectedSprint = sourceMode === 'jql' ? selectedJqlSprint : sprint

  const setSelectedSprint = (nextSprint: number | null) => {
    if (sourceMode === 'jql') {
      setSelectedJqlSprint(nextSprint)
      return
    }

    setSelectedRecordSprint(nextSprint)
  }

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

  useEffect(() => {
    if (sourceMode !== 'record') {
      return
    }

    if (sprint !== selectedRecordSprint && sprint !== null) {
      setSelectedRecordSprint(sprint)
    }

    if (sprint === null && selectedRecordSprint !== null) {
      setSelectedRecordSprint(null)
    }
  }, [selectedRecordSprint, setSelectedRecordSprint, sourceMode, sprint])

  const selectedMilestone = useMemo(
    () => milestonesQuery.data?.find((item) => item.id === milestoneId) ?? null,
    [milestoneId, milestonesQuery.data],
  )

  return {
    selectedProjectId: projectId,
    selectedMilestoneId: milestoneId,
    selectedSprint,
    selectedMilestone,
    projects: projectsQuery.data ?? [],
    milestones: milestonesQuery.data ?? [],
    sprints,
    isLoading:
      projectsQuery.isLoading ||
      milestonesQuery.isLoading ||
      sprintsQuery.isLoading,
    setSelectedProjectId,
    setSelectedMilestoneId,
    setSelectedSprint,
  }
}
