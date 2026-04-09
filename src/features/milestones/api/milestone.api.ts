import { http } from '@/lib/http'
import type { AccountUser } from '@/features/auth/types/account.types'
import { isIssueDoneStatus } from '@/features/timeline-workspace/utils/timeline-workspace.utils'

import type {
  DashboardMilestone,
  DashboardMilestonePayload,
  DashboardProject,
  DashboardProjectPayload,
  DashboardMilestoneSprintStatistic,
} from '@/features/milestones/types/milestone.types'

type DashboardProjectResponse = Omit<DashboardProject, 'pm' | 'pl'> & {
  pm?: number | AccountUser | null
  pl?: number | AccountUser | null
}

function getAccountUserId(value?: number | AccountUser | null) {
  if (typeof value === 'number') {
    return value
  }

  if (value && typeof value === 'object' && typeof value.id === 'number') {
    return value.id
  }

  return null
}

type DashboardMilestoneResponse = {
  id: number
  name: string
  description: string
  start_date: string
  end_date: string
  closed_ticket: number
  total_ticket: number
  jql: string
  issues: DashboardMilestone['issues']
  project: number
  task_id: string | null
}

function mapMilestone(
  response: DashboardMilestoneResponse,
): DashboardMilestone {
  const resolvedCount = response.issues.length
    ? response.issues.filter((issue) => isIssueDoneStatus(issue.status)).length
    : response.closed_ticket

  return {
    id: response.id,
    name: response.name,
    description: response.description,
    start_date: response.start_date,
    end_date: response.end_date,
    resolved_bug: resolvedCount,
    total_bug: response.total_ticket,
    jql: response.jql,
    issues: response.issues,
    bug_tracker_project: response.project,
    keys: '',
    labels: '',
    members: '',
    task_id: response.task_id,
    sync_status: null,
  }
}

function mapDashboardProject(
  response: DashboardProjectResponse,
): DashboardProject {
  return {
    ...response,
    pm: getAccountUserId(response.pm),
    pl: getAccountUserId(response.pl),
  }
}

export async function getDashboardProjects() {
  const response = await http.get<DashboardProjectResponse[]>(
    '/api/dashboard/projects/',
  )
  return response.data.map(mapDashboardProject)
}

export async function createDashboardProject(payload: DashboardProjectPayload) {
  const response = await http.post<DashboardProjectResponse>(
    '/api/dashboard/projects/',
    payload,
  )
  return mapDashboardProject(response.data)
}

export async function updateDashboardProject(
  projectId: number,
  payload: Partial<DashboardProjectPayload>,
) {
  const response = await http.patch<DashboardProjectResponse>(
    `/api/dashboard/projects/${projectId}/`,
    payload,
  )
  return mapDashboardProject(response.data)
}

export async function deleteDashboardProject(projectId: number) {
  await http.delete(`/api/dashboard/projects/${projectId}/`)
}

export async function getAllProjectMilestones() {
  const response = await http.get<DashboardMilestoneResponse[]>(
    '/api/dashboard/milestones/',
  )
  return response.data.map(mapMilestone)
}

export async function createProjectMilestone(
  payload: DashboardMilestonePayload,
) {
  const response = await http.post<DashboardMilestoneResponse>(
    '/api/dashboard/milestones/',
    {
      name: payload.name,
      description: payload.description,
      start_date: payload.start_date,
      end_date: payload.end_date,
      project: payload.bug_tracker_project,
    },
  )
  return mapMilestone(response.data)
}

export async function getMilestoneSprintStatistics(milestoneId: number) {
  const response = await http.get<DashboardMilestoneSprintStatistic[]>(
    `/api/dashboard/milestones/${milestoneId}/sprint-statistics/`,
  )
  return response.data
}

export async function updateProjectMilestone(
  packageId: number,
  payload: Partial<DashboardMilestonePayload>,
) {
  const response = await http.patch<DashboardMilestoneResponse>(
    `/api/dashboard/milestones/${packageId}/`,
    {
      ...(payload.name !== undefined ? { name: payload.name } : null),
      ...(payload.description !== undefined
        ? { description: payload.description }
        : null),
      ...(payload.start_date !== undefined
        ? { start_date: payload.start_date }
        : null),
      ...(payload.end_date !== undefined
        ? { end_date: payload.end_date }
        : null),
      ...(payload.bug_tracker_project !== undefined
        ? { project: payload.bug_tracker_project }
        : null),
    },
  )
  return mapMilestone(response.data)
}

export async function deleteProjectMilestone(packageId: number) {
  await http.delete(`/api/dashboard/milestones/${packageId}/`)
}
