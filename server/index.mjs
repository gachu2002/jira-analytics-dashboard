import { createHash, randomUUID } from 'node:crypto'
import { createServer } from 'node:http'

const port = Number(process.env.PORT || 8080)
const allowedOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173'

let projectIdCounter = 4
let packageIdCounter = 12

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
    bug_tracker_project: 3,
  },
]

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

function getPath(requestUrl) {
  return new URL(requestUrl, `http://localhost:${port}`).pathname
}

function getProject(projectId) {
  return projects.find((project) => project.id === projectId) ?? null
}

function getPackage(projectId, currentPackageId) {
  return (
    packages.find(
      (item) =>
        item.bug_tracker_project === projectId && item.id === currentPackageId,
    ) ?? null
  )
}

function validateName(value) {
  return String(value || '').trim()
}

function validatePackagePayload(payload) {
  const name = validateName(payload.name)
  const startDate = String(payload.start_date || '').trim()
  const endDate = String(payload.end_date || '').trim()

  if (!name || !startDate || !endDate) {
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
  }
}

const server = createServer(async (request, response) => {
  if (!request.url || !request.method) {
    sendJson(response, 404, { detail: 'Not found' })
    return
  }

  const path = getPath(request.url)

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
          packages.splice(index, 1)
        }
      }

      sendJson(response, 204, null)
      return
    }
  }

  const packagesMatch = path.match(
    /^\/api\/bug-tracker\/projects\/(\d+)\/packages\/$/,
  )

  if (packagesMatch) {
    const projectId = Number(packagesMatch[1])
    const project = getProject(projectId)

    if (!project) {
      sendJson(response, 404, { detail: 'Project not found.' })
      return
    }

    if (request.method === 'GET') {
      sendJson(
        response,
        200,
        packages.filter((item) => item.bug_tracker_project === projectId),
      )
      return
    }

    if (request.method === 'POST') {
      try {
        const payload = await readJsonBody(request)
        const nextPackage = validatePackagePayload(payload)

        if (!nextPackage) {
          sendJson(response, 400, { detail: 'Package payload is incomplete.' })
          return
        }

        const packageRecord = {
          id: packageIdCounter++,
          ...nextPackage,
          resolved_bug: 0,
          total_bug: 0,
          bug_tracker_project: projectId,
        }

        packages.push(packageRecord)
        sendJson(response, 201, packageRecord)
        return
      } catch {
        sendJson(response, 400, { detail: 'Request body must be valid JSON.' })
        return
      }
    }
  }

  const packageMatch = path.match(
    /^\/api\/bug-tracker\/projects\/(\d+)\/packages\/(\d+)\/$/,
  )

  if (packageMatch) {
    const projectId = Number(packageMatch[1])
    const currentPackageId = Number(packageMatch[2])
    const project = getProject(projectId)
    const packageRecord = getPackage(projectId, currentPackageId)

    if (!project || !packageRecord) {
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
      sendJson(response, 204, null)
      return
    }
  }

  sendJson(response, 404, { detail: 'Not found' })
})

server.listen(port, () => {
  console.log(`Mock API listening on http://localhost:${port}`)
})
