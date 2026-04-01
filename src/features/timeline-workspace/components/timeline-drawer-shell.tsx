import { PanelRightClose } from 'lucide-react'
import type { ReactNode } from 'react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function TimelineDrawerShell({
  actions,
  children,
  isOpen,
  isWide,
  onClose,
  title,
  eyebrow,
}: {
  actions?: ReactNode
  children: ReactNode
  isOpen: boolean
  isWide: boolean
  onClose: () => void
  title: string
  eyebrow: string
}) {
  if (!isOpen) return null

  return (
    <div className="ops-side-drawer-backdrop fixed inset-0 z-40 flex justify-end">
      <div
        className={cn(
          'ops-side-drawer-panel flex h-full w-full flex-col',
          isWide ? 'max-w-[min(72rem,calc(100vw-2rem))]' : 'max-w-[28rem]',
        )}
      >
        <div className="flex items-start justify-between border-b border-[color:var(--border)] px-4 py-4">
          <div>
            <p className="ops-inspector-label">{eyebrow}</p>
            <p className="mt-1 text-base font-semibold tracking-[-0.02em]">
              {title}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {actions}
            <Button
              className="size-8 rounded-md px-0"
              size="sm"
              variant="ghost"
              onClick={onClose}
            >
              <PanelRightClose className="size-4" />
            </Button>
          </div>
        </div>
        <div className="flex-1 overflow-auto">{children}</div>
      </div>
    </div>
  )
}
