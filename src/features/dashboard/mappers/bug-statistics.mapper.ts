import type {
  BugStatisticPoint,
  CustomJqlBugStatisticDto,
  MilestoneBugStatisticDto,
} from '@/features/dashboard/types/dashboard.types'

type BugStatisticsSource =
  | MilestoneBugStatisticDto[]
  | CustomJqlBugStatisticDto[]

const toNumber = (value: number) => Number(value)

export const mapBugStatistics = (
  statistics: BugStatisticsSource,
): BugStatisticPoint[] => {
  const total = statistics.reduce(
    (sum, item) => sum + Math.max(toNumber(item.number_of_bugs), 0),
    0,
  )

  return [...statistics]
    .map((item) => {
      const count = Math.max(toNumber(item.number_of_bugs), 0)

      return {
        category: item.bug_category,
        count,
        share: total > 0 ? Number(((count / total) * 100).toFixed(1)) : 0,
      }
    })
    .sort((left, right) => right.count - left.count)
}
