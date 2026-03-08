export const toSprintLabel = (sprint: number | null | undefined) =>
  typeof sprint === 'number' ? `S${sprint}` : '--'
