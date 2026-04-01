import type { TimelineQueryKeys } from '@/features/timeline-workspace/types/timeline-workspace.types'

export function createTimelineQueryKeys(scope: string): TimelineQueryKeys {
  const all = [scope] as const

  return {
    all,
    projects: () => [...all, 'projects'] as const,
    project: (projectId: number) => [...all, 'project', projectId] as const,
    packages: (projectId?: number) =>
      projectId === undefined
        ? ([...all, 'packages'] as const)
        : ([...all, 'packages', projectId] as const),
    package: (packageId: number) => [...all, 'package', packageId] as const,
  }
}
