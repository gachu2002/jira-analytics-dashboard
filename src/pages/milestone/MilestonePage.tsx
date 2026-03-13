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
import { MilestoneProgressCard } from '@/features/dashboard/components/MilestoneProgressCard'
import { useDashboardQuery } from '@/features/dashboard/api/dashboard.api'
import { useDashboardFilters } from '@/features/dashboard/hooks/useDashboardFilters'
import {
  getActiveSprint,
  getPreviousSprint,
} from '@/features/dashboard/utils/sprint'

export const MilestonePage = () => {
  const { data, isJqlDraftMode } = useDashboardQuery()
  const { selectedSprint } = useDashboardFilters()

  if (isJqlDraftMode) {
    return (
      <DashboardStateNotice
        message="Run the current JQL to populate milestone cards, chart, and table."
        title="JQL draft only"
      />
    )
  }

  if (!data) {
    return null
  }

  if (data.burnup.length === 0) {
    return (
      <div className="dashboard-card text-text-muted p-4 text-sm">
        No milestone sprint data is available yet.
      </div>
    )
  }

  const current =
    getActiveSprint(data.burnup, selectedSprint) ??
    ({ sprintId: 0, sprint: 'S0', completed: 0, scope: 0 } as const)
  const previous = getPreviousSprint(data.burnup, selectedSprint)
  const sprintCount = data.burnup.length
  const scopeDelta = current.scope - (previous?.scope ?? current.scope)
  const completionPercent =
    current.scope > 0 ? (current.completed / current.scope) * 100 : 0

  return (
    <div className="space-y-4">
      <header>
        <h1 className="metric-value text-text-primary text-base">
          Milestone Progress
        </h1>
        <p className="text-text-muted mt-1 text-xs">
          Milestone burndown tracking - scope vs completion trajectory
        </p>
      </header>

      <section className="grid grid-cols-1 gap-3 min-[1024px]:grid-cols-2 min-[1440px]:grid-cols-4">
        <KpiCard
          label="Completed Work (Points)"
          value={current.completed.toString()}
          animatedValue={current.completed}
          subtext={`${current.sprint} completed points`}
          delta={{
            label: `${data.milestoneProgress.completionPercent.toFixed(1)}% complete`,
            tone: 'blue',
          }}
          progress={{
            value: current.completed,
            max: current.scope,
          }}
        />
        <KpiCard
          label="Milestone Scope (Points)"
          value={current.scope.toString()}
          animatedValue={current.scope}
          subtext="Current scope for selected milestone"
          delta={{
            label: `${scopeDelta >= 0 ? '↑' : '↓'}${Math.abs(scopeDelta)} vs previous sprint`,
            tone: 'amber',
          }}
        />
        <KpiCard
          label="Ideal (Points)"
          value={current.ideal.toFixed(1)}
          animatedValue={Math.round(current.ideal * 10)}
          formatter={(value) => (value / 10).toFixed(1)}
          subtext={`Scope / ${sprintCount} sprints x sprint ${current.sprintNumber}`}
          delta={{
            label: `${completionPercent.toFixed(1)}% completion`,
            tone: 'blue',
          }}
        />
        <KpiCard
          label="Sprint Number"
          value={current.sprintNumber.toString()}
          animatedValue={current.sprintNumber}
          subtext={`Selected sprint out of ${sprintCount}`}
        />
      </section>

      <MilestoneProgressCard
        activeSprintId={selectedSprint}
        data={data.burnup}
        fullWidth
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
              <DataTableHeaderCell numeric>Completed Work</DataTableHeaderCell>
              <DataTableHeaderCell numeric>Milestone Scope</DataTableHeaderCell>
              <DataTableHeaderCell numeric>Ideal</DataTableHeaderCell>
            </tr>
          </DataTableHeader>
          <DataTableBody>
            {data.burnup.map((row) => (
              <DataTableRow
                active={row.sprintId === current.sprintId}
                key={row.sprintId}
              >
                <DataTableCell>{row.sprint}</DataTableCell>
                <DataTableCell numeric>{row.completed}</DataTableCell>
                <DataTableCell numeric>{row.scope}</DataTableCell>
                <DataTableCell numeric>{row.ideal.toFixed(1)}</DataTableCell>
              </DataTableRow>
            ))}
          </DataTableBody>
        </DataTable>
      </section>
    </div>
  )
}
