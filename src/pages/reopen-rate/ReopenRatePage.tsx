import { KpiCard } from '@/components/common/KpiCard'
import {
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableHeader,
  DataTableHeaderCell,
  DataTableRow,
} from '@/components/common/DataTable/DataTable'
import { ReopenRateCard } from '@/features/dashboard/components/ReopenRateCard'
import { useDashboardQuery } from '@/features/dashboard/api/dashboard.api'
import { useDashboardFilters } from '@/features/dashboard/hooks/useDashboardFilters'
import { getActiveSprint } from '@/features/dashboard/utils/sprint'

export const ReopenRatePage = () => {
  const { data } = useDashboardQuery()
  const { selectedSprint } = useDashboardFilters()

  if (!data) {
    return null
  }

  if (data.reopenRateSeries.length === 0) {
    return (
      <div className="dashboard-card text-text-muted p-4 text-sm">
        No reopen-rate data is available for this milestone.
      </div>
    )
  }

  const current = getActiveSprint(data.reopenRateSeries, selectedSprint)
  const currentTargetDelta = current.rate - current.target

  return (
    <div className="space-y-4">
      <header>
        <h1 className="metric-value text-text-primary text-base">
          Reopened Rate
        </h1>
        <p className="text-text-muted mt-1 text-xs">
          Bug reopen trend - quality signal with 3% target threshold
        </p>
      </header>

      <section className="grid grid-cols-1 gap-3 min-[1024px]:grid-cols-2 min-[1440px]:grid-cols-4">
        <KpiCard
          label="Target"
          value={`${(current.target * 100).toFixed(1)}%`}
          animatedValue={Math.round(current.target * 1000)}
          formatter={(value) => `${(value / 10).toFixed(1)}%`}
          subtext="Maximum acceptable reopened rate"
        />
        <KpiCard
          label="Reopened Rate"
          value={`${(current.rate * 100).toFixed(1)}%`}
          animatedValue={Math.round(current.rate * 1000)}
          formatter={(value) => `${(value / 10).toFixed(1)}%`}
          subtext={`${current.reopened} reopened / ${current.resolved} resolved`}
          delta={{
            label: `Target: ${(current.target * 100).toFixed(1)}%`,
            tone: current.rate <= current.target ? 'green' : 'red',
          }}
        />
        <KpiCard
          label="Resolved Bugs"
          value={current.resolved.toString()}
          animatedValue={current.resolved}
          subtext={`${current.sprint} resolved bugs used in reopen-rate calculations`}
        />
        <KpiCard
          label="Reopened Bugs"
          value={current.reopened.toString()}
          animatedValue={current.reopened}
          subtext={`${current.sprint} reopened bug count`}
          delta={{
            label: `${currentTargetDelta > 0 ? '+' : ''}${(currentTargetDelta * 100).toFixed(1)} pts vs target`,
            tone: currentTargetDelta <= 0 ? 'green' : 'red',
          }}
        />
      </section>

      <ReopenRateCard
        activeSprintId={selectedSprint}
        data={data.reopenRateSeries}
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
              <DataTableHeaderCell numeric>Target</DataTableHeaderCell>
              <DataTableHeaderCell numeric>Reopened Rate</DataTableHeaderCell>
              <DataTableHeaderCell numeric>Resolved Bugs</DataTableHeaderCell>
              <DataTableHeaderCell numeric>Reopened Bugs</DataTableHeaderCell>
            </tr>
          </DataTableHeader>
          <DataTableBody>
            {data.reopenRateSeries.map((row) => (
              <DataTableRow
                active={row.sprintId === current.sprintId}
                key={row.sprintId}
              >
                <DataTableCell>{row.sprint}</DataTableCell>
                <DataTableCell numeric>
                  {(row.target * 100).toFixed(1)}%
                </DataTableCell>
                <DataTableCell numeric>
                  {(row.rate * 100).toFixed(1)}%
                </DataTableCell>
                <DataTableCell numeric>{row.resolved}</DataTableCell>
                <DataTableCell numeric>{row.reopened}</DataTableCell>
              </DataTableRow>
            ))}
          </DataTableBody>
        </DataTable>
      </section>
    </div>
  )
}
