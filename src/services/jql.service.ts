import type { CustomJqlResponseDto } from '@/features/dashboard/types/dashboard.types'
import { http } from '@/services/http'

export const jqlService = {
  executeCustomJql: async (jql: string) => {
    const response = await http.get<CustomJqlResponseDto>(
      '/api/sprints/jql/customize/',
      {
        params: { jql },
      },
    )

    return response.data
  },
}
