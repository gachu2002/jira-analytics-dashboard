import type {
  MilestoneTimelineDeleteTarget,
  MilestoneTimelineInspectorMode,
  MilestoneTimelineSelectedEntity,
} from '@/features/milestones/types/milestone.types'
import { createTimelineUiStore } from '@/features/timeline-workspace/stores/create-timeline-ui-store'

export const useMilestoneTimelineUiStore = createTimelineUiStore<
  MilestoneTimelineSelectedEntity,
  MilestoneTimelineInspectorMode,
  MilestoneTimelineDeleteTarget
>()
