export type TimelineZoomLevel = 'week' | 'month' | 'quarter'

export type TimelineHealth = 'healthy' | 'watch' | 'risk'

export type TimelineIssue = {
  url: string
  key: string
  summary: string
  assignee: string
  status: string
}

export type TimelineProjectLike = {
  id: number
  name: string
}

export type TimelinePackageLike = {
  id: number
  name: string
  keys: string
  labels: string
  members: string
  start_date: string
  end_date: string
  resolved_bug: number
  total_bug: number
  bug_tracker_project: number
  task_id?: string | null
  sync_status?: string | null
}

export type TimelinePackageBar = {
  id: number
  projectId: number
  name: string
  leftPercent: number
  widthPercent: number
  startDate: string
  endDate: string
  resolvedBug: number
  totalBug: number
  progress: number
  members: string[]
  labels: string[]
  keys: string[]
  health: TimelineHealth
  taskId: string | null
  syncStatus: string | null
  isSyncing: boolean
}

export type TimelineProjectGroup = {
  id: number
  name: string
  packageCount: number
  totalBug: number
  resolvedBug: number
  packages: TimelinePackageBar[]
}

export type TimelineViewModel = {
  rangeStart: Date
  rangeEnd: Date
  projects: TimelineProjectGroup[]
  totals: {
    projects: number
    packages: number
    bugs: number
    resolved: number
  }
}

export type TimelineSelectedEntity =
  | { type: 'project'; projectId: number }
  | { type: 'package'; projectId: number; packageId: number }

export type TimelineInspectorMode =
  | 'view-project'
  | 'edit-project'
  | 'create-project'
  | 'view-package'
  | 'edit-package'
  | 'create-package'

export type TimelineDeleteTarget =
  | { type: 'project'; projectId: number; name: string }
  | { type: 'package'; projectId: number; packageId: number; name: string }

export type MonthGroup = {
  key: string
  label: string
  start: number
  span: number
}

export type WeekColumn = {
  key: string
  label: string
  shortLabel: string
  start: Date
  end: Date
}

export type VisibleTimelineViewModel = {
  rangeStart: Date
  rangeEnd: Date
  monthGroups: MonthGroup[]
  weekColumns: WeekColumn[]
  projects: TimelineProjectGroup[]
}

export type TimelineUiState<
  TSelectedEntity extends TimelineSelectedEntity = TimelineSelectedEntity,
  TInspectorMode extends TimelineInspectorMode = TimelineInspectorMode,
  TDeleteTarget extends TimelineDeleteTarget = TimelineDeleteTarget,
> = {
  zoom: TimelineZoomLevel
  search: string
  collapsedProjectIds: number[]
  selectedEntity: TSelectedEntity | null
  inspectorMode: TInspectorMode
  deleteTarget: TDeleteTarget | null
  setZoom: (zoom: TimelineZoomLevel) => void
  setSearch: (search: string) => void
  toggleProject: (projectId: number) => void
  setSelectedEntity: (entity: TSelectedEntity | null) => void
  setInspectorMode: (mode: TInspectorMode) => void
  openCreateProject: () => void
  openEditProject: (projectId: number) => void
  openCreatePackage: (projectId?: number) => void
  openEditPackage: (projectId: number, packageId: number) => void
  setDeleteTarget: (target: TDeleteTarget | null) => void
}

export type TimelineQueryKeys = {
  all: readonly string[]
  projects: () => readonly unknown[]
  project: (projectId: number) => readonly unknown[]
  packages: (projectId?: number) => readonly unknown[]
  package: (packageId: number) => readonly unknown[]
}
