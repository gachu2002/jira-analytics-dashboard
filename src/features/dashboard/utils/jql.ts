export type JqlFormFields = {
  projectKey: string
  labels: string
  assignees: string
  startDate: string
  endDate: string
}

export const EMPTY_JQL_FIELDS: JqlFormFields = {
  projectKey: '',
  labels: '',
  assignees: '',
  startDate: '',
  endDate: '',
}

const splitClauseValues = (value: string) =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)

const formatProjectKey = (projectKey: string) =>
  projectKey.includes(' ') ? `"${projectKey}"` : projectKey

export const normalizeJql = (value: string) => value.replace(/\s+/g, ' ').trim()

export const buildJqlFromFields = (fields: JqlFormFields) => {
  const clauses: string[] = []

  if (fields.projectKey.trim()) {
    clauses.push(`project = ${formatProjectKey(fields.projectKey.trim())}`)
  }

  const labels = splitClauseValues(fields.labels)
  if (labels.length > 0) {
    clauses.push(`labels in (${labels.join(', ')})`)
  }

  const assignees = splitClauseValues(fields.assignees)
  if (assignees.length > 0) {
    clauses.push(`assignee in (${assignees.join(', ')})`)
  }

  if (fields.startDate) {
    clauses.push(`startdate >= ${fields.startDate}`)
  }

  if (fields.endDate) {
    clauses.push(`enddate <= ${fields.endDate}`)
  }

  return clauses.join(' AND ')
}

const getMatchValue = (match: RegExpMatchArray | null, index = 1) =>
  match?.[index]?.trim() ?? ''

export const parseJqlToFields = (jql: string): JqlFormFields => {
  const normalizedJql = normalizeJql(jql)

  return {
    projectKey:
      getMatchValue(
        normalizedJql.match(/project\s*=\s*(?:"([^"]+)"|([^\s]+))/i),
      ) ||
      getMatchValue(
        normalizedJql.match(/project\s*=\s*(?:"([^"]+)"|([^\s]+))/i),
        2,
      ),
    labels: getMatchValue(normalizedJql.match(/labels\s+in\s*\(([^)]+)\)/i)),
    assignees: getMatchValue(
      normalizedJql.match(/assignee\s+in\s*\(([^)]+)\)/i),
    ),
    startDate: getMatchValue(
      normalizedJql.match(/startdate\s*>=\s*([0-9-]+)/i),
    ),
    endDate: getMatchValue(normalizedJql.match(/enddate\s*<=\s*([0-9-]+)/i)),
  }
}
