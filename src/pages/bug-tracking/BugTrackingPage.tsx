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
  createSprintLookup,
  getActiveSprint,
} from '@/features/dashboard/utils/sprint'

export const BugTrackingPage = () => {
  const { data } = useDashboardQuery()
  const { selectedSprint } = useDashboardFilters()

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

  const currentBurndown = getActiveSprint(data.burndown, selectedSprint)
  const currentVelocity = getActiveSprint(data.velocity, selectedSprint)
  const openBugs = currentBurndown?.remaining ?? data.remainingBugs.count
  const resolvedThisSprint = currentVelocity?.resolvedBugs ?? 0
  const newThisSprint = currentVelocity?.newBugs ?? 0
  const velocityBySprintId = createSprintLookup(data.velocity)
  const sprintRows = data.burndown.map((burndownPoint) => {
    const velocityPoint = velocityBySprintId.get(burndownPoint.sprintId)

    return {
      sprint: burndownPoint.sprint,
      sprintId: burndownPoint.sprintId,
      remaining: burndownPoint.remaining,
      newBugs: velocityPoint?.newBugs ?? 0,
      resolvedBugs: velocityPoint?.resolvedBugs ?? 0,
      netChange:
        (velocityPoint?.newBugs ?? 0) - (velocityPoint?.resolvedBugs ?? 0),
    }
  })

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
        />
        <KpiCard
          label="Resolved This Sprint"
          value={resolvedThisSprint.toString()}
          animatedValue={resolvedThisSprint}
          subtext={`${currentVelocity?.sprint ?? data.meta.currentSprint} resolved defects`}
        />
        <KpiCard
          label="New Bugs This Sprint"
          value={newThisSprint.toString()}
          animatedValue={newThisSprint}
          subtext={`${currentVelocity?.sprint ?? data.meta.currentSprint} newly reported defects`}
        />
        <KpiCard
          label="Net Bug Change"
          value={`${newThisSprint - resolvedThisSprint >= 0 ? '+' : ''}${newThisSprint - resolvedThisSprint}`}
          animatedValue={Math.abs(newThisSprint - resolvedThisSprint)}
          formatter={() => {
            const signedValue = newThisSprint - resolvedThisSprint

            return `${signedValue >= 0 ? '+' : ''}${signedValue}`
          }}
          subtext="New bugs minus resolved bugs"
        />
      </section>

      <BugBurndownCard activeSprintId={selectedSprint} data={data.burndown} />

      <section className="dashboard-card p-4">
        <p className="text-text-muted mb-3 text-[10px] tracking-[0.1em] uppercase">
          Sprint Bug Summary
        </p>
        <DataTable>
          <DataTableHeader>
            <tr>
              <DataTableHeaderCell>Sprint</DataTableHeaderCell>
              <DataTableHeaderCell numeric>Remaining</DataTableHeaderCell>
              <DataTableHeaderCell numeric>New</DataTableHeaderCell>
              <DataTableHeaderCell numeric>Resolved</DataTableHeaderCell>
              <DataTableHeaderCell numeric>Net Change</DataTableHeaderCell>
            </tr>
          </DataTableHeader>
          <DataTableBody>
            {sprintRows.map((row) => (
              <DataTableRow
                active={row.sprintId === selectedSprint}
                key={row.sprintId}
              >
                <DataTableCell>{row.sprint}</DataTableCell>
                <DataTableCell numeric>{row.remaining}</DataTableCell>
                <DataTableCell numeric>{row.newBugs}</DataTableCell>
                <DataTableCell numeric>{row.resolvedBugs}</DataTableCell>
                <DataTableCell numeric>
                  <span
                    className={
                      row.netChange <= 0 ? 'text-success' : 'text-danger'
                    }
                  >
                    {row.netChange >= 0 ? '+' : ''}
                    {row.netChange}
                  </span>
                </DataTableCell>
              </DataTableRow>
            ))}
          </DataTableBody>
        </DataTable>
      </section>
    </div>
  )
}
