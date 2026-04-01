import type {
  BugTimelineDeleteTarget,
  BugTimelineInspectorMode,
  BugTimelineSelectedEntity,
} from '@/features/bug-timeline/types/bug-timeline.types'
import { createTimelineUiStore } from '@/features/timeline-workspace/stores/create-timeline-ui-store'

export const useBugTimelineUiStore = createTimelineUiStore<
  BugTimelineSelectedEntity,
  BugTimelineInspectorMode,
  BugTimelineDeleteTarget
>()
