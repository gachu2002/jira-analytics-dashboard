import { DashboardStateNotice } from '@/features/dashboard/components/DashboardStateNotice'
import {
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableHeader,
  DataTableHeaderCell,
  DataTableRow,
} from '@/components/common/DataTable/DataTable'
import { useBugStatisticsQuery } from '@/features/dashboard/api/bug-statistics.api'
import {
  BugAnalysisPieCard,
  getBugAnalysisColor,
} from '@/features/dashboard/components/BugAnalysisPieCard'

export const BugAnalysisPage = () => {
  const { data, isJqlDraftMode } = useBugStatisticsQuery()

  if (isJqlDraftMode) {
    return (
      <DashboardStateNotice
        message="Run the current JQL to populate the bug analysis chart and table."
        title="JQL draft only"
      />
    )
  }

  if (!data) {
    return null
  }

  if (data.length === 0) {
    return (
      <div className="dashboard-card text-text-muted p-4 text-sm">
        No bug analysis data is available for this selection.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <header>
        <h1 className="metric-value text-text-primary text-base">
          Bug Analysis
        </h1>
        <p className="text-text-muted mt-1 text-xs">
          Category breakdown of returned bugs for the active record or realtime
          query
        </p>
      </header>

      <BugAnalysisPieCard data={data} />

      <section className="dashboard-card p-4">
        <p className="text-text-muted mb-3 text-[10px] tracking-[0.1em] uppercase">
          Category Detail
        </p>
        <DataTable>
          <DataTableHeader>
            <tr>
              <DataTableHeaderCell>Category</DataTableHeaderCell>
              <DataTableHeaderCell numeric>Number</DataTableHeaderCell>
              <DataTableHeaderCell numeric>Share</DataTableHeaderCell>
            </tr>
          </DataTableHeader>
          <DataTableBody>
            {data.map((row, index) => (
              <DataTableRow key={row.category}>
                <DataTableCell>
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: getBugAnalysisColor(index) }}
                    />
                    <span className="break-all">{row.category}</span>
                  </div>
                </DataTableCell>
                <DataTableCell numeric>
                  {row.count.toLocaleString()}
                </DataTableCell>
                <DataTableCell numeric>{row.share.toFixed(1)}%</DataTableCell>
              </DataTableRow>
            ))}
          </DataTableBody>
        </DataTable>
      </section>
    </div>
  )
}
