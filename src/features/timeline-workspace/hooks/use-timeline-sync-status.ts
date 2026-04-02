import { useQueries } from '@tanstack/react-query'
import { useMemo } from 'react'

import { http } from '@/lib/http'

type SyncJobStatusResponse = {
  status: string
}

async function getSyncJobStatus(taskId: string) {
  const response = await http.get<SyncJobStatusResponse>(
    `/api/job/status/${taskId}/`,
  )

  return response.data.status
}

export function useTimelineSyncStatus(
  taskIds: Array<string | null | undefined>,
) {
  const uniqueTaskIds = useMemo(
    () => [...new Set(taskIds.filter(Boolean))] as string[],
    [taskIds],
  )

  const results = useQueries({
    queries: uniqueTaskIds.map((taskId) => ({
      queryKey: ['timeline-sync-status', taskId],
      queryFn: () => getSyncJobStatus(taskId),
      staleTime: 0,
      retry: false,
      refetchInterval: ({ state }: { state: { data?: string } }) =>
        state.data === 'done' ? false : 10000,
    })),
  })

  return useMemo(() => {
    const statusByTaskId = new Map<string, string>()

    uniqueTaskIds.forEach((taskId, index) => {
      statusByTaskId.set(taskId, results[index]?.data ?? 'syncing')
    })

    return statusByTaskId
  }, [results, uniqueTaskIds])
}
