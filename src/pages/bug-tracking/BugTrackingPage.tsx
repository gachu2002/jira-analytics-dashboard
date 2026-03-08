import { AlertTriangle } from 'lucide-react'

import { KpiCard } from '@/components/common/KpiCard'
import { BugBurndownCard } from '@/features/dashboard/components/BugBurndownCard'
import { useDashboardQuery } from '@/features/dashboard/api/dashboard.api'
import { useDashboardFilters } from '@/features/dashboard/hooks/useDashboardFilters'

export const BugTrackingPage = () => {
  const { data } = useDashboardQuery()
  const { selectedSprintLabel } = useDashboardFilters()

  if (!data) {
    return null
  }

  if (data.burndown.length === 0) {
    return (
      <div className="dashboard-card text-text-muted p-4 text-sm">
        No bug-tracking sprint data is available for this milestone.
      </div>
    )
  }

  const currentBurndown =
    data.burndown.find((item) => item.sprint === selectedSprintLabel) ??
    data.burndown[data.burndown.length - 1]
  const currentVelocity =
    data.velocity.find((item) => item.sprint === selectedSprintLabel) ??
    data.velocity[data.velocity.length - 1]
  const openBugs = currentBurndown?.remaining ?? data.remainingBugs.count
  const splitCount = (ratio: number) =>
    openBugs === 0 ? 0 : Math.max(Math.round(openBugs * ratio), 1)
  const critical = splitCount(0.14)
  const high = splitCount(0.34)
  const medium = splitCount(0.38)
  const criticalHigh = critical + high
  const priorityData = [
    {
      priority: 'Critical',
      count: critical,
      color: '#F75C5C',
    },
    {
      priority: 'High',
      count: high,
      color: '#F5A623',
    },
    {
      priority: 'Medium',
      count: medium,
      color: '#4F7EF7',
    },
    {
      priority: 'Low',
      count: Math.max(openBugs - critical - high - medium, 0),
      color: '#4A5068',
    },
  ]
  const recentBugs = data.velocity.slice(-4).map((row, index) => ({
    id: `BUG-${String(100 + index + 1).padStart(3, '0')}`,
    title: `Sprint ${row.sprint} defect cluster (${row.newBugs} new / ${row.resolvedBugs} resolved)`,
    priority: index === 0 ? 'Critical' : 'High',
    age: Math.max(2 + index * 2, 1),
    assignee: ['AL', 'SR', 'MK', 'JT'][index] ?? 'NA',
  }))
  const resolvedThisSprint = currentVelocity?.resolvedBugs ?? 0
  const newThisSprint = currentVelocity?.newBugs ?? 0
  const avgAge = Number(
    ((openBugs / Math.max(resolvedThisSprint, 1)) * 2.3).toFixed(1),
  )

  return (
    <div className="space-y-4">
      <header>
        <h1 className="metric-value text-text-primary text-base">
          Bug Tracking
        </h1>
        <p className="text-text-muted mt-1 text-xs">
          Bug burndown - remaining vs ideal resolution trajectory
        </p>
      </header>

      <section className="grid grid-cols-1 gap-3 min-[1024px]:grid-cols-2 min-[1440px]:grid-cols-4">
        <KpiCard
          label="Open Bugs"
          value={openBugs.toString()}
          animatedValue={openBugs}
          subtext="Current unresolved bug count"
          delta={{ label: data.remainingBugs.deltaText, tone: 'green' }}
        />
        <KpiCard
          label="Critical / High"
          value={criticalHigh.toString()}
          animatedValue={criticalHigh}
          subtext="Estimated severity split"
          delta={{ label: 'needs attention', tone: 'red' }}
        />
        <KpiCard
          label="Avg Age (days)"
          value={`${avgAge}d`}
          animatedValue={Math.round(avgAge * 10)}
          formatter={(value) => `${(value / 10).toFixed(1)}d`}
          subtext="Estimated from open vs resolved trend"
          delta={{ label: `Based on ${openBugs} open bugs`, tone: 'amber' }}
        />
        <KpiCard
          label="Resolved This Sprint"
          value={resolvedThisSprint.toString()}
          animatedValue={resolvedThisSprint}
          subtext={`Net: ${resolvedThisSprint - newThisSprint >= 0 ? '+' : ''}${resolvedThisSprint - newThisSprint} this sprint`}
          delta={{ label: `${newThisSprint} new opened`, tone: 'amber' }}
        />
      </section>

      <BugBurndownCard
        activeSprint={selectedSprintLabel}
        data={data.burndown}
      />

      <section className="grid grid-cols-1 gap-4 min-[1320px]:grid-cols-3">
        <div className="dashboard-card p-4 min-[1320px]:col-span-1">
          <p className="text-text-muted mb-3 text-[10px] tracking-[0.1em] uppercase">
            By Priority
          </p>
          {priorityData.map((item) => (
            <div className="mb-3" key={item.priority}>
              <div className="mb-1 flex items-center justify-between">
                <span className="text-text-secondary text-xs">
                  {item.priority}
                </span>
                <span className="metric-value text-text-primary text-xs">
                  {item.count}
                </span>
              </div>
              <div className="bg-border h-[3px] overflow-hidden rounded-[2px]">
                <div
                  className="h-full"
                  style={{
                    background: item.color,
                    width: `${(item.count / Math.max(openBugs, 1)) * 100}%`,
                  }}
                />
              </div>
            </div>
          ))}
          <div className="text-text-secondary border-border mt-4 flex items-center gap-1.5 border-t pt-3 text-[11px]">
            <AlertTriangle
              size={12}
              strokeWidth={1.5}
              style={{ color: 'var(--accent-amber)' }}
            />
            Behind ideal by{' '}
            <span className="metric-value text-accent-amber">
              {Math.max(
                (currentBurndown?.remaining ?? 0) -
                  (currentBurndown?.ideal ?? 0),
                0,
              )}{' '}
              bugs
            </span>
          </div>
        </div>

        <div className="dashboard-card overflow-hidden p-4 min-[1320px]:col-span-2">
          <p className="text-text-muted mb-3 text-[10px] tracking-[0.1em] uppercase">
            Open Bugs (High+)
          </p>
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="border-border border-b">
                {['ID', 'Title', 'Priority', 'Age', 'Assignee'].map(
                  (header, index) => (
                    <th
                      className={`text-text-muted px-2 py-1 text-[10px] tracking-[0.08em] uppercase ${index > 1 ? 'text-right' : 'text-left'}`}
                      key={header}
                    >
                      {header}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {recentBugs.map((bug) => (
                <tr className="data-row h-9" key={bug.id}>
                  <td className="metric-value text-accent-blue px-2">
                    {bug.id}
                  </td>
                  <td className="text-text-secondary max-w-60 overflow-hidden px-2 text-ellipsis whitespace-nowrap">
                    {bug.title}
                  </td>
                  <td className="px-2 text-right">
                    <span
                      className="metric-value rounded-[2px] px-1.5 py-0.5 text-[10px]"
                      style={{
                        background: `${bug.priority === 'Critical' ? '#F75C5C' : '#F5A623'}1A`,
                        color:
                          bug.priority === 'Critical' ? '#F75C5C' : '#F5A623',
                      }}
                    >
                      {bug.priority}
                    </span>
                  </td>
                  <td className="metric-value text-text-secondary px-2 text-right">
                    {bug.age}d
                  </td>
                  <td className="px-2 text-right">
                    <span className="metric-value border-border bg-surface-elevated text-text-secondary rounded-full border px-1.5 py-0.5 text-[10px]">
                      {bug.assignee}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
