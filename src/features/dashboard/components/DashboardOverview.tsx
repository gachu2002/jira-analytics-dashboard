import { lazy, Suspense } from 'react'

import { KpiCard } from '@/components/common/KpiCard'
import type { DashboardData } from '@/features/dashboard/types/dashboard.types'
import {
  getActiveSprint,
  getPreviousSprint,
} from '@/features/dashboard/utils/sprint'

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
const BugVelocityCard = lazy(() =>
  import('@/features/dashboard/components/BugVelocityCard').then((module) => ({
    default: module.BugVelocityCard,
  })),
)
const ReopenRateCard = lazy(() =>
  import('@/features/dashboard/components/ReopenRateCard').then((module) => ({
    default: module.ReopenRateCard,
  })),
)

type DashboardOverviewProps = {
  activeSprintId?: number | null
  data: DashboardData
}

export const DashboardOverview = ({
  activeSprintId,
  data,
}: DashboardOverviewProps) => {
  const burnupPoint = getActiveSprint(data.burnup, activeSprintId)
  const burndownPoint = getActiveSprint(data.burndown, activeSprintId)
  const previousBurndownPoint = getPreviousSprint(data.burndown, activeSprintId)
  const velocityPoint = getActiveSprint(data.velocity, activeSprintId)
  const reopenPoint = getActiveSprint(data.reopenRateSeries, activeSprintId)
  const resolvedBugDelta = burndownPoint
    ? (burndownPoint.resolved ?? 0) -
      (previousBurndownPoint?.resolved ?? burndownPoint.resolved)
    : 0

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
          label="Milestone"
          value={`${burnupPoint?.completed ?? data.milestoneProgress.completed} pts`}
          animatedValue={
            burnupPoint?.completed ?? data.milestoneProgress.completed
          }
          formatter={(value) => `${value} pts`}
          subtext={`Completed work vs ${(burnupPoint?.ideal ?? 0).toFixed(1)} ideal`}
          delta={{
            label: `Scope ${(burnupPoint?.scope ?? data.milestoneProgress.total).toFixed(0)} pts`,
            tone: 'blue',
          }}
          progress={{
            value: burnupPoint?.completed ?? data.milestoneProgress.completed,
            max: burnupPoint?.scope ?? data.milestoneProgress.total,
          }}
        />
        <KpiCard
          label="Bug Fix"
          value={(burndownPoint?.resolved ?? 0).toString()}
          animatedValue={burndownPoint?.resolved ?? 0}
          subtext={`Resolved vs ${(burndownPoint?.ideal ?? 0).toFixed(1)} ideal`}
          delta={{
            label: `Total bugs ${burndownPoint?.total ?? 0}`,
            tone: resolvedBugDelta >= 0 ? 'green' : 'amber',
          }}
        />
        <KpiCard
          label="Bug Fix Velocity"
          value={(velocityPoint?.rate ?? data.bugFixRate.value).toFixed(2)}
          animatedValue={Math.round(
            (velocityPoint?.rate ?? data.bugFixRate.value) * 100,
          )}
          formatter={(value) => (value / 100).toFixed(2)}
          subtext={`${velocityPoint?.resolvedBugs ?? 0} resolved / ${velocityPoint?.newBugs ?? 0} new`}
          delta={{
            label: `Target: ${(velocityPoint?.target ?? data.bugFixRate.target).toFixed(2)}`,
            tone:
              (velocityPoint?.rate ?? data.bugFixRate.value) >=
              (velocityPoint?.target ?? data.bugFixRate.target)
                ? 'green'
                : 'red',
          }}
        />
        <KpiCard
          label="Reopened Rate"
          value={`${((reopenPoint?.rate ?? data.reopenRate.value) * 100).toFixed(1)}%`}
          animatedValue={Math.round(
            (reopenPoint?.rate ?? data.reopenRate.value) * 1000,
          )}
          formatter={(value) => `${(value / 10).toFixed(1)}%`}
          subtext={`${reopenPoint?.reopened ?? 0} reopened / ${reopenPoint?.resolved ?? 0} resolved`}
          delta={{
            label: `Target: ${Math.round((reopenPoint?.target ?? data.reopenRate.target) * 100)}%`,
            tone:
              (reopenPoint?.rate ?? data.reopenRate.value) <=
              (reopenPoint?.target ?? data.reopenRate.target)
                ? 'green'
                : 'red',
          }}
        />
      </section>

      <section className="grid grid-cols-1 gap-4 min-[1320px]:grid-cols-2">
        <div className="min-w-0">
          <Suspense fallback={<ChartSkeleton />}>
            <MilestoneProgressCard
              activeSprintId={activeSprintId}
              data={data.burnup}
              showTable={false}
            />
          </Suspense>
        </div>
        <div className="min-w-0">
          <Suspense fallback={<ChartSkeleton />}>
            <BugBurndownCard
              activeSprintId={activeSprintId}
              data={data.burndown}
              showTable={false}
            />
          </Suspense>
        </div>
        <div className="min-w-0">
          <Suspense fallback={<ChartSkeleton />}>
            <BugVelocityCard data={data.velocity} />
          </Suspense>
        </div>
        <div className="min-w-0">
          <Suspense fallback={<ChartSkeleton />}>
            <ReopenRateCard
              activeSprintId={activeSprintId}
              data={data.reopenRateSeries}
              showTable={false}
            />
          </Suspense>
        </div>
      </section>
    </div>
  )
}

const ChartSkeleton = () => (
  <div className="skeleton dashboard-card h-[360px]" />
)
