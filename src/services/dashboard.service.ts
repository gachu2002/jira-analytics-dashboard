import type {
  MilestoneDto,
  MilestoneSprintDto,
  ProjectDto,
} from '@/features/dashboard/types/dashboard.types'
import { http } from '@/services/http'

export const dashboardService = {
  getProjects: async () => {
    const response = await http.get<ProjectDto[]>('/api/projects/')
    return response.data
  },
  getMilestones: async (projectId: number) => {
    const response = await http.get<MilestoneDto[]>(
      `/api/projects/${projectId}/milestones/`,
    )
    return response.data
  },
  getMilestoneSprints: async (milestoneId: number) => {
    const response = await http.get<MilestoneSprintDto[]>(
      `/api/milestones/${milestoneId}/sprints/`,
    )
    return response.data
  },
}
