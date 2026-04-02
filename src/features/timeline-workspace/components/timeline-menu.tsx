import { Ellipsis } from 'lucide-react'
import { createPortal } from 'react-dom'
import { useEffect, useRef, useState, type ReactNode } from 'react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

function TimelineRowActionButton({
  children,
  className,
  disabled = false,
  label,
  onClick,
}: {
  children: ReactNode
  className?: string
  disabled?: boolean
  label: string
  onClick: () => void
}) {
  return (
    <Button
      disabled={disabled}
      size="icon-xs"
      variant="ghost"
      className={cn(
        'text-muted-foreground hover:text-foreground disabled:pointer-events-none disabled:opacity-40',
        className,
      )}
      title={label}
      onClick={(event) => {
        event.stopPropagation()
        if (disabled) return
        onClick()
      }}
    >
      {children}
    </Button>
  )
}

export function TimelineRowMenu({
  disabled = false,
  isOpen,
  items,
  onClose,
  onOpen,
}: {
  disabled?: boolean
  isOpen: boolean
  items: Array<{ label: string; icon: ReactNode; onSelect: () => void }>
  onClose: () => void
  onOpen: () => void
}) {
  const triggerRef = useRef<HTMLDivElement | null>(null)
  const menuRef = useRef<HTMLDivElement | null>(null)
  const [menuStyle, setMenuStyle] = useState<{
    top: number
    left: number
  } | null>(null)

  useEffect(() => {
    if (!isOpen) return

    const updatePosition = () => {
      const rect = triggerRef.current?.getBoundingClientRect()
      if (!rect) return

      setMenuStyle({
        top: rect.bottom + 6,
        left: rect.right - 144,
      })
    }

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node | null
      if (triggerRef.current?.contains(target)) return
      if (menuRef.current?.contains(target)) return
      onClose()
    }

    updatePosition()
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)
    document.addEventListener('mousedown', handlePointerDown)

    return () => {
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
      document.removeEventListener('mousedown', handlePointerDown)
    }
  }, [isOpen, onClose])

  return (
    <div ref={triggerRef}>
      <TimelineRowActionButton
        className={cn(
          'opacity-0 transition-opacity group-focus-within/row:opacity-100 group-hover/row:opacity-100',
          isOpen && 'opacity-100',
        )}
        disabled={disabled}
        label="More actions"
        onClick={() => {
          if (disabled) return

          if (isOpen) {
            onClose()
            return
          }

          onOpen()
        }}
      >
        <Ellipsis className="size-3.5" />
      </TimelineRowActionButton>
      {isOpen && menuStyle
        ? createPortal(
            <div
              ref={menuRef}
              className="ops-row-menu fixed z-[120] min-w-[9rem] rounded-md p-1"
              style={{ top: menuStyle.top, left: menuStyle.left }}
            >
              {items.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  className="ops-row-menu-item flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm"
                  onClick={() => {
                    onClose()
                    item.onSelect()
                  }}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
            </div>,
            document.body,
          )
        : null}
    </div>
  )
}
