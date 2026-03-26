import { createHash, randomUUID } from 'node:crypto'
import { createServer } from 'node:http'

const port = Number(process.env.PORT || 8080)
const allowedOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173'

let projectIdCounter = 4
let packageIdCounter = 12

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

function buildIssue(key, summary, assignee, status) {
  return {
    url: `http://jira.lge.com/issue/browse/${key}`,
    key,
    summary,
    assignee,
    status,
  }
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

const projects = [
  { id: 1, name: 'Atlas Cloud' },
  { id: 2, name: 'Console Platform' },
  { id: 3, name: 'Mobile Release Train' },
]

const packages = [
  {
    id: 1,
    name: 'Authentication hardening',
    keys: 'ATL-104, ATL-111',
    labels: 'auth, blocker',
    members: 'Mai, Ben',
    jql: 'project = ATL AND labels = auth',
    start_date: '2026-03-05',
    end_date: '2026-04-03',
    resolved_bug: 18,
    total_bug: 24,
    issues: [
      buildIssue(
        'ATL-104',
        'Session refresh fails after long idle state.',
        'Mai',
        'Closed',
      ),
      buildIssue(
        'ATL-111',
        'MFA prompt overlaps settings drawer.',
        'Ben',
        'Resolved',
      ),
      buildIssue(
        'ATL-118',
        'Password reset email token expires too early.',
        'Mai',
        'Closed',
      ),
    ],
    bug_tracker_project: 1,
  },
  {
    id: 2,
    name: 'Search stability',
    keys: 'ATL-132, ATL-136, ATL-141',
    labels: 'search, regression',
    members: 'Linh, Huy',
    jql: 'project = ATL AND component = Search',
    start_date: '2026-04-02',
    end_date: '2026-05-04',
    resolved_bug: 11,
    total_bug: 26,
    issues: [
      buildIssue(
        'ATL-132',
        'Search query stalls on repeated filter changes.',
        'Linh',
        'Open',
      ),
      buildIssue(
        'ATL-136',
        'Query cache mismatch after project switch.',
        'Huy',
        'In Progress',
      ),
      buildIssue(
        'ATL-141',
        'Stale count shown in bug grid summary.',
        'Linh',
        'Closed',
      ),
    ],
    bug_tracker_project: 1,
  },
  {
    id: 3,
    name: 'Audit trail fixes',
    keys: 'CON-21, CON-31',
    labels: 'audit, compliance',
    members: 'Quang, Amy',
    jql: 'project = CON AND labels in (audit, compliance)',
    start_date: '2026-03-12',
    end_date: '2026-04-18',
    resolved_bug: 8,
    total_bug: 9,
    issues: [
      buildIssue(
        'CON-21',
        'Audit trail omits impersonation action.',
        'Quang',
        'Closed',
      ),
      buildIssue(
        'CON-31',
        'Compliance export misses timezone details.',
        'Amy',
        'Resolved',
      ),
    ],
    bug_tracker_project: 2,
  },
  {
    id: 4,
    name: 'Dashboard query tuning',
    keys: 'CON-55, CON-61, CON-74',
    labels: 'performance, query',
    members: 'Khanh, Zoe',
    jql: 'project = CON AND labels = performance',
    start_date: '2026-04-10',
    end_date: '2026-05-22',
    resolved_bug: 14,
    total_bug: 20,
    issues: [
      buildIssue(
        'CON-55',
        'Slow dashboard load on large account scope.',
        'Khanh',
        'In Progress',
      ),
      buildIssue(
        'CON-61',
        'Duplicate query request on tab restore.',
        'Zoe',
        'Closed',
      ),
      buildIssue(
        'CON-74',
        'Widget totals drift after live refresh.',
        'Khanh',
        'Open',
      ),
    ],
    bug_tracker_project: 2,
  },
  {
    id: 5,
    name: 'Push notification reliability',
    keys: 'MOB-13, MOB-18',
    labels: 'notification, ios, android',
    members: 'Trang, Omar',
    jql: 'project = MOB AND labels = notification',
    start_date: '2026-03-01',
    end_date: '2026-03-29',
    resolved_bug: 7,
    total_bug: 18,
    issues: [
      buildIssue(
        'MOB-13',
        'Push token invalid after OS upgrade.',
        'Trang',
        'Closed',
      ),
      buildIssue(
        'MOB-18',
        'Android notifications delayed in background.',
        'Omar',
        'Resolved',
      ),
    ],
    bug_tracker_project: 3,
  },
  {
    id: 6,
    name: 'Crash analytics triage',
    keys: 'MOB-42, MOB-44, MOB-45',
    labels: 'crash, release',
    members: 'Trang, Deepa',
    jql: 'project = MOB AND labels = crash',
    start_date: '2026-04-01',
    end_date: '2026-05-11',
    resolved_bug: 16,
    total_bug: 17,
    issues: [
      buildIssue(
        'MOB-42',
        'Crash dashboard groups iOS stack traces incorrectly.',
        'Trang',
        'Closed',
      ),
      buildIssue(
        'MOB-44',
        'Release alert does not include build number.',
        'Deepa',
        'Closed',
      ),
      buildIssue(
        'MOB-45',
        'Crash bucket label mismatches store release.',
        'Trang',
        'Open',
      ),
    ],
    bug_tracker_project: 3,
  },
]

const packageBugStatistics = {
  1: buildBugStatistics(1, [4, 2, 5, 3, 1, 0, 1, 1, 0, 2, 1, 1, 2, 0, 1]),
  2: buildBugStatistics(2, [3, 1, 4, 5, 2, 1, 0, 2, 0, 1, 2, 1, 3, 0, 1]),
  3: buildBugStatistics(3, [1, 0, 2, 1, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 1]),
  4: buildBugStatistics(4, [2, 1, 3, 4, 1, 1, 0, 1, 0, 1, 2, 1, 2, 0, 1]),
  5: buildBugStatistics(5, [2, 0, 3, 2, 1, 0, 1, 1, 0, 0, 1, 1, 2, 2, 2]),
  6: buildBugStatistics(6, [1, 0, 2, 1, 0, 0, 0, 0, 0, 1, 1, 1, 3, 0, 1]),
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
    jql: String(payload.jql || '').trim(),
    start_date: startDate,
    end_date: endDate,
    bug_tracker_project: projectId,
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
      }

      packages.push(packageRecord)
      packageBugStatistics[packageRecord.id] = buildBugStatistics(
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
      sendJson(response, 204, null)
      return
    }
  }

  sendJson(response, 404, { detail: 'Not found' })
})

server.listen(port, () => {
  console.log(`Mock API listening on http://localhost:${port}`)
})
