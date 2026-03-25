import { http } from '@/lib/http'

import type {
  BugTrackerPackage,
  BugTrackerPackagePayload,
  BugTrackerProject,
  BugTrackerProjectPayload,
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
    `/api/bug-tracker/projects/${projectId}/packages/`,
  )
  return response.data
}

export async function createProjectPackage(
  projectId: number,
  payload: BugTrackerPackagePayload,
) {
  const response = await http.post<BugTrackerPackage>(
    `/api/bug-tracker/projects/${projectId}/packages/`,
    payload,
  )
  return response.data
}

export async function getProjectPackage(projectId: number, packageId: number) {
  const response = await http.get<BugTrackerPackage>(
    `/api/bug-tracker/projects/${projectId}/packages/${packageId}/`,
  )
  return response.data
}

export async function updateProjectPackage(
  projectId: number,
  packageId: number,
  payload: Partial<BugTrackerPackagePayload>,
) {
  const response = await http.patch<BugTrackerPackage>(
    `/api/bug-tracker/projects/${projectId}/packages/${packageId}/`,
    payload,
  )
  return response.data
}

export async function deleteProjectPackage(
  projectId: number,
  packageId: number,
) {
  await http.delete(
    `/api/bug-tracker/projects/${projectId}/packages/${packageId}/`,
  )
}
