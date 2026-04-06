import { Search } from 'lucide-react'
import { useMemo, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { TimelineIssueStatusBadge } from '@/features/timeline-workspace/components/timeline-status'
import type { TimelineIssue } from '@/features/timeline-workspace/types/timeline-workspace.types'
import { resolveIssuePartner } from '@/features/timeline-workspace/utils/timeline-workspace.utils'

export function TimelineIssuesTable({
  issues,
  members = [],
}: {
  issues: TimelineIssue[]
  members?: string[]
}) {
  const [query, setQuery] = useState('')
  const tableRows = useMemo(
    () =>
      issues.map((issue) => ({
        issue,
        partner:
          issue.partner?.trim() ||
          resolveIssuePartner(issue.assignee, members) ||
          '-',
      })),
    [issues, members],
  )
  const filteredIssues = useMemo(() => {
    const searchValue = query.trim().toLowerCase()
    if (!searchValue) return tableRows

    return tableRows.filter(({ issue, partner }) =>
      `${issue.key} ${issue.summary} ${issue.assignee} ${partner} ${issue.status}`
        .toLowerCase()
        .includes(searchValue),
    )
  }, [query, tableRows])

  if (!issues.length) {
    return (
      <div className="ops-bug-table-shell rounded-md px-4 py-10 text-sm text-[var(--muted-foreground)]">
        No issues.
      </div>
    )
  }

  return (
    <section className="grid gap-3">
      <div className="px-1">
        <div className="relative w-full max-w-sm">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            className="ops-workspace-input h-9 rounded-md pl-9"
            placeholder="Key, summary, assignee, partner, status"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
      </div>
      <div className="ops-bug-table-shell overflow-hidden rounded-lg">
        <div className="max-h-[25rem] overflow-auto">
          <table className="w-full border-collapse text-sm">
            <thead className="ops-bug-table-head sticky top-0 z-[1]">
              <tr>
                <th className="w-[14%] px-3 py-2 text-left font-medium">Key</th>
                <th className="w-[38%] px-3 py-2 text-left font-medium">
                  Summary
                </th>
                <th className="w-[18%] px-3 py-2 text-left font-medium">
                  Assignee
                </th>
                <th className="w-[18%] px-3 py-2 text-left font-medium">
                  Partner
                </th>
                <th className="w-[12%] px-3 py-2 text-left font-medium">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredIssues.map(({ issue, partner }) => (
                <tr key={issue.key} className="ops-bug-table-row align-top">
                  <td className="px-3 py-2.5">
                    <Badge
                      variant="outline"
                      className="ops-bug-key-badge rounded-md px-2 py-0.5 font-semibold"
                    >
                      {issue.key}
                    </Badge>
                  </td>
                  <td className="px-3 py-2.5">
                    <a
                      className="ops-bug-summary line-clamp-2 min-w-0 text-[var(--foreground)] hover:text-[var(--primary)] hover:underline"
                      href={issue.url}
                      rel="noreferrer"
                      target="_blank"
                    >
                      {issue.summary}
                    </a>
                  </td>
                  <td className="px-3 py-2.5 text-[var(--muted-foreground)]">
                    <span className="truncate text-sm text-[var(--foreground)]">
                      {issue.assignee || 'Unassigned'}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-[var(--muted-foreground)]">
                    <span className="truncate text-sm text-[var(--foreground)]">
                      {partner}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <TimelineIssueStatusBadge status={issue.status} />
                  </td>
                </tr>
              ))}
              {!filteredIssues.length ? (
                <tr className="ops-bug-table-row">
                  <td
                    colSpan={5}
                    className="px-3 py-8 text-center text-sm text-[var(--muted-foreground)]"
                  >
                    No results.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
