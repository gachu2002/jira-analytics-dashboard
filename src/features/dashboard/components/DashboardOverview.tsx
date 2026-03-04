import { lazy, Suspense } from 'react'

import { FilterTagChips } from '@/components/common/FilterTagChips'
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
  data: DashboardData
}

export const DashboardOverview = ({ data }: DashboardOverviewProps) => {
  return (
    <div className="animate-in fade-in-50 space-y-5 duration-300">
      <header>
        <h1 className="metric-value text-base tracking-[-0.01em] text-[var(--text-primary)]">
          Overview
        </h1>
        <p className="mt-1 text-xs text-[var(--text-muted)]">
          Sprint 10 - Active sprint summary across all metrics
        </p>
      </header>

      <FilterTagChips filters={data.filters} jql={data.jql} />

      <section className="grid grid-cols-1 gap-3 min-[1024px]:grid-cols-2 min-[1440px]:grid-cols-4">
        <KpiCard
          label="Milestone Progress"
          value={`${data.milestoneProgress.completed}/${data.milestoneProgress.total} pts`}
          animatedValue={data.milestoneProgress.completed}
          formatter={(value) => `${value}/${data.milestoneProgress.total} pts`}
          subtext={`${data.milestoneProgress.completionPercent.toFixed(1)}% complete - Sprint 9 of 10`}
          delta={{ label: '66.3% complete', tone: 'blue' }}
          progress={{
            value: data.milestoneProgress.completed,
            max: data.milestoneProgress.total,
          }}
        />
        <KpiCard
          label="Remaining Bugs"
          value={data.remainingBugs.count.toString()}
          animatedValue={data.remainingBugs.count}
          subtext="50 original -> 21 remaining"
          delta={{ label: data.remainingBugs.deltaText, tone: 'green' }}
        />
        <KpiCard
          label="Bug Fix Rate"
          value={data.bugFixRate.value.toFixed(2)}
          animatedValue={Math.round(data.bugFixRate.value * 100)}
          formatter={(value) => (value / 100).toFixed(2)}
          subtext="7 new - 5 resolved this sprint"
          delta={{
            label: `Target: ${data.bugFixRate.target.toFixed(2)}`,
            tone: 'red',
          }}
        />
        <KpiCard
          label="Reopen Rate"
          value={`${(data.reopenRate.value * 100).toFixed(1)}%`}
          animatedValue={Math.round(data.reopenRate.value * 1000)}
          formatter={(value) => `${(value / 10).toFixed(1)}%`}
          subtext="0 reopened - 20 resolved"
          delta={{
            label: `Target: ${Math.round(data.reopenRate.target * 100)}%`,
            tone: 'green',
          }}
        />
      </section>

      <section className="grid grid-cols-1 gap-4 min-[1320px]:grid-cols-5">
        <div className="min-[1320px]:col-span-3">
          <Suspense fallback={<ChartSkeleton />}>
            <MilestoneProgressCard data={data.burnup} />
          </Suspense>
        </div>
        <div className="min-[1320px]:col-span-2">
          <Suspense fallback={<ChartSkeleton />}>
            <BugBurndownCard data={data.burndown} />
          </Suspense>
        </div>
      </section>
    </div>
  )
}

const ChartSkeleton = () => (
  <div className="skeleton dashboard-card h-[360px]" />
)
