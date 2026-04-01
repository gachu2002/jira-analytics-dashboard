import { http } from '@/lib/http'

import type {
  DashboardMilestone,
  DashboardMilestonePayload,
  DashboardProject,
  DashboardProjectPayload,
  DashboardMilestoneSprintStatistic,
} from '@/features/milestones/types/milestone.types'

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
}

function mapMilestone(
  response: DashboardMilestoneResponse,
): DashboardMilestone {
  return {
    id: response.id,
    name: response.name,
    description: response.description,
    start_date: response.start_date,
    end_date: response.end_date,
    resolved_bug: response.closed_ticket,
    total_bug: response.total_ticket,
    jql: response.jql,
    issues: response.issues,
    bug_tracker_project: response.project,
    keys: '',
    labels: '',
    members: '',
  }
}

export async function getDashboardProjects() {
  const response = await http.get<DashboardProject[]>(
    '/api/dashboard/projects/',
  )
  return response.data
}

export async function createDashboardProject(payload: DashboardProjectPayload) {
  const response = await http.post<DashboardProject>(
    '/api/dashboard/projects/',
    payload,
  )
  return response.data
}

export async function updateDashboardProject(
  projectId: number,
  payload: Partial<DashboardProjectPayload>,
) {
  const response = await http.patch<DashboardProject>(
    `/api/dashboard/projects/${projectId}/`,
    payload,
  )
  return response.data
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
