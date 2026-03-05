import { create } from 'zustand'

type DashboardFiltersState = {
  selectedProjectId: number | null
  selectedMilestoneId: number | null
  setSelectedProjectId: (projectId: number) => void
  setSelectedMilestoneId: (milestoneId: number) => void
}

export const useDashboardFiltersStore = create<DashboardFiltersState>(
  (set) => ({
    selectedProjectId: null,
    selectedMilestoneId: null,
    setSelectedProjectId: (selectedProjectId) =>
      set({ selectedProjectId, selectedMilestoneId: null }),
    setSelectedMilestoneId: (selectedMilestoneId) =>
      set({ selectedMilestoneId }),
  }),
)
