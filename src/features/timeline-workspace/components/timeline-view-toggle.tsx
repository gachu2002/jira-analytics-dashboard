import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { TimelineZoomLevel } from '@/features/timeline-workspace/types/timeline-workspace.types'

export function TimelineViewToggle({
  value,
  onChange,
}: {
  value: TimelineZoomLevel
  onChange: (value: TimelineZoomLevel) => void
}) {
  const shellStyle = {
    background: 'color-mix(in srgb, var(--workspace-pane) 99%, white 1%)',
    borderColor: 'color-mix(in srgb, var(--border) 90%, transparent)',
  }

  return (
    <div className="ops-view-toggle-shell">
      <span className="ops-bug-toolbar-label">View</span>
      <Tabs
        className="gap-0"
        value={value}
        onValueChange={(next) => onChange(next as TimelineZoomLevel)}
      >
        <TabsList
          className="ops-view-toggle-list h-10 rounded-lg border p-1 shadow-none"
          style={shellStyle}
        >
          <TabsTrigger
            className="ops-view-toggle-trigger px-3.5 text-xs shadow-none data-[state=active]:shadow-none"
            value="week"
          >
            Week
          </TabsTrigger>
          <TabsTrigger
            className="ops-view-toggle-trigger px-3.5 text-xs shadow-none data-[state=active]:shadow-none"
            value="month"
          >
            Month
          </TabsTrigger>
          <TabsTrigger
            className="ops-view-toggle-trigger px-3.5 text-xs shadow-none data-[state=active]:shadow-none"
            value="quarter"
          >
            Quarter
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  )
}
