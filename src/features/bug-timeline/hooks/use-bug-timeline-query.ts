import { useMemo } from 'react'

import {
  useBugTrackerPackagesQuery,
  useBugTrackerProjectsQuery,
} from '@/features/bug-timeline/api/bug-timeline.queries'
import { useBugTimelineUiStore } from '@/features/bug-timeline/stores/bug-timeline-ui.store'
import { buildTimelineViewModel } from '@/features/timeline-workspace/model/build-timeline-view-model'

export function useBugTimelineQuery() {
  const zoom = useBugTimelineUiStore((state) => state.zoom)
  const search = useBugTimelineUiStore((state) => state.search)
  const projectsQuery = useBugTrackerProjectsQuery()
  const packagesQuery = useBugTrackerPackagesQuery()

  const viewModel = useMemo(() => {
    return buildTimelineViewModel(
      projectsQuery.data ?? [],
      packagesQuery.data ?? [],
      zoom,
      search,
    )
  }, [packagesQuery.data, projectsQuery.data, search, zoom])

  return {
    projects: projectsQuery.data ?? [],
    packages: packagesQuery.data ?? [],
    viewModel,
    isPending: projectsQuery.isPending || packagesQuery.isPending,
    isError: projectsQuery.isError || packagesQuery.isError,
  }
}
