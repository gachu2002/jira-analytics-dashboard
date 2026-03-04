import { useQuery } from '@tanstack/react-query'

import { dashboardMockData } from '@/features/dashboard/data/dashboard.mock'

export const useDashboardQuery = () =>
  useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => dashboardMockData,
  })
