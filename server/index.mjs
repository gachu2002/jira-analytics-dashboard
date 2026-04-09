import { createHash, randomUUID } from 'node:crypto'
import { createServer } from 'node:http'

const port = Number(process.env.PORT || 8080)
const allowedOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173'

let projectIdCounter = 4
let packageIdCounter = 12
let dashboardProjectIdCounter = 4
let dashboardMilestoneIdCounter = 7
const syncJobs = new Map()

const bugCategories = [
  'FPT.BUG.LACK_TEST',
  'FPT.BUG.NO_TEST_CASE_COVERAGE',
  'FPT.BUG.SPEC_VIOLATION',
  'FPT.BUG.SIDE_EFFECT',
  'FPT.BUG.NO_REQUIREMENT',
  'FPT.BUG.NOT_BUG',
  'FPT.BUG.CANNOT_REPRODUCE',
  'FPT.BUG.DEFER',
  'FPT.BUG.WITHDRAWN',
  'FPT.BUG.DUPLICATE',
  'FPT.BUG.THIRD_PARTY',
  'FPT.BUG.KNOWN_ISSUE',
  'FPT.BUG.IN_DEVELOPMENT',
  'FPT.BUG.NO_DEVICE',
  'FPT.BUG.NO_DEVELOPMENT',
]

function inferMockPartner(assignee) {
  const tokens = String(assignee || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)

  return tokens.at(-1) || ''
}

function buildIssue(key, summary, assignee, status) {
  return {
    url: `http://jira.lge.com/issue/browse/${key}`,
    key,
    summary,
    assignee,
    partner: inferMockPartner(assignee),
    status,
  }
}

function cloneIssues(issues) {
  return issues.map((issue) => ({ ...issue }))
}

const milestoneWorkflowStatuses = [
  'Screen',
  'Analysis',
  'Implementation',
  'Integration',
  'Build',
  'Verify',
  'Closed',
]

const milestoneOpenStatusWeights = [
  { status: 'Screen', weight: 1 },
  { status: 'Analysis', weight: 1.4 },
  { status: 'Implementation', weight: 2.8 },
  { status: 'Integration', weight: 2.2 },
  { status: 'Build', weight: 1.8 },
]

const milestoneDoneStatusWeights = [
  { status: 'Verify', weight: 1.1 },
  { status: 'Closed', weight: 2.4 },
]

function buildMilestoneIssueKey(key, cycle) {
  if (cycle === 0) return key

  const match = String(key).match(/^([A-Z]+)-(\d+)$/)
  if (!match) {
    return `${key}-${cycle + 1}`
  }

  return `${match[1]}-${Number(match[2]) + cycle * 100}`
}

function distributeWeightedCount(total, buckets) {
  if (total <= 0) {
    return new Map(buckets.map((bucket) => [bucket.status, 0]))
  }

  const totalWeight = buckets.reduce((sum, bucket) => sum + bucket.weight, 0)
  const counts = new Map(
    buckets.map((bucket) => [
      bucket.status,
      Math.floor((bucket.weight / totalWeight) * total),
    ]),
  )
  const remainders = buckets
    .map((bucket) => ({
      status: bucket.status,
      remainder:
        (bucket.weight / totalWeight) * total -
        (counts.get(bucket.status) ?? 0),
      weight: bucket.weight,
    }))
    .sort((left, right) => {
      if (right.remainder !== left.remainder) {
        return right.remainder - left.remainder
      }

      return right.weight - left.weight
    })

  let assigned = [...counts.values()].reduce((sum, value) => sum + value, 0)

  for (let index = 0; assigned < total; index += 1) {
    const bucket = remainders[index % remainders.length]
    counts.set(bucket.status, (counts.get(bucket.status) ?? 0) + 1)
    assigned += 1
  }

  return counts
}

function buildMilestoneStatusSequence(totalIssues, completedIssues) {
  const total = Math.max(totalIssues, 0)
  const doneCount = Math.min(Math.max(completedIssues, 0), total)
  const openCount = total - doneCount
  const counts = new Map(milestoneWorkflowStatuses.map((status) => [status, 0]))

  for (const [status, count] of distributeWeightedCount(
    openCount,
    milestoneOpenStatusWeights,
  )) {
    counts.set(status, count)
  }

  for (const [status, count] of distributeWeightedCount(
    doneCount,
    milestoneDoneStatusWeights,
  )) {
    counts.set(status, count)
  }

  const sequence = []

  while (sequence.length < total) {
    let added = false

    for (const status of milestoneWorkflowStatuses) {
      const remaining = counts.get(status) ?? 0
      if (remaining <= 0) continue

      sequence.push(status)
      counts.set(status, remaining - 1)
      added = true

      if (sequence.length >= total) {
        break
      }
    }

    if (!added) {
      break
    }
  }

  return sequence
}

function buildMilestoneIssues(issues, totalIssues, completedIssues) {
  if (!issues.length) return []

  return buildMilestoneStatusSequence(totalIssues, completedIssues).map(
    (status, index) => {
      const template = issues[index % issues.length]
      const cycle = Math.floor(index / issues.length)
      const key = buildMilestoneIssueKey(template.key, cycle)

      return {
        ...template,
        key,
        url: `http://jira.lge.com/issue/browse/${key}`,
        summary:
          cycle > 0
            ? `${template.summary} Batch ${cycle + 1}`
            : template.summary,
        status,
      }
    },
  )
}

function getMilestoneSnapshot(statistics, fallbackIssues) {
  const activeSprint =
    statistics.find((item) => item.active) ?? statistics.at(-1)

  if (activeSprint) {
    return {
      totalTickets: activeSprint.scope_point,
      completedTickets: activeSprint.completed_point,
    }
  }

  return {
    totalTickets: fallbackIssues.length,
    completedTickets: fallbackIssues.filter((issue) =>
      isDoneStatus(issue.status),
    ).length,
  }
}

function isDoneStatus(status) {
  const normalized = String(status || '')
    .trim()
    .toLowerCase()
  return (
    normalized === 'closed' ||
    normalized === 'resolved' ||
    normalized === 'verify' ||
    normalized === 'verified'
  )
}

function buildBugStatistics(packageId, counts) {
  return bugCategories.map((name, index) => ({
    id: packageId * 100 + index + 1,
    bug_category: {
      id: 91 + index,
      name,
    },
    number_of_bugs: counts[index] ?? 0,
    created_at: '2026-03-24T16:18:17.806995+09:00',
    active: true,
    package: packageId,
  }))
}

function buildSprintStatistics(packageId, sprints) {
  return sprints.map((item, index) => ({
    id: packageId * 1000 + index + 1,
    sprint: {
      id: packageId * 100 + index + 1,
      name: item.name,
      start_date: item.start_date,
      end_date: item.end_date,
    },
    resolved_bug: item.resolved_bug,
    total_bug: item.total_bug,
    new_bug: item.new_bug,
    resolved_bug_velocity: item.resolved_bug_velocity,
    target_bug_velocity: item.target_bug_velocity,
    target_reopened_rate: item.target_reopened_rate,
    resolved_bug_reopened: item.resolved_bug_reopened,
    reopened_bug: item.reopened_bug,
    created_at: item.created_at,
    active: item.active ?? false,
    package: packageId,
  }))
}

function buildDashboardMilestoneSprintStatistics(milestoneId, sprints) {
  return sprints.map((item, index) => ({
    id: milestoneId * 1000 + index + 1,
    sprint: {
      id: milestoneId * 100 + index + 1,
      name: item.name,
      start_date: item.start_date,
      end_date: item.end_date,
    },
    completed_point: item.completed_point,
    scope_point: item.scope_point,
    created_at: item.created_at,
    active: item.active ?? false,
    milestone: milestoneId,
  }))
}

const projects = [
  { id: 1, name: 'Atlas Cloud' },
  { id: 2, name: 'Console Platform' },
  { id: 3, name: 'Mobile Release Train' },
]

const packages = [
  {
    id: 1,
    name: 'Authentication hardening',
    keys: 'ATL-104, ATL-111, ATL-118, ATL-126, ATL-129',
    labels: 'auth, blocker',
    members: 'lethanhnguyen, nguyenvannam',
    start_date: '2026-03-05',
    end_date: '2026-04-03',
    resolved_bug: 18,
    total_bug: 24,
    issues: [
      buildIssue(
        'ATL-104',
        'Session refresh fails after long idle state.',
        'nguyenlt lethanhnguyen',
        'Closed',
      ),
      buildIssue(
        'ATL-111',
        'MFA prompt overlaps settings drawer.',
        'namlt nguyenvannam',
        'Resolved',
      ),
      buildIssue(
        'ATL-118',
        'Password reset email token expires too early.',
        'nguyenlt lethanhnguyen',
        'Closed',
      ),
      buildIssue(
        'ATL-126',
        'Remember-device state is lost after token rotation.',
        'namlt nguyenvannam',
        'In Progress',
      ),
      buildIssue(
        'ATL-129',
        'SAML logout leaves an orphaned admin session.',
        'nguyenlt lethanhnguyen',
        'Open',
      ),
    ],
    bug_tracker_project: 1,
  },
  {
    id: 2,
    name: 'Search stability',
    keys: 'ATL-132, ATL-136, ATL-141, ATL-147, ATL-149',
    labels: 'search, regression',
    members: 'tranlinh, huypham',
    start_date: '2026-04-02',
    end_date: '2026-05-04',
    resolved_bug: 11,
    total_bug: 26,
    issues: [
      buildIssue(
        'ATL-132',
        'Search query stalls on repeated filter changes.',
        'linhtt tranlinh',
        'Open',
      ),
      buildIssue(
        'ATL-136',
        'Query cache mismatch after project switch.',
        'huynt huypham',
        'In Progress',
      ),
      buildIssue(
        'ATL-141',
        'Stale count shown in bug grid summary.',
        'linhtt tranlinh',
        'Verify',
      ),
      buildIssue(
        'ATL-147',
        'Saved search opens with an outdated project scope.',
        'huynt huypham',
        'Open',
      ),
      buildIssue(
        'ATL-149',
        'Sort order resets after browser back navigation.',
        'linhtt tranlinh',
        'In Progress',
      ),
    ],
    bug_tracker_project: 1,
  },
  {
    id: 3,
    name: 'Audit trail fixes',
    keys: 'CON-21, CON-31, CON-34, CON-36',
    labels: 'audit, compliance',
    members: 'quangpham, amyle',
    start_date: '2026-03-12',
    end_date: '2026-04-18',
    resolved_bug: 8,
    total_bug: 9,
    issues: [
      buildIssue(
        'CON-21',
        'Audit trail omits impersonation action.',
        'quangnt quangpham',
        'Closed',
      ),
      buildIssue(
        'CON-31',
        'Compliance export misses timezone details.',
        'amynd amyle',
        'Resolved',
      ),
      buildIssue(
        'CON-34',
        'Deleted role assignments are missing from audit diffs.',
        'quangnt quangpham',
        'Verify',
      ),
      buildIssue(
        'CON-36',
        'Reviewer note changes are not captured in export history.',
        'amynd amyle',
        'Open',
      ),
    ],
    bug_tracker_project: 2,
  },
  {
    id: 4,
    name: 'Dashboard query tuning',
    keys: 'CON-55, CON-61, CON-74, CON-77, CON-82',
    labels: 'performance, query',
    members: 'khanhtran, zoenguyen',
    start_date: '2026-04-10',
    end_date: '2026-05-22',
    resolved_bug: 14,
    total_bug: 20,
    issues: [
      buildIssue(
        'CON-55',
        'Slow dashboard load on large account scope.',
        'khanhlt khanhtran',
        'In Progress',
      ),
      buildIssue(
        'CON-61',
        'Duplicate query request on tab restore.',
        'zoelt zoenguyen',
        'Closed',
      ),
      buildIssue(
        'CON-74',
        'Widget totals drift after live refresh.',
        'khanhlt khanhtran',
        'Open',
      ),
      buildIssue(
        'CON-77',
        'Dashboard export uses stale aggregate results.',
        'zoelt zoenguyen',
        'Resolved',
      ),
      buildIssue(
        'CON-82',
        'Drilldown query times out for accounts over 50k issues.',
        'khanhlt khanhtran',
        'Open',
      ),
    ],
    bug_tracker_project: 2,
  },
  {
    id: 5,
    name: 'Push notification reliability',
    keys: 'MOB-13, MOB-18, MOB-21, MOB-27',
    labels: 'notification, ios, android',
    members: 'trangpham, omarali',
    start_date: '2026-03-01',
    end_date: '2026-03-29',
    resolved_bug: 7,
    total_bug: 18,
    issues: [
      buildIssue(
        'MOB-13',
        'Push token invalid after OS upgrade.',
        'trangnt trangpham',
        'Closed',
      ),
      buildIssue(
        'MOB-18',
        'Android notifications delayed in background.',
        'omarlh omarali',
        'Resolved',
      ),
      buildIssue(
        'MOB-21',
        'Notification permission prompt does not reappear after denial.',
        'trangnt trangpham',
        'In Progress',
      ),
      buildIssue(
        'MOB-27',
        'Deep link payload is truncated on low-connectivity retry.',
        'omarlh omarali',
        'Open',
      ),
    ],
    bug_tracker_project: 3,
  },
  {
    id: 6,
    name: 'Crash analytics triage',
    keys: 'MOB-42, MOB-44, MOB-45, MOB-47, MOB-51',
    labels: 'crash, release',
    members: 'trangpham, deepa',
    start_date: '2026-04-01',
    end_date: '2026-05-11',
    resolved_bug: 16,
    total_bug: 17,
    issues: [
      buildIssue(
        'MOB-42',
        'Crash dashboard groups iOS stack traces incorrectly.',
        'trangnt trangpham',
        'Closed',
      ),
      buildIssue(
        'MOB-44',
        'Release alert does not include build number.',
        'deepapk deepa',
        'Closed',
      ),
      buildIssue(
        'MOB-45',
        'Crash bucket label mismatches store release.',
        'trangnt trangpham',
        'Open',
      ),
      buildIssue(
        'MOB-47',
        'ANR reports are duplicated after app relaunch.',
        'deepapk deepa',
        'In Progress',
      ),
      buildIssue(
        'MOB-51',
        'Crash-free session metric drops after timezone rollover.',
        'trangnt trangpham',
        'Resolved',
      ),
    ],
    bug_tracker_project: 3,
  },
]

for (const packageItem of packages) {
  packageItem.task_id = null
  packageItem.total_bug = packageItem.issues.length
  packageItem.resolved_bug = packageItem.issues.filter((issue) =>
    isDoneStatus(issue.status),
  ).length
}

const packageBugStatistics = {
  1: buildBugStatistics(1, [0, 0, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0]),
  2: buildBugStatistics(2, [1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0]),
  3: buildBugStatistics(3, [0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 2]),
  4: buildBugStatistics(4, [0, 0, 1, 2, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1]),
  5: buildBugStatistics(5, [0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1]),
  6: buildBugStatistics(6, [0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0]),
}

const packageSprintStatistics = {
  1: buildSprintStatistics(1, [
    {
      name: 'Authentication Sprint 31',
      start_date: '2026-02-09',
      end_date: '2026-02-22',
      resolved_bug: 0,
      total_bug: 1,
      new_bug: 1,
      resolved_bug_velocity: 0,
      target_bug_velocity: 1,
      target_reopened_rate: 0.08,
      resolved_bug_reopened: 0,
      reopened_bug: 0,
      created_at: '2026-02-12T09:00:00.000Z',
    },
    {
      name: 'Authentication Sprint 32',
      start_date: '2026-02-23',
      end_date: '2026-03-08',
      resolved_bug: 1,
      total_bug: 3,
      new_bug: 2,
      resolved_bug_velocity: 1,
      target_bug_velocity: 1,
      target_reopened_rate: 0.08,
      resolved_bug_reopened: 0,
      reopened_bug: 0,
      created_at: '2026-02-26T09:00:00.000Z',
    },
    {
      name: 'Authentication Sprint 33',
      start_date: '2026-03-09',
      end_date: '2026-03-22',
      resolved_bug: 2,
      total_bug: 5,
      new_bug: 2,
      resolved_bug_velocity: 1,
      target_bug_velocity: 1,
      target_reopened_rate: 0.08,
      resolved_bug_reopened: 1,
      reopened_bug: 1,
      created_at: '2026-03-12T09:00:00.000Z',
    },
    {
      name: 'Authentication Sprint 34',
      start_date: '2026-03-23',
      end_date: '2026-04-05',
      resolved_bug: 3,
      total_bug: 5,
      new_bug: 0,
      resolved_bug_velocity: 1,
      target_bug_velocity: 1,
      target_reopened_rate: 0.08,
      resolved_bug_reopened: 1,
      reopened_bug: 0,
      created_at: '2026-03-27T09:00:00.000Z',
      active: true,
    },
  ]),
  2: buildSprintStatistics(2, [
    {
      name: 'Search Stabilization Sprint 35',
      start_date: '2026-03-16',
      end_date: '2026-03-29',
      resolved_bug: 0,
      total_bug: 1,
      new_bug: 1,
      resolved_bug_velocity: 0,
      target_bug_velocity: 1,
      target_reopened_rate: 0.12,
      resolved_bug_reopened: 0,
      reopened_bug: 0,
      created_at: '2026-03-20T09:00:00.000Z',
    },
    {
      name: 'Search Stabilization Sprint 36',
      start_date: '2026-03-30',
      end_date: '2026-04-12',
      resolved_bug: 0,
      total_bug: 3,
      new_bug: 2,
      resolved_bug_velocity: 0,
      target_bug_velocity: 1,
      target_reopened_rate: 0.12,
      resolved_bug_reopened: 0,
      reopened_bug: 0,
      created_at: '2026-04-03T09:00:00.000Z',
    },
    {
      name: 'Search Stabilization Sprint 37',
      start_date: '2026-04-13',
      end_date: '2026-04-26',
      resolved_bug: 1,
      total_bug: 4,
      new_bug: 1,
      resolved_bug_velocity: 1,
      target_bug_velocity: 1,
      target_reopened_rate: 0.12,
      resolved_bug_reopened: 0,
      reopened_bug: 0,
      created_at: '2026-04-17T09:00:00.000Z',
    },
    {
      name: 'Search Stabilization Sprint 38',
      start_date: '2026-04-27',
      end_date: '2026-05-10',
      resolved_bug: 1,
      total_bug: 5,
      new_bug: 1,
      resolved_bug_velocity: 0,
      target_bug_velocity: 1,
      target_reopened_rate: 0.12,
      resolved_bug_reopened: 0,
      reopened_bug: 0,
      created_at: '2026-05-01T09:00:00.000Z',
      active: true,
    },
  ]),
  3: buildSprintStatistics(3, [
    {
      name: 'Audit Trail Sprint 31',
      start_date: '2026-03-02',
      end_date: '2026-03-15',
      resolved_bug: 1,
      total_bug: 1,
      new_bug: 1,
      resolved_bug_velocity: 1,
      target_bug_velocity: 1,
      target_reopened_rate: 0.05,
      resolved_bug_reopened: 0,
      reopened_bug: 0,
      created_at: '2026-03-05T09:00:00.000Z',
    },
    {
      name: 'Audit Trail Sprint 32',
      start_date: '2026-03-16',
      end_date: '2026-03-29',
      resolved_bug: 2,
      total_bug: 2,
      new_bug: 1,
      resolved_bug_velocity: 1,
      target_bug_velocity: 1,
      target_reopened_rate: 0.05,
      resolved_bug_reopened: 0,
      reopened_bug: 0,
      created_at: '2026-03-19T09:00:00.000Z',
    },
    {
      name: 'Audit Trail Sprint 33',
      start_date: '2026-03-30',
      end_date: '2026-04-12',
      resolved_bug: 3,
      total_bug: 4,
      new_bug: 2,
      resolved_bug_velocity: 1,
      target_bug_velocity: 1,
      target_reopened_rate: 0.05,
      resolved_bug_reopened: 0,
      reopened_bug: 0,
      created_at: '2026-04-02T09:00:00.000Z',
      active: true,
    },
  ]),
  4: buildSprintStatistics(4, [
    {
      name: 'Dashboard Performance Sprint 36',
      start_date: '2026-04-06',
      end_date: '2026-04-19',
      resolved_bug: 0,
      total_bug: 1,
      new_bug: 1,
      resolved_bug_velocity: 0,
      target_bug_velocity: 1,
      target_reopened_rate: 0.1,
      resolved_bug_reopened: 0,
      reopened_bug: 0,
      created_at: '2026-04-10T09:00:00.000Z',
    },
    {
      name: 'Dashboard Performance Sprint 37',
      start_date: '2026-04-20',
      end_date: '2026-05-03',
      resolved_bug: 1,
      total_bug: 3,
      new_bug: 2,
      resolved_bug_velocity: 1,
      target_bug_velocity: 1,
      target_reopened_rate: 0.1,
      resolved_bug_reopened: 0,
      reopened_bug: 0,
      created_at: '2026-04-24T09:00:00.000Z',
    },
    {
      name: 'Dashboard Performance Sprint 38',
      start_date: '2026-05-04',
      end_date: '2026-05-17',
      resolved_bug: 1,
      total_bug: 5,
      new_bug: 2,
      resolved_bug_velocity: 0,
      target_bug_velocity: 1,
      target_reopened_rate: 0.1,
      resolved_bug_reopened: 0,
      reopened_bug: 0,
      created_at: '2026-05-08T09:00:00.000Z',
    },
    {
      name: 'Dashboard Performance Sprint 39',
      start_date: '2026-05-18',
      end_date: '2026-05-31',
      resolved_bug: 2,
      total_bug: 5,
      new_bug: 0,
      resolved_bug_velocity: 1,
      target_bug_velocity: 1,
      target_reopened_rate: 0.1,
      resolved_bug_reopened: 0,
      reopened_bug: 0,
      created_at: '2026-05-22T09:00:00.000Z',
      active: true,
    },
  ]),
  5: buildSprintStatistics(5, [
    {
      name: 'Mobile Notification Sprint 29',
      start_date: '2026-03-02',
      end_date: '2026-03-15',
      resolved_bug: 0,
      total_bug: 1,
      new_bug: 1,
      resolved_bug_velocity: 0,
      target_bug_velocity: 1,
      target_reopened_rate: 0.09,
      resolved_bug_reopened: 0,
      reopened_bug: 0,
      created_at: '2026-03-01T09:00:00.000Z',
    },
    {
      name: 'Mobile Notification Sprint 30',
      start_date: '2026-03-16',
      end_date: '2026-03-29',
      resolved_bug: 1,
      total_bug: 2,
      new_bug: 1,
      resolved_bug_velocity: 1,
      target_bug_velocity: 1,
      target_reopened_rate: 0.09,
      resolved_bug_reopened: 0,
      reopened_bug: 0,
      created_at: '2026-03-15T09:00:00.000Z',
    },
    {
      name: 'Mobile Notification Sprint 31',
      start_date: '2026-03-30',
      end_date: '2026-04-12',
      resolved_bug: 1,
      total_bug: 4,
      new_bug: 2,
      resolved_bug_velocity: 0,
      target_bug_velocity: 1,
      target_reopened_rate: 0.09,
      resolved_bug_reopened: 0,
      reopened_bug: 0,
      created_at: '2026-03-29T09:00:00.000Z',
    },
    {
      name: 'Mobile Notification Sprint 32',
      start_date: '2026-04-13',
      end_date: '2026-04-26',
      resolved_bug: 2,
      total_bug: 4,
      new_bug: 0,
      resolved_bug_velocity: 1,
      target_bug_velocity: 1,
      target_reopened_rate: 0.09,
      resolved_bug_reopened: 0,
      reopened_bug: 0,
      created_at: '2026-04-12T09:00:00.000Z',
      active: true,
    },
  ]),
  6: buildSprintStatistics(6, [
    {
      name: 'Crash Analytics Sprint 35',
      start_date: '2026-03-30',
      end_date: '2026-04-12',
      resolved_bug: 1,
      total_bug: 2,
      new_bug: 2,
      resolved_bug_velocity: 1,
      target_bug_velocity: 1,
      target_reopened_rate: 0.06,
      resolved_bug_reopened: 0,
      reopened_bug: 0,
      created_at: '2026-04-02T09:00:00.000Z',
    },
    {
      name: 'Crash Analytics Sprint 36',
      start_date: '2026-04-13',
      end_date: '2026-04-26',
      resolved_bug: 2,
      total_bug: 3,
      new_bug: 1,
      resolved_bug_velocity: 1,
      target_bug_velocity: 1,
      target_reopened_rate: 0.06,
      resolved_bug_reopened: 0,
      reopened_bug: 0,
      created_at: '2026-04-16T09:00:00.000Z',
    },
    {
      name: 'Crash Analytics Sprint 37',
      start_date: '2026-04-27',
      end_date: '2026-05-10',
      resolved_bug: 2,
      total_bug: 5,
      new_bug: 2,
      resolved_bug_velocity: 0,
      target_bug_velocity: 1,
      target_reopened_rate: 0.06,
      resolved_bug_reopened: 1,
      reopened_bug: 1,
      created_at: '2026-04-30T09:00:00.000Z',
    },
    {
      name: 'Crash Analytics Sprint 38',
      start_date: '2026-05-11',
      end_date: '2026-05-24',
      resolved_bug: 3,
      total_bug: 5,
      new_bug: 0,
      resolved_bug_velocity: 1,
      target_bug_velocity: 1,
      target_reopened_rate: 0.06,
      resolved_bug_reopened: 1,
      reopened_bug: 0,
      created_at: '2026-05-14T09:00:00.000Z',
      active: true,
    },
  ]),
}

const dashboardProjects = [
  {
    id: 1,
    name: 'Atlas Cloud',
    keys: 'ATL, AUTH',
    description: 'Authentication, search, and release readiness workstreams.',
    members: 'lethanhnguyen, nguyenvannam, tranlinh, huypham',
    labels: 'cloud, auth, release',
    pm: 101,
    pl: 102,
  },
  {
    id: 2,
    name: 'Console Platform',
    keys: 'CON, OPS',
    description: 'Console reliability, audit, and reporting delivery track.',
    members: 'quangpham, amyle, khanhtran, zoenguyen',
    labels: 'console, compliance, reporting',
    pm: 103,
    pl: 104,
  },
  {
    id: 3,
    name: 'Mobile Release Train',
    keys: 'MOB, REL',
    description: 'Mobile push and store-release milestone schedule.',
    members: 'trangpham, omarali, deepa',
    labels: 'mobile, release, notifications',
    pm: 105,
    pl: 106,
  },
]

const dashboardMilestones = [
  {
    id: 1,
    name: 'Authentication hardening',
    description: 'Lock down long-idle session behavior before release review.',
    start_date: '2026-03-05',
    end_date: '2026-04-03',
    closed_ticket: 18,
    total_ticket: 24,
    jql: 'project = ATL AND labels in (auth, blocker) AND sprint in openSprints()',
    issues: cloneIssues(packages[0].issues),
    project: 1,
  },
  {
    id: 2,
    name: 'Search stability',
    description: 'Reduce regression noise before scope freeze.',
    start_date: '2026-04-02',
    end_date: '2026-05-04',
    closed_ticket: 11,
    total_ticket: 26,
    jql: 'project = ATL AND labels in (search, regression)',
    issues: cloneIssues(packages[1].issues),
    project: 1,
  },
  {
    id: 3,
    name: 'Audit trail fixes',
    description: 'Close compliance gaps before executive sign-off.',
    start_date: '2026-03-12',
    end_date: '2026-04-18',
    closed_ticket: 8,
    total_ticket: 9,
    jql: 'project = CON AND labels in (audit, compliance)',
    issues: cloneIssues(packages[2].issues),
    project: 2,
  },
  {
    id: 4,
    name: 'Dashboard query tuning',
    description: 'Bring reporting latency under review-meeting threshold.',
    start_date: '2026-04-10',
    end_date: '2026-05-22',
    closed_ticket: 14,
    total_ticket: 20,
    jql: 'project = CON AND labels in (performance, query)',
    issues: cloneIssues(packages[3].issues),
    project: 2,
  },
  {
    id: 5,
    name: 'Push notification reliability',
    description: 'Stabilize mobile delivery flows across iOS and Android.',
    start_date: '2026-03-01',
    end_date: '2026-04-14',
    closed_ticket: 9,
    total_ticket: 13,
    jql: 'project = MOB AND labels in (notification, ios, android)',
    issues: cloneIssues(packages[4].issues),
    project: 3,
  },
  {
    id: 6,
    name: 'Store submission readiness',
    description: 'Track release blockers through app-store submission.',
    start_date: '2026-04-01',
    end_date: '2026-05-18',
    closed_ticket: 7,
    total_ticket: 11,
    jql: 'project = MOB AND labels in (release, store)',
    issues: cloneIssues(packages[5].issues),
    project: 3,
  },
]

const dashboardMilestoneSprintStatistics = {
  1: buildDashboardMilestoneSprintStatistics(1, [
    {
      name: 'Sprint 31',
      start_date: '2026-03-02',
      end_date: '2026-03-15',
      completed_point: 18,
      scope_point: 24,
      created_at: '2026-03-15T09:00:00.000Z',
    },
    {
      name: 'Sprint 32',
      start_date: '2026-03-16',
      end_date: '2026-03-29',
      completed_point: 20,
      scope_point: 24,
      created_at: '2026-03-29T09:00:00.000Z',
    },
    {
      name: 'Sprint 33',
      start_date: '2026-03-30',
      end_date: '2026-04-12',
      completed_point: 23,
      scope_point: 25,
      created_at: '2026-04-12T09:00:00.000Z',
      active: true,
    },
  ]),
  2: buildDashboardMilestoneSprintStatistics(2, [
    {
      name: 'Sprint 33',
      start_date: '2026-03-30',
      end_date: '2026-04-12',
      completed_point: 9,
      scope_point: 18,
      created_at: '2026-04-12T09:00:00.000Z',
    },
    {
      name: 'Sprint 34',
      start_date: '2026-04-13',
      end_date: '2026-04-26',
      completed_point: 11,
      scope_point: 22,
      created_at: '2026-04-26T09:00:00.000Z',
    },
    {
      name: 'Sprint 35',
      start_date: '2026-04-27',
      end_date: '2026-05-10',
      completed_point: 14,
      scope_point: 26,
      created_at: '2026-05-10T09:00:00.000Z',
      active: true,
    },
  ]),
  3: buildDashboardMilestoneSprintStatistics(3, [
    {
      name: 'Sprint 31',
      start_date: '2026-03-09',
      end_date: '2026-03-22',
      completed_point: 6,
      scope_point: 8,
      created_at: '2026-03-22T09:00:00.000Z',
    },
    {
      name: 'Sprint 32',
      start_date: '2026-03-23',
      end_date: '2026-04-05',
      completed_point: 8,
      scope_point: 9,
      created_at: '2026-04-05T09:00:00.000Z',
      active: true,
    },
  ]),
  4: buildDashboardMilestoneSprintStatistics(4, [
    {
      name: 'Sprint 34',
      start_date: '2026-04-06',
      end_date: '2026-04-19',
      completed_point: 8,
      scope_point: 15,
      created_at: '2026-04-19T09:00:00.000Z',
    },
    {
      name: 'Sprint 35',
      start_date: '2026-04-20',
      end_date: '2026-05-03',
      completed_point: 12,
      scope_point: 18,
      created_at: '2026-05-03T09:00:00.000Z',
    },
    {
      name: 'Sprint 36',
      start_date: '2026-05-04',
      end_date: '2026-05-17',
      completed_point: 14,
      scope_point: 20,
      created_at: '2026-05-17T09:00:00.000Z',
      active: true,
    },
  ]),
  5: buildDashboardMilestoneSprintStatistics(5, [
    {
      name: 'Sprint 30',
      start_date: '2026-03-02',
      end_date: '2026-03-15',
      completed_point: 4,
      scope_point: 7,
      created_at: '2026-03-15T09:00:00.000Z',
    },
    {
      name: 'Sprint 31',
      start_date: '2026-03-16',
      end_date: '2026-03-29',
      completed_point: 7,
      scope_point: 10,
      created_at: '2026-03-29T09:00:00.000Z',
    },
    {
      name: 'Sprint 32',
      start_date: '2026-03-30',
      end_date: '2026-04-12',
      completed_point: 9,
      scope_point: 13,
      created_at: '2026-04-12T09:00:00.000Z',
      active: true,
    },
  ]),
  6: buildDashboardMilestoneSprintStatistics(6, [
    {
      name: 'Sprint 33',
      start_date: '2026-03-30',
      end_date: '2026-04-12',
      completed_point: 3,
      scope_point: 6,
      created_at: '2026-04-12T09:00:00.000Z',
    },
    {
      name: 'Sprint 34',
      start_date: '2026-04-13',
      end_date: '2026-04-26',
      completed_point: 5,
      scope_point: 8,
      created_at: '2026-04-26T09:00:00.000Z',
    },
    {
      name: 'Sprint 35',
      start_date: '2026-04-27',
      end_date: '2026-05-10',
      completed_point: 7,
      scope_point: 11,
      created_at: '2026-05-10T09:00:00.000Z',
      active: true,
    },
  ]),
}

for (const milestone of dashboardMilestones) {
  const sourceIssues = packages[milestone.id - 1]?.issues ?? []
  const snapshot = getMilestoneSnapshot(
    dashboardMilestoneSprintStatistics[milestone.id] ?? [],
    sourceIssues,
  )

  milestone.task_id = null
  milestone.issues = buildMilestoneIssues(
    sourceIssues,
    snapshot.totalTickets,
    snapshot.completedTickets,
  )
  milestone.total_ticket = milestone.issues.length
  milestone.closed_ticket = milestone.issues.filter((issue) =>
    isDoneStatus(issue.status),
  ).length
}

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET,POST,PATCH,DELETE,OPTIONS',
    'Content-Type': 'application/json; charset=utf-8',
  })
  response.end(statusCode === 204 ? undefined : JSON.stringify(payload))
}

function createToken(prefix, seed) {
  const digest = createHash('sha256')
    .update(`${prefix}:${seed}:${Date.now()}:${randomUUID()}`)
    .digest('hex')

  return `${prefix}_${digest}`
}

function createSyncTask(taskType) {
  const taskId = createToken(taskType, randomUUID())

  syncJobs.set(taskId, {
    readyAt: Date.now() + 5000,
  })

  return taskId
}

function getSyncTaskStatus(taskId) {
  const job = syncJobs.get(taskId)
  if (!job) return null

  return Date.now() >= job.readyAt ? 'SUCCESS' : 'PROCESSING'
}

function buildAccountUsers() {
  return [
    {
      id: 101,
      username: 'demo.user',
      email: 'user@example.com',
      is_superuser: true,
      is_staff: true,
      is_active: true,
      cn: 'Demo User',
      name: 'Demo User',
      display_name_printable: 'Demo User',
      title: 'Program Manager',
      department: 'Engineering',
      desc: 'Local mock current user',
    },
    {
      id: 102,
      username: 'nam.nguyen',
      email: 'nam.nguyen@example.com',
      is_superuser: false,
      is_staff: true,
      is_active: true,
      cn: 'Nam Nguyen',
      name: 'Nam Nguyen',
      display_name_printable: 'Nam Nguyen',
      title: 'Project Lead',
      department: 'Platform Delivery',
      desc: 'Authentication and search delivery lead',
    },
    {
      id: 103,
      username: 'quang.pham',
      email: 'quang.pham@example.com',
      is_superuser: false,
      is_staff: true,
      is_active: true,
      cn: 'Quang Pham',
      name: 'Quang Pham',
      display_name_printable: 'Quang Pham',
      title: 'Program Manager',
      department: 'Console Operations',
      desc: 'Console portfolio owner',
    },
    {
      id: 104,
      username: 'zoe.nguyen',
      email: 'zoe.nguyen@example.com',
      is_superuser: false,
      is_staff: true,
      is_active: true,
      cn: 'Zoe Nguyen',
      name: 'Zoe Nguyen',
      display_name_printable: 'Zoe Nguyen',
      title: 'Project Lead',
      department: 'Console Operations',
      desc: 'Reporting and query lead',
    },
    {
      id: 105,
      username: 'trang.pham',
      email: 'trang.pham@example.com',
      is_superuser: false,
      is_staff: true,
      is_active: true,
      cn: 'Trang Pham',
      name: 'Trang Pham',
      display_name_printable: 'Trang Pham',
      title: 'Program Manager',
      department: 'Mobile Engineering',
      desc: 'Mobile release portfolio owner',
    },
    {
      id: 106,
      username: 'deepa.k',
      email: 'deepa.k@example.com',
      is_superuser: false,
      is_staff: true,
      is_active: true,
      cn: 'Deepa K',
      name: 'Deepa K',
      display_name_printable: 'Deepa K',
      title: 'Project Lead',
      department: 'Mobile Engineering',
      desc: 'Crash and store readiness lead',
    },
  ]
}

function readJsonBody(request) {
  return new Promise((resolve, reject) => {
    let body = ''

    request.on('data', (chunk) => {
      body += chunk
    })

    request.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {})
      } catch {
        reject(new Error('invalid-json'))
      }
    })

    request.on('error', reject)
  })
}

function getRequestUrl(requestUrl) {
  return new URL(requestUrl, `http://localhost:${port}`)
}

function getProject(projectId) {
  return projects.find((project) => project.id === projectId) ?? null
}

function getPackage(currentPackageId) {
  return packages.find((item) => item.id === currentPackageId) ?? null
}

function getCustomJqlPackageTemplate(jql) {
  const normalized = String(jql || '').trim()
  const sourcePackages = packages.filter((item) => item.issues.length > 0)

  if (!sourcePackages.length) return null

  const hash = [...normalized].reduce(
    (total, character) => total + character.charCodeAt(0),
    0,
  )

  return sourcePackages[hash % sourcePackages.length]
}

function buildCustomJqlPackageResponse(jql) {
  const packageRecord = getCustomJqlPackageTemplate(jql)
  if (!packageRecord) return null

  return {
    keys: packageRecord.keys,
    start_date: packageRecord.start_date,
    end_date: packageRecord.end_date,
    labels: packageRecord.labels,
    assignees: packageRecord.members,
    jql,
    total_bug: packageRecord.total_bug,
    resolved_bug: packageRecord.resolved_bug,
    issues: cloneIssues(packageRecord.issues),
  }
}

function buildCustomJqlBugStatisticsResponse(jql) {
  const packageRecord = getCustomJqlPackageTemplate(jql)
  if (!packageRecord) return []

  return (packageBugStatistics[packageRecord.id] ?? []).map((item) => ({
    bug_category: item.bug_category,
    number_of_bugs: item.number_of_bugs,
  }))
}

function buildCustomJqlSprintStatisticsResponse(jql) {
  const packageRecord = getCustomJqlPackageTemplate(jql)
  if (!packageRecord) return []

  return (packageSprintStatistics[packageRecord.id] ?? []).map((item) => ({
    sprint: item.sprint,
    resolved_bug: item.resolved_bug,
    total_bug: item.total_bug,
    new_bug: item.new_bug,
    resolved_bug_velocity: item.resolved_bug_velocity,
    target_bug_velocity: item.target_bug_velocity,
    target_reopened_rate: item.target_reopened_rate,
    resolved_bug_reopened: item.resolved_bug_reopened,
    reopened_bug: item.reopened_bug,
  }))
}

function getDashboardProject(projectId) {
  return dashboardProjects.find((project) => project.id === projectId) ?? null
}

function getDashboardMilestone(milestoneId) {
  return dashboardMilestones.find((item) => item.id === milestoneId) ?? null
}

function validateName(value) {
  return String(value || '').trim()
}

function validatePackagePayload(payload) {
  const name = validateName(payload.name)
  const startDate = String(payload.start_date || '').trim()
  const endDate = String(payload.end_date || '').trim()
  const projectId = Number(payload.bug_tracker_project)

  if (
    !name ||
    !startDate ||
    !endDate ||
    !Number.isInteger(projectId) ||
    projectId < 1
  ) {
    return null
  }

  return {
    name,
    keys: String(payload.keys || '').trim(),
    labels: String(payload.labels || '').trim(),
    members: String(payload.members || '').trim(),
    start_date: startDate,
    end_date: endDate,
    bug_tracker_project: projectId,
  }
}

function validateDashboardProjectPayload(payload) {
  const name = validateName(payload.name)
  const pm = Number(payload.pm)
  const pl = Number(payload.pl)

  if (!name) {
    return null
  }

  if (!Number.isInteger(pm) || pm < 0 || !Number.isInteger(pl) || pl < 0) {
    return null
  }

  return {
    name,
    keys: String(payload.keys || '').trim(),
    description: String(payload.description || '').trim(),
    members: String(payload.members || '').trim(),
    labels: String(payload.labels || '').trim(),
    pm,
    pl,
  }
}

function validateDashboardMilestonePayload(payload) {
  const name = validateName(payload.name)
  const startDate = String(payload.start_date || '').trim()
  const endDate = String(payload.end_date || '').trim()
  const projectId = Number(payload.project)

  if (
    !name ||
    !startDate ||
    !endDate ||
    !Number.isInteger(projectId) ||
    projectId < 1
  ) {
    return null
  }

  return {
    name,
    description: String(payload.description || '').trim(),
    start_date: startDate,
    end_date: endDate,
    project: projectId,
  }
}

const server = createServer(async (request, response) => {
  if (!request.url || !request.method) {
    sendJson(response, 404, { detail: 'Not found' })
    return
  }

  const requestUrl = getRequestUrl(request.url)
  const path = requestUrl.pathname

  if (request.method === 'OPTIONS') {
    response.writeHead(204, {
      'Access-Control-Allow-Origin': allowedOrigin,
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'GET,POST,PATCH,DELETE,OPTIONS',
    })
    response.end()
    return
  }

  if (path === '/api/health/' && request.method === 'GET') {
    sendJson(response, 200, { status: 'ok' })
    return
  }

  if (path === '/api/token/' && request.method === 'POST') {
    try {
      const payload = await readJsonBody(request)
      const username = validateName(payload.username)
      const password = validateName(payload.password)

      if (!username || !password) {
        sendJson(response, 400, {
          detail: 'Username and password are required.',
        })
        return
      }

      sendJson(response, 200, {
        access: createToken('access', username),
        refresh: createToken('refresh', username),
      })
      return
    } catch {
      sendJson(response, 400, { detail: 'Request body must be valid JSON.' })
      return
    }
  }

  if (path === '/api/token/refresh/' && request.method === 'POST') {
    try {
      const payload = await readJsonBody(request)
      const refresh = String(payload.refresh || '').trim()

      if (!refresh) {
        sendJson(response, 400, { detail: 'Refresh token is required.' })
        return
      }

      sendJson(response, 200, { access: createToken('access', refresh) })
      return
    } catch {
      sendJson(response, 400, { detail: 'Request body must be valid JSON.' })
      return
    }
  }

  if (path === '/api/accounts/users/' && request.method === 'GET') {
    sendJson(response, 200, buildAccountUsers())
    return
  }

  const jobStatusMatch = path.match(/^\/api\/job\/status\/([^/]+)\/$/)

  if (jobStatusMatch && request.method === 'GET') {
    const taskId = jobStatusMatch[1]
    const status = getSyncTaskStatus(taskId)

    if (!status) {
      sendJson(response, 404, { detail: 'Task not found.' })
      return
    }

    sendJson(response, 200, { status })
    return
  }

  if (path === '/api/dashboard/projects/' && request.method === 'GET') {
    sendJson(response, 200, dashboardProjects)
    return
  }

  if (path === '/api/dashboard/projects/' && request.method === 'POST') {
    try {
      const payload = await readJsonBody(request)
      const project = validateDashboardProjectPayload(payload)

      if (!project) {
        sendJson(response, 400, { detail: 'Project payload is incomplete.' })
        return
      }

      const nextProject = { id: dashboardProjectIdCounter++, ...project }
      dashboardProjects.push(nextProject)
      sendJson(response, 201, nextProject)
      return
    } catch {
      sendJson(response, 400, { detail: 'Request body must be valid JSON.' })
      return
    }
  }

  const dashboardProjectMatch = path.match(
    /^\/api\/dashboard\/projects\/(\d+)\/$/,
  )

  if (dashboardProjectMatch) {
    const projectId = Number(dashboardProjectMatch[1])
    const project = getDashboardProject(projectId)

    if (!project) {
      sendJson(response, 404, { detail: 'Project not found.' })
      return
    }

    if (request.method === 'GET') {
      sendJson(response, 200, project)
      return
    }

    if (request.method === 'PATCH') {
      try {
        const payload = await readJsonBody(request)
        const nextProject = validateDashboardProjectPayload({
          ...project,
          ...payload,
        })

        if (!nextProject) {
          sendJson(response, 400, { detail: 'Project payload is incomplete.' })
          return
        }

        Object.assign(project, nextProject)
        sendJson(response, 200, project)
        return
      } catch {
        sendJson(response, 400, { detail: 'Request body must be valid JSON.' })
        return
      }
    }

    if (request.method === 'DELETE') {
      const projectIndex = dashboardProjects.findIndex(
        (item) => item.id === projectId,
      )
      dashboardProjects.splice(projectIndex, 1)

      for (let index = dashboardMilestones.length - 1; index >= 0; index -= 1) {
        if (dashboardMilestones[index].project === projectId) {
          dashboardMilestones.splice(index, 1)
        }
      }

      sendJson(response, 204, null)
      return
    }
  }

  if (path === '/api/dashboard/milestones/' && request.method === 'GET') {
    const projectIdParam = requestUrl.searchParams.get('project_id')
    const projectId = projectIdParam ? Number(projectIdParam) : null

    if (projectIdParam && (!Number.isInteger(projectId) || projectId < 1)) {
      sendJson(response, 400, {
        detail: 'project_id must be a positive integer.',
      })
      return
    }

    sendJson(
      response,
      200,
      projectId === null
        ? dashboardMilestones
        : dashboardMilestones.filter((item) => item.project === projectId),
    )
    return
  }

  if (path === '/api/dashboard/milestones/' && request.method === 'POST') {
    try {
      const payload = await readJsonBody(request)
      const nextMilestone = validateDashboardMilestonePayload(payload)

      if (!nextMilestone) {
        sendJson(response, 400, { detail: 'Milestone payload is incomplete.' })
        return
      }

      if (!getDashboardProject(nextMilestone.project)) {
        sendJson(response, 404, { detail: 'Project not found.' })
        return
      }

      const milestone = {
        id: dashboardMilestoneIdCounter++,
        ...nextMilestone,
        closed_ticket: 0,
        total_ticket: 0,
        jql: '',
        issues: [],
        task_id: createSyncTask('milestone-sync'),
      }

      dashboardMilestones.push(milestone)
      sendJson(response, 201, milestone)
      return
    } catch {
      sendJson(response, 400, { detail: 'Request body must be valid JSON.' })
      return
    }
  }

  const dashboardMilestoneSprintMatch = path.match(
    /^\/api\/dashboard\/milestones\/(\d+)\/sprint-statistics\/$/,
  )

  if (dashboardMilestoneSprintMatch && request.method === 'GET') {
    const milestoneId = Number(dashboardMilestoneSprintMatch[1])

    if (!getDashboardMilestone(milestoneId)) {
      sendJson(response, 404, { detail: 'Milestone not found.' })
      return
    }

    sendJson(
      response,
      200,
      dashboardMilestoneSprintStatistics[milestoneId] ?? [],
    )
    return
  }

  const dashboardMilestoneMatch = path.match(
    /^\/api\/dashboard\/milestones\/(\d+)\/$/,
  )

  if (dashboardMilestoneMatch) {
    const milestoneId = Number(dashboardMilestoneMatch[1])
    const milestone = getDashboardMilestone(milestoneId)

    if (!milestone) {
      sendJson(response, 404, { detail: 'Milestone not found.' })
      return
    }

    if (request.method === 'GET') {
      sendJson(response, 200, milestone)
      return
    }

    if (request.method === 'PATCH') {
      try {
        const payload = await readJsonBody(request)
        const nextMilestone = validateDashboardMilestonePayload({
          ...milestone,
          ...payload,
        })

        if (!nextMilestone) {
          sendJson(response, 400, {
            detail: 'Milestone payload is incomplete.',
          })
          return
        }

        if (!getDashboardProject(nextMilestone.project)) {
          sendJson(response, 404, { detail: 'Project not found.' })
          return
        }

        Object.assign(milestone, nextMilestone)
        milestone.task_id = createSyncTask('milestone-sync')
        sendJson(response, 200, milestone)
        return
      } catch {
        sendJson(response, 400, { detail: 'Request body must be valid JSON.' })
        return
      }
    }

    if (request.method === 'DELETE') {
      const milestoneIndex = dashboardMilestones.findIndex(
        (item) => item.id === milestoneId,
      )
      dashboardMilestones.splice(milestoneIndex, 1)
      sendJson(response, 204, null)
      return
    }
  }

  if (path === '/api/bug-tracker/projects/' && request.method === 'GET') {
    sendJson(response, 200, projects)
    return
  }

  if (path === '/api/bug-tracker/projects/' && request.method === 'POST') {
    try {
      const payload = await readJsonBody(request)
      const name = validateName(payload.name)

      if (!name) {
        sendJson(response, 400, { detail: 'Project name is required.' })
        return
      }

      const project = { id: projectIdCounter++, name }
      projects.push(project)
      sendJson(response, 201, project)
      return
    } catch {
      sendJson(response, 400, { detail: 'Request body must be valid JSON.' })
      return
    }
  }

  const projectMatch = path.match(/^\/api\/bug-tracker\/projects\/(\d+)\/$/)

  if (projectMatch) {
    const projectId = Number(projectMatch[1])
    const project = getProject(projectId)

    if (!project) {
      sendJson(response, 404, { detail: 'Project not found.' })
      return
    }

    if (request.method === 'GET') {
      sendJson(response, 200, project)
      return
    }

    if (request.method === 'PATCH') {
      try {
        const payload = await readJsonBody(request)
        const name = validateName(payload.name)

        if (!name) {
          sendJson(response, 400, { detail: 'Project name is required.' })
          return
        }

        project.name = name
        sendJson(response, 200, project)
        return
      } catch {
        sendJson(response, 400, { detail: 'Request body must be valid JSON.' })
        return
      }
    }

    if (request.method === 'DELETE') {
      const projectIndex = projects.findIndex((item) => item.id === projectId)
      projects.splice(projectIndex, 1)

      for (let index = packages.length - 1; index >= 0; index -= 1) {
        if (packages[index].bug_tracker_project === projectId) {
          delete packageBugStatistics[packages[index].id]
          delete packageSprintStatistics[packages[index].id]
          packages.splice(index, 1)
        }
      }

      sendJson(response, 204, null)
      return
    }
  }

  if (path === '/api/bug-tracker/packages/' && request.method === 'GET') {
    const projectIdParam = requestUrl.searchParams.get('bug_tracker_project')
    const projectId = projectIdParam ? Number(projectIdParam) : null

    if (projectIdParam && (!Number.isInteger(projectId) || projectId < 1)) {
      sendJson(response, 400, {
        detail: 'bug_tracker_project must be a positive integer.',
      })
      return
    }

    sendJson(
      response,
      200,
      projectId === null
        ? packages
        : packages.filter((item) => item.bug_tracker_project === projectId),
    )
    return
  }

  if (
    path === '/api/bug-tracker/packages/jql/customize/' &&
    request.method === 'GET'
  ) {
    const jql = String(requestUrl.searchParams.get('jql') || '').trim()

    if (!jql) {
      sendJson(response, 400, { detail: 'jql is required.' })
      return
    }

    sendJson(response, 200, buildCustomJqlPackageResponse(jql))
    return
  }

  if (
    path === '/api/bug-tracker/packages/jql/customize/bug-statistics/' &&
    request.method === 'GET'
  ) {
    const jql = String(requestUrl.searchParams.get('jql') || '').trim()

    if (!jql) {
      sendJson(response, 400, { detail: 'jql is required.' })
      return
    }

    sendJson(response, 200, buildCustomJqlBugStatisticsResponse(jql))
    return
  }

  if (
    path === '/api/bug-tracker/packages/jql/customize/sprint-statistics/' &&
    request.method === 'GET'
  ) {
    const jql = String(requestUrl.searchParams.get('jql') || '').trim()

    if (!jql) {
      sendJson(response, 400, { detail: 'jql is required.' })
      return
    }

    sendJson(response, 200, buildCustomJqlSprintStatisticsResponse(jql))
    return
  }

  if (path === '/api/bug-tracker/packages/' && request.method === 'POST') {
    try {
      const payload = await readJsonBody(request)
      const nextPackage = validatePackagePayload(payload)

      if (!nextPackage) {
        sendJson(response, 400, { detail: 'Package payload is incomplete.' })
        return
      }

      if (!getProject(nextPackage.bug_tracker_project)) {
        sendJson(response, 404, { detail: 'Project not found.' })
        return
      }

      const packageRecord = {
        id: packageIdCounter++,
        ...nextPackage,
        resolved_bug: 0,
        total_bug: 0,
        issues: [],
        task_id: createSyncTask('package-sync'),
      }

      packages.push(packageRecord)
      packageBugStatistics[packageRecord.id] = buildBugStatistics(
        packageRecord.id,
        [],
      )
      packageSprintStatistics[packageRecord.id] = buildSprintStatistics(
        packageRecord.id,
        [],
      )
      sendJson(response, 201, packageRecord)
      return
    } catch {
      sendJson(response, 400, { detail: 'Request body must be valid JSON.' })
      return
    }
  }

  const packageStatisticsMatch = path.match(
    /^\/api\/bug-tracker\/packages\/(\d+)\/bug-statistics\/$/,
  )

  if (packageStatisticsMatch && request.method === 'GET') {
    const currentPackageId = Number(packageStatisticsMatch[1])
    const packageRecord = getPackage(currentPackageId)

    if (!packageRecord) {
      sendJson(response, 404, { detail: 'Package not found.' })
      return
    }

    sendJson(
      response,
      200,
      packageBugStatistics[currentPackageId] ??
        buildBugStatistics(currentPackageId, []),
    )
    return
  }

  const packageSprintStatisticsMatch = path.match(
    /^\/api\/bug-tracker\/packages\/(\d+)\/sprint-statistics\/$/,
  )

  if (packageSprintStatisticsMatch && request.method === 'GET') {
    const currentPackageId = Number(packageSprintStatisticsMatch[1])
    const packageRecord = getPackage(currentPackageId)

    if (!packageRecord) {
      sendJson(response, 404, { detail: 'Package not found.' })
      return
    }

    sendJson(response, 200, packageSprintStatistics[currentPackageId] ?? [])
    return
  }

  const packageMatch = path.match(/^\/api\/bug-tracker\/packages\/(\d+)\/$/)

  if (packageMatch) {
    const currentPackageId = Number(packageMatch[1])
    const packageRecord = getPackage(currentPackageId)

    if (!packageRecord) {
      sendJson(response, 404, { detail: 'Package not found.' })
      return
    }

    if (request.method === 'GET') {
      sendJson(response, 200, packageRecord)
      return
    }

    if (request.method === 'PATCH') {
      try {
        const payload = await readJsonBody(request)
        const nextPackage = validatePackagePayload({
          ...packageRecord,
          ...payload,
        })

        if (!nextPackage) {
          sendJson(response, 400, { detail: 'Package payload is incomplete.' })
          return
        }

        if (!getProject(nextPackage.bug_tracker_project)) {
          sendJson(response, 404, { detail: 'Project not found.' })
          return
        }

        Object.assign(packageRecord, nextPackage)
        packageRecord.task_id = createSyncTask('package-sync')
        sendJson(response, 200, packageRecord)
        return
      } catch {
        sendJson(response, 400, { detail: 'Request body must be valid JSON.' })
        return
      }
    }

    if (request.method === 'DELETE') {
      const packageIndex = packages.findIndex(
        (item) => item.id === currentPackageId,
      )
      packages.splice(packageIndex, 1)
      delete packageBugStatistics[currentPackageId]
      delete packageSprintStatistics[currentPackageId]
      sendJson(response, 204, null)
      return
    }
  }

  sendJson(response, 404, { detail: 'Not found' })
})

server.listen(port, () => {
  console.log(`Mock API listening on http://localhost:${port}`)
})
