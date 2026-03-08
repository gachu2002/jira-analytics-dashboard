import { lazy, Suspense } from 'react'

import { KpiCard } from '@/components/common/KpiCard'
import type { DashboardData } from '@/features/dashboard/types/dashboard.types'

const MilestoneProgressCard = lazy(() =>
  import('@/features/dashboard/components/MilestoneProgressCard').then(
    (module) => ({
      default: module.MilestoneProgressCard,
    }),
  ),
)
const BugBurndownCard = lazy(() =>
  import('@/features/dashboard/components/BugBurndownCard').then((module) => ({
    default: module.BugBurndownCard,
  })),
)

type DashboardOverviewProps = {
  activeSprint?: string
  data: DashboardData
}

export const DashboardOverview = ({
  activeSprint,
  data,
}: DashboardOverviewProps) => {
  const burnupPoint =
    data.burnup.find((item) => item.sprint === activeSprint) ??
    data.burnup[data.burnup.length - 1]
  const burndownPoint =
    data.burndown.find((item) => item.sprint === activeSprint) ??
    data.burndown[data.burndown.length - 1]
  const burndownIndex = data.burndown.findIndex(
    (item) => item.sprint === burndownPoint?.sprint,
  )
  const previousBurndownPoint = data.burndown[burndownIndex - 1]
  const velocityPoint =
    data.velocity.find((item) => item.sprint === activeSprint) ??
    data.velocity[data.velocity.length - 1]
  const reopenPoint =
    data.reopenRateSeries.find((item) => item.sprint === activeSprint) ??
    data.reopenRateSeries[data.reopenRateSeries.length - 1]
  const completionPercent = burnupPoint?.scope
    ? Number(((burnupPoint.completed / burnupPoint.scope) * 100).toFixed(1))
    : 0
  const remainingBugDelta = burndownPoint
    ? (burndownPoint.remaining ?? 0) -
      (previousBurndownPoint?.remaining ?? burndownPoint.remaining)
    : 0
  const remainingBugDeltaText =
    remainingBugDelta === 0
      ? 'No change vs previous sprint'
      : `${remainingBugDelta > 0 ? '+' : '-'}${Math.abs(remainingBugDelta)} vs previous sprint`

  return (
    <div className="animate-in fade-in-50 space-y-5 duration-300">
      <header>
        <h1 className="metric-value text-text-primary text-base tracking-[-0.01em]">
          Overview
        </h1>
        <p className="text-text-muted mt-1 text-xs">
          Active milestone summary across points and quality metrics
        </p>
      </header>

      <section className="grid grid-cols-1 gap-3 min-[1024px]:grid-cols-2 min-[1440px]:grid-cols-4">
        <KpiCard
          label="Milestone Progress"
          value={`${burnupPoint?.completed ?? data.milestoneProgress.completed}/${burnupPoint?.scope ?? data.milestoneProgress.total} pts`}
          animatedValue={
            burnupPoint?.completed ?? data.milestoneProgress.completed
          }
          formatter={(value) =>
            `${value}/${burnupPoint?.scope ?? data.milestoneProgress.total} pts`
          }
          subtext={`${completionPercent.toFixed(1)}% complete`}
          delta={{
            label: `${completionPercent.toFixed(1)}% complete`,
            tone: 'blue',
          }}
          progress={{
            value: burnupPoint?.completed ?? data.milestoneProgress.completed,
            max: burnupPoint?.scope ?? data.milestoneProgress.total,
          }}
        />
        <KpiCard
          label="Remaining Bugs"
          value={(
            burndownPoint?.remaining ?? data.remainingBugs.count
          ).toString()}
          animatedValue={burndownPoint?.remaining ?? data.remainingBugs.count}
          subtext={`${activeSprint ?? data.meta.currentSprint} open defects`}
          delta={{
            label: remainingBugDeltaText,
            tone: remainingBugDelta <= 0 ? 'green' : 'red',
          }}
        />
        <KpiCard
          label="Bug Fix Rate"
          value={(velocityPoint?.rate ?? data.bugFixRate.value).toFixed(2)}
          animatedValue={Math.round(
            (velocityPoint?.rate ?? data.bugFixRate.value) * 100,
          )}
          formatter={(value) => (value / 100).toFixed(2)}
          subtext={`${velocityPoint?.sprint ?? data.meta.currentSprint} delivery rate`}
          delta={{
            label: `Target: ${(velocityPoint?.target ?? data.bugFixRate.target).toFixed(2)}`,
            tone: 'red',
          }}
        />
        <KpiCard
          label="Reopen Rate"
          value={`${((reopenPoint?.rate ?? data.reopenRate.value) * 100).toFixed(1)}%`}
          animatedValue={Math.round(
            (reopenPoint?.rate ?? data.reopenRate.value) * 1000,
          )}
          formatter={(value) => `${(value / 10).toFixed(1)}%`}
          subtext={`${reopenPoint?.sprint ?? data.meta.currentSprint} reopen rate`}
          delta={{
            label: `Target: ${Math.round((reopenPoint?.target ?? data.reopenRate.target) * 100)}%`,
            tone: 'green',
          }}
        />
      </section>

      <section className="grid grid-cols-1 gap-4 min-[1320px]:grid-cols-5">
        <div className="min-w-0 min-[1320px]:col-span-3">
          <Suspense fallback={<ChartSkeleton />}>
            <MilestoneProgressCard
              activeSprint={activeSprint}
              data={data.burnup}
            />
          </Suspense>
        </div>
        <div className="min-w-0 min-[1320px]:col-span-2">
          <Suspense fallback={<ChartSkeleton />}>
            <BugBurndownCard activeSprint={activeSprint} data={data.burndown} />
          </Suspense>
        </div>
      </section>
    </div>
  )
}

const ChartSkeleton = () => (
  <div className="skeleton dashboard-card h-[360px]" />
)
