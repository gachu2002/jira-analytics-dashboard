import {
  useQueries,
  useQueryClient,
  type QueryKey,
} from '@tanstack/react-query'
import { useEffect, useMemo, useRef } from 'react'

import { http } from '@/lib/http'

type SyncJobStatusResponse = {
  status: string
}

const TERMINAL_SYNC_STATUSES = new Set(['SUCCESS', 'FAIL', 'FAILED', 'FAILURE'])

async function getSyncJobStatus(taskId: string) {
  const response = await http.get<SyncJobStatusResponse>(
    `/api/job/status/${taskId}/`,
  )

  return response.data.status
}

function isTerminalSyncStatus(status: string | undefined) {
  return Boolean(status && TERMINAL_SYNC_STATUSES.has(status))
}

export function useTimelineSyncStatus(
  taskIds: Array<string | null | undefined>,
  options?: {
    invalidateQueryKey?: QueryKey
  },
) {
  const queryClient = useQueryClient()
  const uniqueTaskIds = useMemo(
    () => [...new Set(taskIds.filter(Boolean))] as string[],
    [taskIds],
  )
  const invalidatedTaskIdsRef = useRef<Set<string>>(new Set())

  const results = useQueries({
    queries: uniqueTaskIds.map((taskId) => ({
      queryKey: ['timeline-sync-status', taskId],
      queryFn: () => getSyncJobStatus(taskId),
      staleTime: 0,
      retry: false,
      refetchInterval: ({ state }: { state: { data?: string } }) =>
        isTerminalSyncStatus(state.data) ? false : 10000,
    })),
  })

  useEffect(() => {
    invalidatedTaskIdsRef.current.forEach((taskId) => {
      if (!uniqueTaskIds.includes(taskId)) {
        invalidatedTaskIdsRef.current.delete(taskId)
      }
    })
  }, [uniqueTaskIds])

  useEffect(() => {
    if (!options?.invalidateQueryKey) {
      return
    }

    const hasNewTerminalTask = uniqueTaskIds.some((taskId, index) => {
      const status = results[index]?.data

      if (!isTerminalSyncStatus(status)) {
        return false
      }

      if (invalidatedTaskIdsRef.current.has(taskId)) {
        return false
      }

      invalidatedTaskIdsRef.current.add(taskId)
      return true
    })

    if (!hasNewTerminalTask) {
      return
    }

    void queryClient.invalidateQueries({ queryKey: options.invalidateQueryKey })
  }, [options?.invalidateQueryKey, queryClient, results, uniqueTaskIds])

  return useMemo(() => {
    const statusByTaskId = new Map<string, string>()

    uniqueTaskIds.forEach((taskId, index) => {
      statusByTaskId.set(taskId, results[index]?.data ?? 'PROCESSING')
    })

    return statusByTaskId
  }, [results, uniqueTaskIds])
}
