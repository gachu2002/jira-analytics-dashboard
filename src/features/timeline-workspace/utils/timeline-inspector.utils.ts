import type { TimelineInspectorMode } from '@/features/timeline-workspace/types/timeline-workspace.types'
import { formatSlashDate } from '@/features/timeline-workspace/utils/timeline-workspace.utils'

export function getInspectorEyebrow(mode: TimelineInspectorMode) {
  if (mode.startsWith('create')) return 'Create'
  if (mode.startsWith('edit')) return 'Edit'
  return 'Details'
}

export function getTimelineInspectorTitle({
  itemLabel,
  itemName,
  itemTitle,
  mode,
  projectName,
}: {
  itemLabel: string
  itemName: string | null
  itemTitle: string
  mode: TimelineInspectorMode
  projectName: string | null
}) {
  if (mode === 'create-project') return 'New project'
  if (mode === 'create-package') return `New ${itemLabel}`
  if (mode === 'edit-project') return `Edit ${projectName ?? 'project'}`
  if (mode === 'edit-package') return `Edit ${itemName ?? itemLabel}`
  if (mode === 'view-project') return projectName ?? 'Project'
  return itemName ?? itemTitle
}

export function formatTimelineItemInspectorTitle({
  endDate,
  itemName,
  projectName,
  startDate,
}: {
  endDate: string
  itemName: string
  projectName: string
  startDate: string
}) {
  const prefix = projectName || 'Project'
  return `${prefix} > ${itemName} (${formatSlashDate(startDate)} - ${formatSlashDate(endDate)})`
}
