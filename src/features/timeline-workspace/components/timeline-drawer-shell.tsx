import { PanelRightClose } from 'lucide-react'
import { useRef, type ReactNode } from 'react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function TimelineDrawerShell({
  actions,
  children,
  headerContent,
  isOpen,
  isWide,
  onClose,
  title,
  titleAccessory,
  eyebrow,
}: {
  actions?: ReactNode
  children: ReactNode
  headerContent?: ReactNode
  isOpen: boolean
  isWide: boolean
  onClose: () => void
  title: string
  titleAccessory?: ReactNode
  eyebrow: string
}) {
  const backdropPressStartedRef = useRef(false)

  if (!isOpen) return null

  return (
    <div
      className="ops-side-drawer-backdrop fixed inset-0 z-40 flex justify-end"
      onPointerCancel={() => {
        backdropPressStartedRef.current = false
      }}
      onPointerDown={(event) => {
        backdropPressStartedRef.current = event.target === event.currentTarget
      }}
      onPointerLeave={() => {
        backdropPressStartedRef.current = false
      }}
      onPointerUp={(event) => {
        const shouldClose =
          backdropPressStartedRef.current &&
          event.target === event.currentTarget

        backdropPressStartedRef.current = false

        if (shouldClose) {
          onClose()
        }
      }}
    >
      <div
        className={cn(
          'ops-side-drawer-panel flex h-full w-full flex-col',
          isWide ? 'max-w-[min(72rem,calc(100vw-2rem))]' : 'max-w-[28rem]',
        )}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-[color:var(--border)] px-4 py-4">
          <div className="min-w-0 flex-1">
            <p className="ops-inspector-label">{eyebrow}</p>
            <div className="mt-1 flex flex-wrap items-center gap-3">
              <p className="min-w-0 text-base font-semibold tracking-[-0.02em]">
                {title}
              </p>
              {titleAccessory ? (
                <div className="min-w-0 flex-shrink-0">{titleAccessory}</div>
              ) : null}
            </div>
            {headerContent ? <div className="mt-3">{headerContent}</div> : null}
          </div>
          <div className="ml-3 flex shrink-0 items-center gap-2">
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
