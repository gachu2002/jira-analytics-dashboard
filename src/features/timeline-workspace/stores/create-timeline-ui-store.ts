import { create } from 'zustand'

import type {
  TimelineDeleteTarget,
  TimelineInspectorMode,
  TimelineSelectedEntity,
  TimelineUiState,
} from '@/features/timeline-workspace/types/timeline-workspace.types'

export function createTimelineUiStore<
  TSelectedEntity extends TimelineSelectedEntity,
  TInspectorMode extends TimelineInspectorMode,
  TDeleteTarget extends TimelineDeleteTarget,
>() {
  return create<
    TimelineUiState<TSelectedEntity, TInspectorMode, TDeleteTarget>
  >((set) => ({
    zoom: 'month',
    search: '',
    collapsedProjectIds: [],
    selectedEntity: null,
    inspectorMode: 'view-package' as TInspectorMode,
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
      set({
        selectedEntity: null,
        inspectorMode: 'create-project' as TInspectorMode,
      }),
    openEditProject: (projectId) =>
      set({
        selectedEntity: { type: 'project', projectId } as TSelectedEntity,
        inspectorMode: 'edit-project' as TInspectorMode,
      }),
    openCreatePackage: (projectId) =>
      set({
        selectedEntity: projectId
          ? ({ type: 'project', projectId } as TSelectedEntity)
          : null,
        inspectorMode: 'create-package' as TInspectorMode,
      }),
    openEditPackage: (projectId, packageId) =>
      set({
        selectedEntity: {
          type: 'package',
          projectId,
          packageId,
        } as TSelectedEntity,
        inspectorMode: 'edit-package' as TInspectorMode,
      }),
    setDeleteTarget: (deleteTarget) => set({ deleteTarget }),
  }))
}
