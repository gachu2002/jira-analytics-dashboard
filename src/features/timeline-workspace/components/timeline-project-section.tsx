import { ChevronDown } from 'lucide-react'
import type { ReactNode } from 'react'

import {
  TimelineGrid,
  TimelineRowMenu,
  TimelineStatusPill,
} from '@/features/timeline-workspace/components/timeline-shared'
import type { TimelineProjectGroup } from '@/features/timeline-workspace/types/timeline-workspace.types'
import {
  getHealthFromProgress,
  getProjectBandColor,
  getProjectWindow,
} from '@/features/timeline-workspace/utils/timeline-workspace.utils'
import { cn } from '@/lib/utils'

type TimelineMenuItem = {
  label: string
  icon: ReactNode
  onSelect: () => void
}

export function TimelineProjectSection({
  actionMenuId,
  children,
  columns,
  isCollapsed,
  itemCountLabel,
  labelColumnWidth,
  menuItems,
  onCloseMenu,
  onOpenMenu,
  onToggle,
  progressLabel,
  project,
}: {
  actionMenuId: string | null
  children?: ReactNode
  columns: number
  isCollapsed: boolean
  itemCountLabel: string
  labelColumnWidth: string
  menuItems: TimelineMenuItem[]
  onCloseMenu: () => void
  onOpenMenu: (id: string | null) => void
  onToggle: () => void
  progressLabel: string
  project: TimelineProjectGroup
}) {
  const projectHealth = getHealthFromProgress(
    project.resolvedBug,
    project.totalBug,
  )
  const projectWindow = getProjectWindow(project.packages)
  const menuId = `project-${project.id}`

  return (
    <section className="ops-project-section bg-[var(--workspace-pane)]">
      <div
        className={cn(
          'ops-project-header-row sticky z-20 grid border-b border-[color:var(--border)]',
          actionMenuId === menuId && 'z-30',
        )}
        style={{ gridTemplateColumns: `${labelColumnWidth} minmax(0, 1fr)` }}
      >
        <div className="group/row ops-bug-sidebar-cell ops-gantt-project px-4 py-3">
          <div className="flex items-start justify-between gap-3">
            <button
              type="button"
              className="min-w-0 flex-1 text-left"
              onClick={onToggle}
            >
              <div className="flex items-center gap-2">
                <ChevronDown
                  className={cn(
                    'text-muted-foreground size-4 shrink-0 transition-transform',
                    isCollapsed && '-rotate-90',
                  )}
                />
                <p className="truncate text-[15px] font-semibold tracking-[-0.02em] text-[color:var(--foreground)]">
                  {project.name}
                </p>
              </div>
              <div className="mt-1.5 flex flex-wrap items-center gap-2 pl-6">
                <div className="ops-bug-inline-meta text-[11px]">
                  <span>
                    {project.packageCount} {itemCountLabel}
                  </span>
                  <span>
                    {project.resolvedBug}/{project.totalBug} {progressLabel}
                  </span>
                </div>
                <TimelineStatusPill compact health={projectHealth} />
              </div>
            </button>

            <div className="flex shrink-0 items-start gap-1">
              <TimelineRowMenu
                isOpen={actionMenuId === menuId}
                items={menuItems}
                onClose={onCloseMenu}
                onOpen={() => onOpenMenu(menuId)}
              />
            </div>
          </div>
        </div>

        <div className="ops-gantt-project-band ops-gantt-grid-frame relative overflow-hidden py-3">
          <TimelineGrid columns={columns} />
          {projectWindow ? (
            <div
              className="ops-project-summary-bar absolute top-1/2 h-3 -translate-y-1/2 rounded-full"
              style={{
                left: `${projectWindow.leftPercent}%`,
                width: `${projectWindow.widthPercent}%`,
                background: getProjectBandColor(projectHealth),
              }}
            />
          ) : null}
        </div>
      </div>

      {!isCollapsed ? (
        <div className="ops-project-packages bg-[var(--workspace-pane)]">
          {children}
        </div>
      ) : null}
    </section>
  )
}
