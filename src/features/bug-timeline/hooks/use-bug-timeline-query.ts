import { useMemo } from 'react'

import {
  useBugTrackerPackagesQuery,
  useBugTrackerProjectsQuery,
} from '@/features/bug-timeline/api/bug-timeline.queries'
import { useBugTimelineUiStore } from '@/features/bug-timeline/stores/bug-timeline-ui.store'
import { useTimelineSyncStatus } from '@/features/timeline-workspace/hooks/use-timeline-sync-status'
import { buildTimelineViewModel } from '@/features/timeline-workspace/model/build-timeline-view-model'

export function useBugTimelineQuery() {
  const zoom = useBugTimelineUiStore((state) => state.zoom)
  const search = useBugTimelineUiStore((state) => state.search)
  const projectsQuery = useBugTrackerProjectsQuery()
  const packagesQuery = useBugTrackerPackagesQuery()
  const syncStatusByTaskId = useTimelineSyncStatus(
    (packagesQuery.data ?? []).map((item) => item.task_id),
  )

  const packages = useMemo(
    () =>
      (packagesQuery.data ?? []).map((item) => ({
        ...item,
        sync_status: item.task_id
          ? (syncStatusByTaskId.get(item.task_id) ?? 'syncing')
          : null,
      })),
    [packagesQuery.data, syncStatusByTaskId],
  )

  const viewModel = useMemo(() => {
    return buildTimelineViewModel(
      projectsQuery.data ?? [],
      packages,
      zoom,
      search,
    )
  }, [packages, projectsQuery.data, search, zoom])

  return {
    projects: projectsQuery.data ?? [],
    packages,
    viewModel,
    isPending: projectsQuery.isPending || packagesQuery.isPending,
    isError: projectsQuery.isError || packagesQuery.isError,
  }
}
