import type { ReactNode } from 'react'

import {
  TimelineGrid,
  TimelineRowMenu,
  TimelineSyncStatusPill,
  TimelineStatusPill,
} from '@/features/timeline-workspace/components/timeline-shared'
import type { TimelinePackageBar } from '@/features/timeline-workspace/types/timeline-workspace.types'
import {
  cnSelected,
  formatDateLabel,
  getBarColor,
  getBarTrackColor,
} from '@/features/timeline-workspace/utils/timeline-workspace.utils'
import { cn } from '@/lib/utils'

type TimelineMenuItem = {
  label: string
  icon: ReactNode
  onSelect: () => void
}

export function TimelineItemRow({
  actionMenuId,
  columns,
  item,
  itemCountLabel = 'keys',
  labelColumnWidth,
  menuId,
  menuItems,
  onCloseMenu,
  onOpenMenu,
  onSelect,
  progressLabel,
  selected,
}: {
  actionMenuId: string | null
  columns: number
  item: TimelinePackageBar
  itemCountLabel?: string
  labelColumnWidth: string
  menuId: string
  menuItems: TimelineMenuItem[]
  onCloseMenu: () => void
  onOpenMenu: (id: string | null) => void
  onSelect: () => void
  progressLabel: string
  selected: boolean
}) {
  return (
    <div
      className={cn(
        'ops-gantt-row grid border-b border-[color:var(--border)]/70',
        actionMenuId === menuId && 'z-30',
        item.isSyncing && 'opacity-72',
      )}
      style={{ gridTemplateColumns: `${labelColumnWidth} minmax(0, 1fr)` }}
    >
      <div
        className={cn(
          'group/row ops-bug-sidebar-cell ops-gantt-package px-4 py-2 transition-colors',
          selected && 'ops-bug-selected',
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <button
            type="button"
            disabled={item.isSyncing}
            onClick={onSelect}
            className={cn(
              'ops-package-rail min-w-0 flex-1 text-left disabled:cursor-not-allowed',
              item.isSyncing && 'opacity-85',
            )}
          >
            <span className="ops-package-rail-line" aria-hidden="true" />
            <div className="ops-package-rail-content">
              <p className="truncate text-[13px] font-medium tracking-[-0.015em] text-[color:var(--foreground)]">
                {item.name}
              </p>
              <div className="mt-1 flex flex-wrap gap-x-2.5 gap-y-1 text-[10px] text-[color:var(--muted-foreground)]">
                <div className="ops-bug-inline-meta min-w-0">
                  <span>
                    {formatDateLabel(item.startDate)} -{' '}
                    {formatDateLabel(item.endDate)}
                  </span>
                </div>
                <div className="ops-bug-inline-meta min-w-0">
                  <span>
                    {item.keys.length} {itemCountLabel}
                  </span>
                </div>
                <div className="ops-bug-inline-meta min-w-0">
                  <span>{item.members.length} members</span>
                  <span>
                    {item.resolvedBug}/{item.totalBug} {progressLabel}
                  </span>
                </div>
              </div>
            </div>
          </button>
          <div className="flex shrink-0 items-start gap-1">
            {item.isSyncing ? (
              <TimelineSyncStatusPill compact />
            ) : (
              <TimelineStatusPill compact health={item.health} />
            )}
            <TimelineRowMenu
              disabled={item.isSyncing}
              isOpen={actionMenuId === menuId}
              items={menuItems}
              onClose={onCloseMenu}
              onOpen={() => onOpenMenu(menuId)}
            />
          </div>
        </div>
      </div>

      <div className="ops-gantt-package-band ops-gantt-grid-frame relative overflow-hidden py-3">
        <TimelineGrid columns={columns} />
        <button
          type="button"
          disabled={item.isSyncing}
          onClick={onSelect}
          className={cnSelected(
            cn(
              'ops-timeline-bar absolute top-1/2 flex h-8 min-w-[4.5rem] -translate-y-1/2 items-center rounded-md border px-2.5 text-left text-white transition-[box-shadow,filter] hover:brightness-[0.99] disabled:cursor-not-allowed disabled:hover:brightness-100',
              item.isSyncing && 'saturate-[0.75]',
            ),
            selected,
          )}
          style={{
            left: `${item.leftPercent}%`,
            width: `${item.widthPercent}%`,
            background: getBarTrackColor(item.health),
          }}
        >
          <span
            className="pointer-events-none absolute inset-y-0 left-0 rounded-[inherit]"
            style={{
              width: `${Math.max(item.progress * 100, 8)}%`,
              background: getBarColor(item.health),
            }}
          />
          <div className="relative z-10 flex w-full items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="truncate text-[12px] leading-none font-semibold">
                {item.name}
              </div>
              <div className="mt-1 truncate text-[10px] font-semibold text-white/82">
                {item.isSyncing
                  ? 'Syncing with Jira'
                  : `${item.resolvedBug}/${item.totalBug} ${progressLabel} · ${Math.round(item.progress * 100)}%`}
              </div>
            </div>
          </div>
        </button>
      </div>
    </div>
  )
}
