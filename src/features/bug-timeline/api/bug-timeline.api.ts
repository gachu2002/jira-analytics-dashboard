import { http } from '@/lib/http'

import type {
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
