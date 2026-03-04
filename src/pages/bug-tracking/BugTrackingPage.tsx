import { AlertTriangle } from 'lucide-react'

import { KpiCard } from '@/components/common/KpiCard'
import { BugBurndownCard } from '@/features/dashboard/components/BugBurndownCard'
import { useDashboardQuery } from '@/features/dashboard/api/dashboard.api'

const recentBugs = [
  {
    id: 'BUG-041',
    title: 'Payment gateway timeout on high load',
    priority: 'Critical',
    age: 3,
    assignee: 'AL',
  },
  {
    id: 'BUG-039',
    title: 'Race condition in auth token refresh',
    priority: 'High',
    age: 5,
    assignee: 'SR',
  },
  {
    id: 'BUG-037',
    title: 'Search index not updated after bulk import',
    priority: 'High',
    age: 7,
    assignee: 'MK',
  },
  {
    id: 'BUG-035',
    title: 'Notification service memory leak',
    priority: 'High',
    age: 9,
    assignee: 'JT',
  },
]

const priorityData = [
  { priority: 'Critical', count: 3, color: '#F75C5C' },
  { priority: 'High', count: 7, color: '#F5A623' },
  { priority: 'Medium', count: 8, color: '#4F7EF7' },
  { priority: 'Low', count: 3, color: '#4A5068' },
]

export const BugTrackingPage = () => {
  const { data } = useDashboardQuery()

  if (!data) {
    return null
  }

  return (
    <div className="space-y-4">
      <header>
        <h1 className="metric-value text-base text-[var(--text-primary)]">
          Bug Tracking
        </h1>
        <p className="mt-1 text-xs text-[var(--text-muted)]">
          Bug burndown - remaining vs ideal resolution trajectory
        </p>
      </header>

      <section className="grid grid-cols-1 gap-3 min-[1024px]:grid-cols-2 min-[1440px]:grid-cols-4">
        <KpiCard
          label="Open Bugs"
          value="21"
          animatedValue={21}
          subtext="50 reported - 29 resolved"
          delta={{ label: '-2 vs prev sprint', tone: 'green' }}
        />
        <KpiCard
          label="Critical / High"
          value="10"
          animatedValue={10}
          subtext="3 critical - 7 high"
          delta={{ label: 'needs attention', tone: 'red' }}
        />
        <KpiCard
          label="Avg Age (days)"
          value="8.3d"
          animatedValue={83}
          formatter={(value) => `${(value / 10).toFixed(1)}d`}
          subtext="Oldest: BUG-041 (3d)"
          delta={{ label: '↑1.2d vs S9', tone: 'amber' }}
        />
        <KpiCard
          label="Resolved This Sprint"
          value="5"
          animatedValue={5}
          subtext="Net: +2 this sprint"
          delta={{ label: '7 new opened', tone: 'amber' }}
        />
      </section>

      <BugBurndownCard data={data.burndown} />

      <section className="grid grid-cols-1 gap-4 min-[1320px]:grid-cols-3">
        <div className="dashboard-card p-4 min-[1320px]:col-span-1">
          <p className="mb-3 text-[10px] tracking-[0.1em] text-[var(--text-muted)] uppercase">
            By Priority
          </p>
          {priorityData.map((item) => (
            <div className="mb-3" key={item.priority}>
              <div className="mb-1 flex items-center justify-between">
                <span className="text-xs text-[var(--text-secondary)]">
                  {item.priority}
                </span>
                <span className="metric-value text-xs text-[var(--text-primary)]">
                  {item.count}
                </span>
              </div>
              <div className="h-[3px] overflow-hidden rounded-[2px] bg-[var(--border)]">
                <div
                  className="h-full"
                  style={{
                    background: item.color,
                    width: `${(item.count / 21) * 100}%`,
                  }}
                />
              </div>
            </div>
          ))}
          <div className="mt-4 flex items-center gap-1.5 border-t border-[var(--border)] pt-3 text-[11px] text-[var(--text-secondary)]">
            <AlertTriangle
              size={12}
              strokeWidth={1.5}
              style={{ color: 'var(--accent-amber)' }}
            />
            Behind ideal by{' '}
            <span className="metric-value text-[var(--accent-amber)]">
              12 bugs
            </span>
          </div>
        </div>

        <div className="dashboard-card overflow-hidden p-4 min-[1320px]:col-span-2">
          <p className="mb-3 text-[10px] tracking-[0.1em] text-[var(--text-muted)] uppercase">
            Open Bugs (High+)
          </p>
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="border-b border-[var(--border)]">
                {['ID', 'Title', 'Priority', 'Age', 'Assignee'].map(
                  (header, index) => (
                    <th
                      className={`px-2 py-1 text-[10px] tracking-[0.08em] text-[var(--text-muted)] uppercase ${index > 1 ? 'text-right' : 'text-left'}`}
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
                  <td className="metric-value px-2 text-[var(--accent-blue)]">
                    {bug.id}
                  </td>
                  <td className="max-w-60 overflow-hidden px-2 text-ellipsis whitespace-nowrap text-[var(--text-secondary)]">
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
                  <td className="metric-value px-2 text-right text-[var(--text-secondary)]">
                    {bug.age}d
                  </td>
                  <td className="px-2 text-right">
                    <span className="metric-value rounded-full border border-[var(--border)] bg-[var(--surface-elevated)] px-1.5 py-0.5 text-[10px] text-[var(--text-secondary)]">
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
