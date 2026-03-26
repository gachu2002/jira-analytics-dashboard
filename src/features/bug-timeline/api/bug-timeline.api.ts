import { http } from '@/lib/http'

import type {
  BugTrackerPackage,
  BugTrackerPackagePayload,
  BugTrackerProject,
  BugTrackerProjectPayload,
  PackageBugStatistic,
} from '@/features/bug-timeline/types/bug-timeline.types'

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

export async function getBugTrackerProject(projectId: number) {
  const response = await http.get<BugTrackerProject>(
    `/api/bug-tracker/projects/${projectId}/`,
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

export async function getProjectPackages(projectId: number) {
  const response = await http.get<BugTrackerPackage[]>(
    '/api/bug-tracker/packages/',
    {
      params: {
        bug_tracker_project: projectId,
      },
    },
  )
  return response.data
}

export async function getAllProjectPackages() {
  const response = await http.get<BugTrackerPackage[]>(
    '/api/bug-tracker/packages/',
  )
  return response.data
}

export async function createProjectPackage(payload: BugTrackerPackagePayload) {
  const response = await http.post<BugTrackerPackage>(
    '/api/bug-tracker/packages/',
    payload,
  )
  return response.data
}

export async function getProjectPackage(packageId: number) {
  const response = await http.get<BugTrackerPackage>(
    `/api/bug-tracker/packages/${packageId}/`,
  )
  return response.data
}

export async function getPackageBugStatistics(packageId: number) {
  const response = await http.get<PackageBugStatistic[]>(
    `/api/bug-tracker/packages/${packageId}/bug-statistics/`,
  )
  return response.data
}

export async function updateProjectPackage(
  packageId: number,
  payload: Partial<BugTrackerPackagePayload>,
) {
  const response = await http.patch<BugTrackerPackage>(
    `/api/bug-tracker/packages/${packageId}/`,
    payload,
  )
  return response.data
}

export async function deleteProjectPackage(packageId: number) {
  await http.delete(`/api/bug-tracker/packages/${packageId}/`)
}
