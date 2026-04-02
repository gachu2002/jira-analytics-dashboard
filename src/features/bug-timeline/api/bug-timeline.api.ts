import { http } from '@/lib/http'

import type {
  BugTrackerBugCategory,
  BugTrackerCustomJqlPackage,
  BugTrackerPackage,
  BugTrackerPackagePayload,
  BugTrackerProject,
  BugTrackerProjectPayload,
  PackageBugStatistic,
  PackageSprintStatistic,
} from '@/features/bug-timeline/types/bug-timeline.types'

type BugTrackerPackageResponse = Omit<BugTrackerPackage, 'sync_status'>

function mapBugTrackerPackage(
  response: BugTrackerPackageResponse,
): BugTrackerPackage {
  return {
    ...response,
    sync_status: null,
  }
}

type BugTrackerCustomJqlBugStatisticResponse = {
  bug_category: BugTrackerBugCategory
  number_of_bugs: number
}

type BugTrackerCustomJqlSprintStatisticResponse = {
  sprint: PackageSprintStatistic['sprint']
  resolved_bug: number
  total_bug: number
  new_bug: number
  resolved_bug_velocity: number
  target_bug_velocity: number
  target_reopened_rate: number
  resolved_bug_reopened: number
  reopened_bug: number
}

function buildJqlQueryString(jql: string) {
  return new URLSearchParams({ jql }).toString()
}

function mapCustomJqlBugStatistics(
  response: BugTrackerCustomJqlBugStatisticResponse[],
): PackageBugStatistic[] {
  return response.map((item, index) => ({
    id: item.bug_category.id || index + 1,
    bug_category: item.bug_category,
    number_of_bugs: item.number_of_bugs,
    created_at: new Date(2026, 0, index + 1).toISOString(),
    active: true,
    package: 0,
  }))
}

function mapCustomJqlSprintStatistics(
  response: BugTrackerCustomJqlSprintStatisticResponse[],
): PackageSprintStatistic[] {
  return response.map((item, index) => ({
    id: item.sprint.id || index + 1,
    sprint: item.sprint,
    resolved_bug: item.resolved_bug,
    total_bug: item.total_bug,
    new_bug: item.new_bug,
    resolved_bug_velocity: item.resolved_bug_velocity,
    target_bug_velocity: item.target_bug_velocity,
    target_reopened_rate: item.target_reopened_rate,
    resolved_bug_reopened: item.resolved_bug_reopened,
    reopened_bug: item.reopened_bug,
    created_at: new Date(`${item.sprint.end_date}T00:00:00.000Z`).toISOString(),
    active: true,
    package: 0,
  }))
}

export async function getBugTrackerProjects() {
  const response = await http.get<BugTrackerProject[]>(
    '/api/bug-tracker/projects/',
  )
  return response.data
}

export async function createBugTrackerProject(
  payload: BugTrackerProjectPayload,
) {
  const response = await http.post<BugTrackerProject>(
    '/api/bug-tracker/projects/',
    payload,
  )
  return response.data
}

export async function updateBugTrackerProject(
  projectId: number,
  payload: Partial<BugTrackerProjectPayload>,
) {
  const response = await http.patch<BugTrackerProject>(
    `/api/bug-tracker/projects/${projectId}/`,
    payload,
  )
  return response.data
}

export async function deleteBugTrackerProject(projectId: number) {
  await http.delete(`/api/bug-tracker/projects/${projectId}/`)
}

export async function getAllProjectPackages() {
  const response = await http.get<BugTrackerPackageResponse[]>(
    '/api/bug-tracker/packages/',
  )
  return response.data.map(mapBugTrackerPackage)
}

export async function createProjectPackage(payload: BugTrackerPackagePayload) {
  const response = await http.post<BugTrackerPackageResponse>(
    '/api/bug-tracker/packages/',
    payload,
  )
  return mapBugTrackerPackage(response.data)
}

export async function getPackageBugStatistics(packageId: number) {
  const response = await http.get<PackageBugStatistic[]>(
    `/api/bug-tracker/packages/${packageId}/bug-statistics/`,
  )
  return response.data
}

export async function getPackageSprintStatistics(packageId: number) {
  const response = await http.get<PackageSprintStatistic[]>(
    `/api/bug-tracker/packages/${packageId}/sprint-statistics/`,
  )
  return response.data
}

export async function getCustomJqlPackage(jql: string) {
  const response = await http.get<BugTrackerCustomJqlPackage>(
    `/api/bug-tracker/packages/jql/customize/?${buildJqlQueryString(jql)}`,
  )
  return response.data
}

export async function getCustomJqlBugStatistics(jql: string) {
  const response = await http.get<BugTrackerCustomJqlBugStatisticResponse[]>(
    `/api/bug-tracker/packages/jql/customize/bug-statistics/?${buildJqlQueryString(jql)}`,
  )
  return mapCustomJqlBugStatistics(response.data)
}

export async function getCustomJqlSprintStatistics(jql: string) {
  const response = await http.get<BugTrackerCustomJqlSprintStatisticResponse[]>(
    `/api/bug-tracker/packages/jql/customize/sprint-statistics/?${buildJqlQueryString(jql)}`,
  )
  return mapCustomJqlSprintStatistics(response.data)
}

export async function updateProjectPackage(
  packageId: number,
  payload: Partial<BugTrackerPackagePayload>,
) {
  const response = await http.patch<BugTrackerPackageResponse>(
    `/api/bug-tracker/packages/${packageId}/`,
    payload,
  )
  return mapBugTrackerPackage(response.data)
}

export async function deleteProjectPackage(packageId: number) {
  await http.delete(`/api/bug-tracker/packages/${packageId}/`)
}
