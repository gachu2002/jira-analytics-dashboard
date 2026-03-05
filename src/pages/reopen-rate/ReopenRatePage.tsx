import { KpiCard } from '@/components/common/KpiCard'
import { ReopenRateCard } from '@/features/dashboard/components/ReopenRateCard'
import { useDashboardQuery } from '@/features/dashboard/api/dashboard.api'

export const ReopenRatePage = () => {
  const { data } = useDashboardQuery()

  if (!data) {
    return null
  }

  if (data.reopenRateSeries.length === 0) {
    return null
  }

  const aboveTarget = data.reopenRateSeries.filter(
    (point) => point.rate > point.target,
  ).length
  const averageRate =
    data.reopenRateSeries.reduce((sum, point) => sum + point.rate, 0) /
    data.reopenRateSeries.length
  const totalReopened = data.reopenRateSeries.reduce(
    (sum, point) => sum + point.reopened,
    0,
  )
  const totalResolved = data.reopenRateSeries.reduce(
    (sum, point) => sum + point.resolved,
    0,
  )
  const worstRate = Math.max(...data.reopenRateSeries.map((item) => item.rate))

  return (
    <div className="space-y-4">
      <header>
        <h1 className="metric-value text-text-primary text-base">
          Reopen Rate
        </h1>
        <p className="text-text-muted mt-1 text-xs">
          Bug reopen trend - quality signal with 3% target threshold
        </p>
      </header>

      <section className="grid grid-cols-1 gap-3 min-[1024px]:grid-cols-2 min-[1440px]:grid-cols-4">
        <KpiCard
          label="Current Rate"
          value={`${(data.reopenRate.value * 100).toFixed(1)}%`}
          animatedValue={Math.round(data.reopenRate.value * 1000)}
          formatter={(value) => `${(value / 10).toFixed(1)}%`}
          subtext={`Current sprint reopen trend (${data.reopenRateSeries[data.reopenRateSeries.length - 1]?.sprint ?? '--'})`}
          delta={{ label: 'Target: 3%', tone: 'green' }}
        />
        <KpiCard
          label="Season Average"
          value={`${(averageRate * 100).toFixed(1)}%`}
          animatedValue={Math.round(averageRate * 1000)}
          formatter={(value) => `${(value / 10).toFixed(1)}%`}
          subtext={`${aboveTarget} of 12 sprints exceeded 3%`}
          delta={{
            label: `${aboveTarget} above target`,
            tone: aboveTarget > 3 ? 'red' : 'amber',
          }}
        />
        <KpiCard
          label="Total Reopened"
          value={totalReopened.toString()}
          animatedValue={totalReopened}
          subtext={`${((totalReopened / totalResolved) * 100).toFixed(1)}% overall reopen rate`}
          delta={{ label: `of ${totalResolved} resolved`, tone: 'amber' }}
        />
        <KpiCard
          label="Worst Sprint"
          value={`${(worstRate * 100).toFixed(1)}%`}
          animatedValue={Math.round(worstRate * 1000)}
          formatter={(value) => `${(value / 10).toFixed(1)}%`}
          subtext="Highest observed reopen ratio"
          delta={{ label: 'Quality hotspot', tone: 'red' }}
        />
      </section>

      <section className="grid grid-cols-1 gap-4 min-[1320px]:grid-cols-2">
        <ReopenRateCard data={data.reopenRateSeries} fullWidth />

        <section className="dashboard-card p-4">
          <p className="text-text-muted mb-3 text-[10px] tracking-[0.1em] uppercase">
            Quality Insights
          </p>

          {[
            {
              title: 'Recent Trend',
              value: 'Improving',
              color: 'var(--accent-green)',
              detail:
                'Last three sprints show consistent improvement below target.',
            },
            {
              title: 'High-Risk Sprints',
              value: 'S5, S6',
              color: 'var(--accent-red)',
              detail: '4%+ reopen rate correlated with major scope changes.',
            },
            {
              title: 'Target Compliance',
              value: `${data.reopenRateSeries.length - aboveTarget}/${data.reopenRateSeries.length}`,
              color: 'var(--accent-amber)',
              detail: 'Sprints meeting the <=3% quality threshold.',
            },
            {
              title: 'QA Throughput',
              value: `${totalResolved} total`,
              color: 'var(--accent-blue)',
              detail: `${totalResolved} bugs verified across all sprints.`,
            },
          ].map((item) => (
            <div
              className="border-border mb-3 border-b pb-3 last:mb-0 last:border-b-0 last:pb-0"
              key={item.title}
            >
              <div className="mb-1 flex items-center justify-between">
                <span className="text-text-secondary text-xs">
                  {item.title}
                </span>
                <span
                  className="metric-value text-xs"
                  style={{ color: item.color }}
                >
                  {item.value}
                </span>
              </div>
              <p className="text-text-muted text-[11px] leading-5">
                {item.detail}
              </p>
            </div>
          ))}

          <div className="mt-3">
            <div className="text-text-secondary mb-1 flex items-center justify-between text-[11px]">
              <span>Target compliance</span>
              <span className="metric-value text-text-primary">
                {data.reopenRateSeries.length - aboveTarget}/12
              </span>
            </div>
            <div className="flex gap-1">
              {data.reopenRateSeries.map((point) => {
                const good = point.rate <= point.target

                return (
                  <div
                    className="flex h-5 flex-1 items-center justify-center rounded-[2px] border"
                    key={point.sprint}
                    style={{
                      background: good
                        ? 'rgba(61,214,140,0.25)'
                        : 'rgba(247,92,92,0.25)',
                      borderColor: good
                        ? 'rgba(61,214,140,0.45)'
                        : 'rgba(247,92,92,0.45)',
                    }}
                    title={`${point.sprint}: ${(point.rate * 100).toFixed(1)}%`}
                  >
                    <span
                      className="metric-value text-[9px]"
                      style={{
                        color: good
                          ? 'var(--accent-green)'
                          : 'var(--accent-red)',
                      }}
                    >
                      {point.sprint.replace('S', '')}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      </section>
    </div>
  )
}
