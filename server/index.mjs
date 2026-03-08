import { createServer } from 'node:http'

import {
  milestonesByProject,
  projects,
  sprintsByMilestone,
} from './mock-data.mjs'

const PORT = Number(process.env.PORT ?? 8080)
const refreshToUser = new Map()
const validAccessTokens = new Set()

const sendJson = (res, statusCode, payload) => {
  res.writeHead(statusCode, {
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  })
  res.end(JSON.stringify(payload))
}

const readBody = (req) =>
  new Promise((resolve, reject) => {
    let body = ''
    req.on('data', (chunk) => {
      body += chunk
    })
    req.on('end', () => {
      if (!body) {
        resolve({})
        return
      }

      try {
        resolve(JSON.parse(body))
      } catch {
        reject(new Error('Invalid JSON body'))
      }
    })
    req.on('error', reject)
  })

const issueToken = (prefix, username) =>
  `${prefix}-${username}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`

const requireAuth = (req, res) => {
  const authorization = req.headers.authorization
  const token = authorization?.startsWith('Bearer ')
    ? authorization.slice('Bearer '.length)
    : null

  if (!token || !validAccessTokens.has(token)) {
    sendJson(res, 401, { detail: 'Unauthorized' })
    return false
  }

  return true
}

const server = createServer(async (req, res) => {
  const { method = 'GET' } = req
  const url = new URL(req.url ?? '/', `http://${req.headers.host}`)
  const { pathname } = url

  if (method === 'OPTIONS') {
    sendJson(res, 204, {})
    return
  }

  if (method === 'POST' && pathname === '/api/token/') {
    try {
      const body = await readBody(req)
      const username = typeof body.username === 'string' ? body.username : ''
      const password = typeof body.password === 'string' ? body.password : ''

      if (!username || !password) {
        sendJson(res, 400, { detail: 'username and password are required' })
        return
      }

      const access = issueToken('access', username)
      const refresh = issueToken('refresh', username)
      refreshToUser.set(refresh, username)
      validAccessTokens.add(access)

      sendJson(res, 200, { access, refresh })
      return
    } catch (error) {
      sendJson(res, 400, { detail: error.message })
      return
    }
  }

  if (method === 'POST' && pathname === '/api/token/refresh/') {
    try {
      const body = await readBody(req)
      const refresh = typeof body.refresh === 'string' ? body.refresh : ''
      const username = refreshToUser.get(refresh)

      if (!username) {
        sendJson(res, 401, { detail: 'Invalid refresh token' })
        return
      }

      const access = issueToken('access', username)
      validAccessTokens.add(access)

      sendJson(res, 200, { access })
      return
    } catch (error) {
      sendJson(res, 400, { detail: error.message })
      return
    }
  }

  if (!requireAuth(req, res)) {
    return
  }

  if (method === 'GET' && pathname === '/api/projects/') {
    sendJson(res, 200, projects)
    return
  }

  const projectMilestoneMatch = pathname.match(
    /^\/api\/projects\/(\d+)\/milestones\/$/,
  )
  if (method === 'GET' && projectMilestoneMatch) {
    const projectId = Number(projectMilestoneMatch[1])
    sendJson(res, 200, milestonesByProject[projectId] ?? [])
    return
  }

  const milestoneSprintMatch = pathname.match(
    /^\/api\/milestones\/(\d+)\/sprints\/$/,
  )
  if (method === 'GET' && milestoneSprintMatch) {
    const milestoneId = Number(milestoneSprintMatch[1])
    sendJson(res, 200, sprintsByMilestone[milestoneId] ?? [])
    return
  }

  sendJson(res, 404, { detail: 'Not found' })
})

server.listen(PORT, () => {
  console.log(`Mock API server listening on http://localhost:${PORT}`)
})
