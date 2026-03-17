import { DashboardStateNotice } from '@/features/dashboard/components/DashboardStateNotice'
import { KpiCard } from '@/components/common/KpiCard'
import {
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableHeader,
  DataTableHeaderCell,
  DataTableRow,
} from '@/components/common/DataTable/DataTable'
import { BugVelocityCard } from '@/features/dashboard/components/BugVelocityCard'
import { useDashboardQuery } from '@/features/dashboard/api/dashboard.api'
import { useDashboardFilters } from '@/features/dashboard/hooks/useDashboardFilters'
import { getActiveSprint } from '@/features/dashboard/utils/sprint'

export const VelocityPage = () => {
  const { data, isJqlDraftMode } = useDashboardQuery()
  const { selectedSprint } = useDashboardFilters()

  if (isJqlDraftMode) {
    return (
      <DashboardStateNotice
        message="Run the current JQL to populate velocity cards, chart, and table."
        title="JQL draft only"
      />
    )
  }

  if (!data) {
    return null
  }

  if (data.velocity.length === 0) {
    return (
      <div className="dashboard-card text-text-muted p-4 text-sm">
        No sprint velocity data is available for this milestone.
      </div>
    )
  }

  const current = getActiveSprint(data.velocity, selectedSprint)
  const totalNewBugs = data.velocity.reduce((sum, row) => sum + row.newBugs, 0)
  const totalResolvedBugs = data.velocity.reduce(
    (sum, row) => sum + row.resolvedBugs,
    0,
  )

  return (
    <div className="space-y-4">
      <header>
        <h1 className="metric-value text-text-primary text-base">
          Bug Fixing Velocity
        </h1>
        <p className="text-text-muted mt-1 text-xs">
          New vs resolved bugs - fix rate trend with target threshold
        </p>
      </header>

      <section className="grid grid-cols-1 gap-3 min-[1024px]:grid-cols-2 min-[1440px]:grid-cols-4">
        <KpiCard
          label="Total New Bugs"
          value={totalNewBugs.toString()}
          animatedValue={totalNewBugs}
        />
        <KpiCard
          label="Total Resolved Bugs"
          value={totalResolvedBugs.toString()}
          animatedValue={totalResolvedBugs}
        />
        <KpiCard
          label="Rate"
          value={current.rate.toFixed(2)}
          animatedValue={Math.round(current.rate * 100)}
          formatter={(value) => (value / 100).toFixed(2)}
          subtext={`${current.resolvedBugs} resolved / ${current.newBugs} new`}
          delta={{
            label: `Target: ${current.target.toFixed(2)}`,
            tone: current.rate >= current.target ? 'green' : 'red',
          }}
        />
        <KpiCard
          label="Target"
          value={current.target.toFixed(2)}
          animatedValue={Math.round(current.target * 100)}
          formatter={(value) => (value / 100).toFixed(2)}
          subtext="Bug-fix velocity target threshold"
        />
      </section>

      <BugVelocityCard chartHeight={260} data={data.velocity} />

      <section className="dashboard-card p-4">
        <p className="text-text-muted mb-3 text-[10px] tracking-[0.1em] uppercase">
          Sprint Detail
        </p>
        <DataTable>
          <DataTableHeader>
            <tr>
              <DataTableHeaderCell>Sprint</DataTableHeaderCell>
              <DataTableHeaderCell numeric>New Bugs</DataTableHeaderCell>
              <DataTableHeaderCell numeric>Resolved</DataTableHeaderCell>
              <DataTableHeaderCell numeric>Rate</DataTableHeaderCell>
              <DataTableHeaderCell numeric>Target</DataTableHeaderCell>
            </tr>
          </DataTableHeader>
          <DataTableBody>
            {data.velocity.map((row) => {
              const aboveTarget = row.rate >= row.target

              return (
                <DataTableRow
                  active={row.sprintId === current?.sprintId}
                  key={row.sprint}
                >
                  <DataTableCell>{row.sprint}</DataTableCell>
                  <DataTableCell numeric>{row.newBugs}</DataTableCell>
                  <DataTableCell numeric>{row.resolvedBugs}</DataTableCell>
                  <DataTableCell numeric>
                    <span
                      className="metric-value rounded-[2px] px-1.5 py-0.5 text-[10px]"
                      style={{
                        background: aboveTarget
                          ? 'var(--status-success-soft)'
                          : 'var(--status-danger-soft)',
                        color: aboveTarget
                          ? 'var(--status-success)'
                          : 'var(--status-danger)',
                      }}
                    >
                      {row.rate.toFixed(2)}
                    </span>
                  </DataTableCell>
                  <DataTableCell numeric>
                    <span
                      className={`metric-value ${aboveTarget ? 'text-success' : 'text-text-muted'}`}
                    >
                      {row.target.toFixed(2)}
                    </span>
                  </DataTableCell>
                </DataTableRow>
              )
            })}
          </DataTableBody>
        </DataTable>
      </section>
    </div>
  )
}
