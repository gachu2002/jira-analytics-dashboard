import type {
  MilestoneDto,
  MilestoneProgressDto,
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
  getMilestoneProgresses: async (milestoneId: number) => {
    const response = await http.get<MilestoneProgressDto[]>(
      `/api/milestones/${milestoneId}/progresses/`,
    )
    return response.data
  },
}
