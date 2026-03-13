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
import { BugBurndownCard } from '@/features/dashboard/components/BugBurndownCard'
import { useDashboardQuery } from '@/features/dashboard/api/dashboard.api'
import { useDashboardFilters } from '@/features/dashboard/hooks/useDashboardFilters'
import {
  getActiveSprint,
  getPreviousSprint,
} from '@/features/dashboard/utils/sprint'

export const BugTrackingPage = () => {
  const { data, isJqlDraftMode } = useDashboardQuery()
  const { selectedSprint } = useDashboardFilters()

  if (isJqlDraftMode) {
    return (
      <DashboardStateNotice
        message="Run the current JQL to populate bug-fix cards, chart, and table."
        title="JQL draft only"
      />
    )
  }

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

  const current = getActiveSprint(data.burndown, selectedSprint)
  const previous = getPreviousSprint(data.burndown, selectedSprint)
  const idealDelta = current.ideal - (previous?.ideal ?? current.ideal)
  const resolvedDelta =
    current.resolved - (previous?.resolved ?? current.resolved)

  return (
    <div className="space-y-4">
      <header>
        <h1 className="metric-value text-text-primary text-base">Bug Fix</h1>
        <p className="text-text-muted mt-1 text-xs">
          Resolved bugs against total scope and ideal trajectory
        </p>
      </header>

      <section className="grid grid-cols-1 gap-3 min-[1024px]:grid-cols-2 min-[1440px]:grid-cols-4">
        <KpiCard
          label="Resolved Bugs"
          value={current.resolved.toString()}
          animatedValue={current.resolved}
          subtext={`${current.sprint} cumulative resolved bugs`}
          delta={{
            label: `${resolvedDelta >= 0 ? '+' : ''}${resolvedDelta} vs previous sprint`,
            tone: resolvedDelta >= 0 ? 'green' : 'amber',
          }}
        />
        <KpiCard
          label="Total Bugs"
          value={current.total.toString()}
          animatedValue={current.total}
          subtext="Milestone total bugs baseline"
        />
        <KpiCard
          label="Ideal"
          value={current.ideal.toFixed(1)}
          animatedValue={Math.round(current.ideal * 10)}
          formatter={(value) => (value / 10).toFixed(1)}
          subtext={`Total bugs / ${data.burndown.length} sprints x sprint ${current.sprintNumber}`}
          delta={{
            label: `${idealDelta >= 0 ? '+' : ''}${idealDelta.toFixed(1)} vs previous sprint`,
            tone: 'amber',
          }}
        />
        <KpiCard
          label="Sprint Number"
          value={current.sprintNumber.toString()}
          animatedValue={current.sprintNumber}
          subtext={`Selected sprint out of ${data.burndown.length}`}
        />
      </section>

      <BugBurndownCard
        activeSprintId={selectedSprint}
        data={data.burndown}
        showTable={false}
      />

      <section className="dashboard-card p-4">
        <p className="text-text-muted mb-3 text-[10px] tracking-[0.1em] uppercase">
          Sprint Detail
        </p>
        <DataTable>
          <DataTableHeader>
            <tr>
              <DataTableHeaderCell>Sprint</DataTableHeaderCell>
              <DataTableHeaderCell numeric>Resolved Bugs</DataTableHeaderCell>
              <DataTableHeaderCell numeric>Total Bugs</DataTableHeaderCell>
              <DataTableHeaderCell numeric>Ideal</DataTableHeaderCell>
            </tr>
          </DataTableHeader>
          <DataTableBody>
            {data.burndown.map((row) => (
              <DataTableRow
                active={row.sprintId === current.sprintId}
                key={row.sprintId}
              >
                <DataTableCell>{row.sprint}</DataTableCell>
                <DataTableCell numeric>{row.resolved}</DataTableCell>
                <DataTableCell numeric>{row.total}</DataTableCell>
                <DataTableCell numeric>{row.ideal.toFixed(1)}</DataTableCell>
              </DataTableRow>
            ))}
          </DataTableBody>
        </DataTable>
      </section>
    </div>
  )
}
