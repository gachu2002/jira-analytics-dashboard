import { Button } from '@/components/ui/button'
import type { TimelineDeleteTarget } from '@/features/timeline-workspace/types/timeline-workspace.types'

export function TimelineDeleteDialog<TTarget extends TimelineDeleteTarget>({
  isOpen,
  isPending,
  target,
  onCancel,
  onConfirm,
}: {
  isOpen: boolean
  isPending: boolean
  target: TTarget | null
  onCancel: () => void
  onConfirm: () => Promise<void>
}) {
  if (!isOpen || !target) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/28 px-4 backdrop-blur-[2px]"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm rounded-lg border border-[color:var(--border)] bg-[var(--workspace-pane)] p-4 shadow-[0_20px_56px_rgba(9,30,66,0.18)]"
        onClick={(event) => event.stopPropagation()}
      >
        <p className="text-sm font-semibold text-[var(--foreground)]">
          Delete {target.type}
        </p>
        <p className="mt-1.5 text-sm text-[color:var(--foreground)]">
          {target.name}
        </p>
        <p className="mt-1 text-xs text-[color:var(--muted-foreground)]">
          This change cannot be undone.
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <Button size="sm" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            size="sm"
            variant="destructive"
            disabled={isPending}
            onClick={() => void onConfirm()}
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  )
}
