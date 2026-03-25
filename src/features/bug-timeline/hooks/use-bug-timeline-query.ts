import { useMemo } from 'react'

import {
  useBugTrackerPackagesQueries,
  useBugTrackerProjectsQuery,
} from '@/features/bug-timeline/api/bug-timeline.queries'
import { buildBugTimelineViewModel } from '@/features/bug-timeline/model/bug-timeline-view-model'
import { useBugTimelineUiStore } from '@/features/bug-timeline/stores/bug-timeline-ui.store'

export function useBugTimelineQuery() {
  const zoom = useBugTimelineUiStore((state) => state.zoom)
  const search = useBugTimelineUiStore((state) => state.search)
  const projectsQuery = useBugTrackerProjectsQuery()
  const projectIds = projectsQuery.data?.map((project) => project.id) ?? []
  const packagesQuery = useBugTrackerPackagesQueries(projectIds)

  const viewModel = useMemo(() => {
    return buildBugTimelineViewModel(
      projectsQuery.data ?? [],
      packagesQuery.data,
      zoom,
      search,
    )
  }, [packagesQuery.data, projectsQuery.data, search, zoom])

  return {
    projects: projectsQuery.data ?? [],
    packages: packagesQuery.data,
    viewModel,
    isPending: projectsQuery.isPending || packagesQuery.isPending,
    isError: projectsQuery.isError || packagesQuery.isError,
  }
}
