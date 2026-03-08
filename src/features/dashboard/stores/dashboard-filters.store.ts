import { create } from 'zustand'

type DashboardFiltersState = {
  selectedProjectId: number | null
  selectedMilestoneId: number | null
  selectedSprint: number | null
  setSelectedProjectId: (projectId: number) => void
  setSelectedMilestoneId: (milestoneId: number) => void
  setSelectedSprint: (sprint: number | null) => void
}

export const useDashboardFiltersStore = create<DashboardFiltersState>(
  (set) => ({
    selectedProjectId: null,
    selectedMilestoneId: null,
    selectedSprint: null,
    setSelectedProjectId: (selectedProjectId) =>
      set({
        selectedProjectId,
        selectedMilestoneId: null,
        selectedSprint: null,
      }),
    setSelectedMilestoneId: (selectedMilestoneId) =>
      set({ selectedMilestoneId, selectedSprint: null }),
    setSelectedSprint: (selectedSprint) => set({ selectedSprint }),
  }),
)
