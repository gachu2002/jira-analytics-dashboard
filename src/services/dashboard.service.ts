import type {
  MilestoneJqlDto,
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
  getMilestoneJql: async (milestoneId: number) => {
    const response = await http.get<MilestoneJqlDto>(
      `/api/milestones/${milestoneId}/jql/`,
    )
    return response.data
  },
}
