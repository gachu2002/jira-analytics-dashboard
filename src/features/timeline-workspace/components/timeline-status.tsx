import { Badge } from '@/components/ui/badge'
import type {
  TimelineHealth,
  TimelineIssue,
} from '@/features/timeline-workspace/types/timeline-workspace.types'
import {
  getIssueStatusTone,
  getMemberLoadTone,
  isIssueDoneStatus,
  resolveIssuePartner,
} from '@/features/timeline-workspace/utils/timeline-workspace.utils'
import { cn } from '@/lib/utils'
import { useMemo } from 'react'

export function TimelineStatusSummary({
  openCount,
  openLabel = 'Open',
  resolvedCount,
  resolvedLabel = 'Resolved',
}: {
  openCount: number
  openLabel?: string
  resolvedCount: number
  resolvedLabel?: string
}) {
  const total = openCount + resolvedCount
  const resolvedWidth = total > 0 ? `${(resolvedCount / total) * 100}%` : '0%'

  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between gap-4 text-sm">
        <div className="flex items-baseline gap-2">
          <span className="text-[11px] font-semibold tracking-[0.08em] text-[color:var(--status-success)] uppercase">
            {resolvedLabel}
          </span>
          <span className="text-base font-semibold tracking-[-0.02em] text-[var(--foreground)]">
            {resolvedCount}
          </span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-[11px] font-semibold tracking-[0.08em] text-[color:var(--status-warning)] uppercase">
            {openLabel}
          </span>
          <span className="text-base font-semibold tracking-[-0.02em] text-[var(--foreground)]">
            {openCount}
          </span>
        </div>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[color:var(--status-warning)]/14">
        <div
          className="h-full rounded-full bg-[color:var(--status-success)]"
          style={{ width: resolvedWidth }}
        />
      </div>
    </div>
  )
}

export function TimelineMemberStatusSummary({
  issues,
  members,
  mode = 'assignee',
}: {
  issues: TimelineIssue[]
  members?: string[]
  mode?: 'assignee' | 'partner'
}) {
  const groupsWithCounts = useMemo(() => {
    const openIssues = issues.filter(
      (issue) => !isIssueDoneStatus(issue.status),
    )
    const issueCounts = new Map<string, { label: string; openCount: number }>()
    const uniqueMembers = [...new Set((members ?? []).filter(Boolean))]

    if (mode === 'partner') {
      for (const member of uniqueMembers) {
        issueCounts.set(member.toLowerCase(), { label: member, openCount: 0 })
      }

      for (const issue of openIssues) {
        const partner = resolveIssuePartner(issue.assignee, uniqueMembers)
        const label = partner ?? (issue.assignee ? 'Unmapped' : 'Unassigned')
        const key = label.toLowerCase()
        const current = issueCounts.get(key)

        issueCounts.set(key, {
          label: current?.label ?? label,
          openCount: (current?.openCount ?? 0) + 1,
        })
      }

      return [...issueCounts.values()].sort(
        (left, right) =>
          right.openCount - left.openCount ||
          left.label.localeCompare(right.label),
      )
    }

    for (const issue of openIssues) {
      const assignee = issue.assignee || 'Unassigned'
      const key = assignee.toLowerCase()
      const current = issueCounts.get(key)

      issueCounts.set(key, {
        label: current?.label ?? assignee,
        openCount: (current?.openCount ?? 0) + 1,
      })
    }

    return [...issueCounts.values()].sort(
      (left, right) =>
        right.openCount - left.openCount ||
        left.label.localeCompare(right.label),
    )
  }, [issues, members, mode])

  return (
    <div className="flex flex-wrap items-center gap-2">
      {groupsWithCounts.length ? (
        groupsWithCounts.map((group) => (
          <div
            key={group.label}
            className={cn(
              'inline-flex min-h-9 items-center gap-2.5 rounded-full border px-3 py-1.5 text-sm',
              getMemberLoadTone(group.openCount).chip,
            )}
          >
            <span className="truncate leading-none font-medium">
              {group.label}
            </span>
            <span
              className={cn(
                'inline-flex items-center text-xs leading-none font-semibold tabular-nums',
                getMemberLoadTone(group.openCount).count,
              )}
            >
              {group.openCount}
            </span>
          </div>
        ))
      ) : (
        <div className="py-1 text-sm text-[var(--muted-foreground)]">
          No members.
        </div>
      )}
    </div>
  )
}

export function TimelineIssueStatusBadge({ status }: { status: string }) {
  const tone = getIssueStatusTone(status)

  return (
    <Badge
      variant="outline"
      className="ops-bug-status-badge gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold"
      style={{
        borderColor: `color-mix(in srgb, ${tone} 28%, var(--border))`,
        background: `color-mix(in srgb, ${tone} 12%, transparent)`,
        color: tone,
      }}
    >
      <span className="size-1.5 rounded-full" style={{ background: tone }} />
      {status}
    </Badge>
  )
}

export function TimelineStatusPill({
  compact = false,
  health,
}: {
  compact?: boolean
  health: TimelineHealth
}) {
  const label =
    health === 'healthy' ? 'Healthy' : health === 'watch' ? 'Watch' : 'Risk'
  const color =
    health === 'healthy'
      ? 'var(--status-success)'
      : health === 'watch'
        ? 'var(--status-warning)'
        : 'var(--status-danger)'

  return (
    <span
      className={`inline-flex items-center rounded-md font-semibold ${compact ? 'px-2 py-1 text-[10px]' : 'px-2.5 py-1.5 text-[11px]'}`}
      style={{
        background: `color-mix(in srgb, ${color} 14%, transparent)`,
        color,
      }}
    >
      {label}
    </span>
  )
}

export function TimelineSyncStatusPill({
  compact = false,
  label = 'Syncing',
}: {
  compact?: boolean
  label?: string
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md font-semibold ${compact ? 'px-2 py-1 text-[10px]' : 'px-2.5 py-1.5 text-[11px]'}`}
      style={{
        background: 'color-mix(in srgb, var(--status-info) 10%, transparent)',
        color: 'var(--status-info)',
      }}
    >
      <span
        className="size-1.5 rounded-full"
        style={{ background: 'var(--status-info)' }}
      />
      {label}
    </span>
  )
}
