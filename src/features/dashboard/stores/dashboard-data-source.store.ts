import { create } from 'zustand'

import {
  EMPTY_JQL_FIELDS,
  buildJqlFromFields,
  normalizeJql,
  parseJqlToFields,
  type JqlFormFields,
} from '@/features/dashboard/utils/jql'

export type DashboardSourceMode = 'record' | 'jql'
export type JqlModeEntryBehavior = 'sync-record' | 'keep-current'

const toDraftState = (jql: string) => {
  const normalizedJql = normalizeJql(jql)

  return {
    draftJql: normalizedJql,
    jqlFields: parseJqlToFields(normalizedJql),
  }
}

type DashboardDataSourceState = {
  sourceMode: DashboardSourceMode
  jqlModeEntryBehavior: JqlModeEntryBehavior
  seededMilestoneId: number | null
  selectedJqlSprint: number | null
  jqlFields: JqlFormFields
  draftJql: string
  appliedJql: string | null
  activateJqlMode: () => void
  seedFromMilestoneJql: (milestoneId: number, jql: string) => void
  updateJqlField: <K extends keyof JqlFormFields>(
    field: K,
    value: JqlFormFields[K],
  ) => void
  setDraftJql: (draftJql: string) => void
  setJqlModeEntryBehavior: (behavior: JqlModeEntryBehavior) => void
  setSelectedJqlSprint: (sprint: number | null) => void
  applyCustomJql: (jqlOverride?: string | null) => void
  resetToRecordMode: () => void
}

export const useDashboardDataSourceStore = create<DashboardDataSourceState>(
  (set, get) => ({
    sourceMode: 'record',
    jqlModeEntryBehavior: 'sync-record',
    seededMilestoneId: null,
    selectedJqlSprint: null,
    jqlFields: EMPTY_JQL_FIELDS,
    draftJql: '',
    appliedJql: null,
    activateJqlMode: () => {
      const { applyCustomJql, draftJql, jqlModeEntryBehavior } = get()

      if (jqlModeEntryBehavior === 'sync-record') {
        set({
          sourceMode: 'jql',
          appliedJql: null,
          seededMilestoneId: null,
          selectedJqlSprint: null,
        })

        return
      }

      set({ sourceMode: 'jql' })

      if (normalizeJql(draftJql)) {
        applyCustomJql(draftJql)
      }
    },
    seedFromMilestoneJql: (milestoneId, jql) => {
      const normalizedJql = normalizeJql(jql)
      const { appliedJql, draftJql, jqlModeEntryBehavior, seededMilestoneId } =
        get()

      if (!normalizedJql || seededMilestoneId === milestoneId) {
        return
      }

      if (
        jqlModeEntryBehavior === 'keep-current' &&
        (draftJql.trim() || appliedJql)
      ) {
        return
      }

      set({
        seededMilestoneId: milestoneId,
        selectedJqlSprint: null,
        ...toDraftState(normalizedJql),
        appliedJql: normalizedJql,
      })
    },
    updateJqlField: (field, value) =>
      set((state) => {
        const nextFields = {
          ...state.jqlFields,
          [field]: value,
        }

        return {
          jqlFields: nextFields,
          draftJql: buildJqlFromFields(nextFields),
        }
      }),
    setDraftJql: (draftJql) => set({ draftJql }),
    setJqlModeEntryBehavior: (jqlModeEntryBehavior) =>
      set({ jqlModeEntryBehavior }),
    setSelectedJqlSprint: (selectedJqlSprint) => set({ selectedJqlSprint }),
    applyCustomJql: (jqlOverride) => {
      const normalizedJql = normalizeJql(jqlOverride ?? get().draftJql)

      if (!normalizedJql) {
        return
      }

      set({
        sourceMode: 'jql',
        appliedJql: normalizedJql,
        selectedJqlSprint: get().selectedJqlSprint,
        ...toDraftState(normalizedJql),
      })
    },
    resetToRecordMode: () =>
      set(() => ({
        sourceMode: 'record',
        appliedJql: null,
      })),
  }),
)
