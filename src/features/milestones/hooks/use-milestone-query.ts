import { useMemo } from 'react'

import {
  useDashboardMilestonesQuery,
  useDashboardProjectsQuery,
} from '@/features/milestones/api/milestone.queries'
import { useMilestoneTimelineUiStore } from '@/features/milestones/stores/milestone-ui.store'
import { useTimelineSyncStatus } from '@/features/timeline-workspace/hooks/use-timeline-sync-status'
import { buildTimelineViewModel } from '@/features/timeline-workspace/model/build-timeline-view-model'

export function useMilestoneTimelineQuery() {
  const zoom = useMilestoneTimelineUiStore((state) => state.zoom)
  const search = useMilestoneTimelineUiStore((state) => state.search)
  const projectsQuery = useDashboardProjectsQuery()
  const milestonesQuery = useDashboardMilestonesQuery()
  const syncStatusByTaskId = useTimelineSyncStatus(
    (milestonesQuery.data ?? []).map((item) => item.task_id),
  )

  const milestones = useMemo(() => {
    const projectsById = new Map(
      (projectsQuery.data ?? []).map((project) => [project.id, project]),
    )

    return (milestonesQuery.data ?? []).map((milestone) => {
      const project = projectsById.get(milestone.bug_tracker_project)

      return {
        ...milestone,
        keys: project?.keys ?? '',
        labels: project?.labels ?? '',
        members: project?.members ?? '',
        sync_status: milestone.task_id
          ? (syncStatusByTaskId.get(milestone.task_id) ?? 'PROCESSING')
          : null,
      }
    })
  }, [milestonesQuery.data, projectsQuery.data, syncStatusByTaskId])

  const viewModel = useMemo(() => {
    return buildTimelineViewModel(
      projectsQuery.data ?? [],
      milestones,
      zoom,
      search,
    )
  }, [milestones, projectsQuery.data, search, zoom])

  return {
    projects: projectsQuery.data ?? [],
    packages: milestones,
    viewModel,
    isPending: projectsQuery.isPending || milestonesQuery.isPending,
    isError: projectsQuery.isError || milestonesQuery.isError,
  }
}
