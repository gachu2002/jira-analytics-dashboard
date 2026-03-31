import { create } from 'zustand'

import type {
  BugTimelineDeleteTarget,
  BugTimelineInspectorMode,
  BugTimelineSelectedEntity,
  TimelineZoomLevel,
} from '@/features/bug-timeline/types/bug-timeline.types'

type BugTimelineUiState = {
  zoom: TimelineZoomLevel
  search: string
  collapsedProjectIds: number[]
  selectedEntity: BugTimelineSelectedEntity | null
  inspectorMode: BugTimelineInspectorMode
  deleteTarget: BugTimelineDeleteTarget | null
  setZoom: (zoom: TimelineZoomLevel) => void
  setSearch: (search: string) => void
  toggleProject: (projectId: number) => void
  setSelectedEntity: (entity: BugTimelineSelectedEntity | null) => void
  setInspectorMode: (mode: BugTimelineInspectorMode) => void
  openCreateProject: () => void
  openEditProject: (projectId: number) => void
  openCreatePackage: (projectId?: number) => void
  openEditPackage: (projectId: number, packageId: number) => void
  setDeleteTarget: (target: BugTimelineDeleteTarget | null) => void
}

export const useBugTimelineUiStore = create<BugTimelineUiState>((set) => ({
  zoom: 'month',
  search: '',
  collapsedProjectIds: [],
  selectedEntity: null,
  inspectorMode: 'view-package',
  deleteTarget: null,
  setZoom: (zoom) => set({ zoom }),
  setSearch: (search) => set({ search }),
  toggleProject: (projectId) =>
    set((state) => ({
      collapsedProjectIds: state.collapsedProjectIds.includes(projectId)
        ? state.collapsedProjectIds.filter((id) => id !== projectId)
        : [...state.collapsedProjectIds, projectId],
    })),
  setSelectedEntity: (selectedEntity) => set({ selectedEntity }),
  setInspectorMode: (inspectorMode) => set({ inspectorMode }),
  openCreateProject: () =>
    set({ selectedEntity: null, inspectorMode: 'create-project' }),
  openEditProject: (projectId) =>
    set({
      selectedEntity: { type: 'project', projectId },
      inspectorMode: 'edit-project',
    }),
  openCreatePackage: (projectId) =>
    set({
      selectedEntity: projectId ? { type: 'project', projectId } : null,
      inspectorMode: 'create-package',
    }),
  openEditPackage: (projectId, packageId) =>
    set({
      selectedEntity: { type: 'package', projectId, packageId },
      inspectorMode: 'edit-package',
    }),
  setDeleteTarget: (deleteTarget) => set({ deleteTarget }),
}))
