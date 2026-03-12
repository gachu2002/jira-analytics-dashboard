import { create } from 'zustand'

import {
  EMPTY_JQL_FIELDS,
  buildJqlFromFields,
  normalizeJql,
  parseJqlToFields,
  type JqlFormFields,
} from '@/features/dashboard/utils/jql'

export type DashboardSourceMode = 'record' | 'jql'

const toDraftState = (jql: string) => {
  const normalizedJql = normalizeJql(jql)

  return {
    draftJql: normalizedJql,
    jqlFields: parseJqlToFields(normalizedJql),
  }
}

type DashboardDataSourceState = {
  sourceMode: DashboardSourceMode
  seededMilestoneId: number | null
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
  applyCustomJql: () => void
  resetToRecordMode: () => void
}

export const useDashboardDataSourceStore = create<DashboardDataSourceState>(
  (set, get) => ({
    sourceMode: 'record',
    seededMilestoneId: null,
    jqlFields: EMPTY_JQL_FIELDS,
    draftJql: '',
    appliedJql: null,
    activateJqlMode: () => set({ sourceMode: 'jql' }),
    seedFromMilestoneJql: (milestoneId, jql) => {
      const normalizedJql = normalizeJql(jql)

      if (!normalizedJql || get().seededMilestoneId === milestoneId) {
        return
      }

      set({
        seededMilestoneId: milestoneId,
        ...toDraftState(normalizedJql),
        appliedJql: null,
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
    applyCustomJql: () => {
      const normalizedJql = normalizeJql(get().draftJql)

      if (!normalizedJql) {
        return
      }

      set({
        sourceMode: 'jql',
        appliedJql: normalizedJql,
        ...toDraftState(normalizedJql),
      })
    },
    resetToRecordMode: () =>
      set(() => ({
        sourceMode: 'record',
        appliedJql: null,
        seededMilestoneId: null,
        draftJql: '',
        jqlFields: EMPTY_JQL_FIELDS,
      })),
  }),
)
