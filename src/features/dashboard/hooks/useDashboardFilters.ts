import { useEffect, useMemo } from 'react'

import { useQuery } from '@tanstack/react-query'

import { useDashboardFiltersStore } from '@/features/dashboard/stores/dashboard-filters.store'
import { toSprintLabel } from '@/features/dashboard/utils/sprint'
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
  const selectedSprint = useDashboardFiltersStore(
    (state) => state.selectedSprint,
  )
  const setSelectedSprint = useDashboardFiltersStore(
    (state) => state.setSelectedSprint,
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
    enabled: milestoneId !== null,
    queryFn: () => dashboardService.getMilestoneSprints(milestoneId as number),
  })

  const sprints = useMemo(
    () =>
      [...(sprintsQuery.data ?? [])].sort(
        (left, right) => Number(left.sprint) - Number(right.sprint),
      ),
    [sprintsQuery.data],
  )

  const sprint = sprints.some((item) => item.sprint === selectedSprint)
    ? selectedSprint
    : (sprints[sprints.length - 1]?.sprint ?? null)

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
    if (sprint !== selectedSprint && sprint !== null) {
      setSelectedSprint(sprint)
    }

    if (sprint === null && selectedSprint !== null) {
      setSelectedSprint(null)
    }
  }, [selectedSprint, setSelectedSprint, sprint])

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
    selectedSprint: sprint,
    selectedSprintLabel: toSprintLabel(sprint),
    selectedMilestone,
    sprintRange,
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
