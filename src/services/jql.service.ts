import type {
  CustomJqlBugStatisticDto,
  CustomJqlDashboardDto,
  CustomJqlSummaryDto,
  SprintMetricsDto,
} from '@/features/dashboard/types/dashboard.types'
import { http } from '@/services/http'

export const jqlService = {
  getCustomJqlSummary: async (jql: string) => {
    const response = await http.get<CustomJqlSummaryDto>(
      '/api/milestones/jql/customize/',
      {
        params: { jql },
      },
    )

    return response.data
  },
  getCustomJqlSprints: async (jql: string) => {
    const response = await http.get<SprintMetricsDto[]>(
      '/api/milestones/jql/customize/sprints/',
      {
        params: { jql },
      },
    )

    return response.data
  },
  executeCustomJql: async (jql: string): Promise<CustomJqlDashboardDto> => {
    const [summary, sprints] = await Promise.all([
      jqlService.getCustomJqlSummary(jql),
      jqlService.getCustomJqlSprints(jql),
    ])

    return {
      summary,
      sprints,
    }
  },
  getCustomJqlBugStatistics: async (jql: string) => {
    const response = await http.get<CustomJqlBugStatisticDto[]>(
      '/api/milestones/jql/customize/bug-statistics/',
      {
        params: { jql },
      },
    )

    return response.data
  },
}
