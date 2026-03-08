import * as React from 'react'
import { Check, ChevronDown, ChevronUp } from 'lucide-react'
import { Select } from 'radix-ui'

import { cn } from '@/lib/utils'

function SelectRoot(props: React.ComponentProps<typeof Select.Root>) {
  return <Select.Root data-slot="select" {...props} />
}

function SelectGroup(props: React.ComponentProps<typeof Select.Group>) {
  return <Select.Group data-slot="select-group" {...props} />
}

function SelectValue(props: React.ComponentProps<typeof Select.Value>) {
  return <Select.Value data-slot="select-value" {...props} />
}

function SelectTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof Select.Trigger>) {
  return (
    <Select.Trigger
      className={cn(
        'border-border bg-background text-text-primary data-[placeholder]:text-text-muted hover:border-primary/50 focus-visible:border-ring focus-visible:ring-ring/40 inline-flex h-10 w-full items-center justify-between gap-2 rounded-[4px] border px-3 text-sm transition-colors outline-none focus-visible:ring-[2px] disabled:cursor-not-allowed disabled:opacity-50 [&>span]:truncate',
        className,
      )}
      data-slot="select-trigger"
      {...props}
    >
      {children}
      <Select.Icon asChild>
        <ChevronDown className="text-text-muted size-4 shrink-0" />
      </Select.Icon>
    </Select.Trigger>
  )
}

function SelectContent({
  className,
  children,
  position = 'popper',
  ...props
}: React.ComponentProps<typeof Select.Content>) {
  return (
    <Select.Portal>
      <Select.Content
        className={cn(
          'bg-popover text-popover-foreground border-border relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-[6px] border shadow-2xl',
          position === 'popper' &&
            'data-[side=bottom]:translate-y-1 data-[side=top]:-translate-y-1',
          className,
        )}
        data-slot="select-content"
        position={position}
        {...props}
      >
        <Select.ScrollUpButton className="text-text-muted flex h-6 cursor-default items-center justify-center">
          <ChevronUp className="size-4" />
        </Select.ScrollUpButton>
        <Select.Viewport
          className={cn(
            'p-1',
            position === 'popper' &&
              'h-[var(--radix-select-trigger-height)] min-w-[var(--radix-select-trigger-width)]',
          )}
        >
          {children}
        </Select.Viewport>
        <Select.ScrollDownButton className="text-text-muted flex h-6 cursor-default items-center justify-center">
          <ChevronDown className="size-4" />
        </Select.ScrollDownButton>
      </Select.Content>
    </Select.Portal>
  )
}

function SelectLabel({
  className,
  ...props
}: React.ComponentProps<typeof Select.Label>) {
  return (
    <Select.Label
      className={cn('text-text-muted px-2 py-1.5 text-xs', className)}
      data-slot="select-label"
      {...props}
    />
  )
}

function SelectItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof Select.Item>) {
  return (
    <Select.Item
      className={cn(
        'data-[highlighted]:bg-primary/18 data-[highlighted]:text-text-primary text-text-secondary hover:bg-primary/18 hover:text-text-primary relative flex w-full cursor-default items-center rounded-[4px] py-2 pr-8 pl-8 text-sm transition-colors outline-none select-none',
        className,
      )}
      data-slot="select-item"
      {...props}
    >
      <span className="absolute left-2 flex size-4 items-center justify-center">
        <Select.ItemIndicator>
          <Check className="size-4" />
        </Select.ItemIndicator>
      </span>
      <Select.ItemText>{children}</Select.ItemText>
    </Select.Item>
  )
}

function SelectSeparator({
  className,
  ...props
}: React.ComponentProps<typeof Select.Separator>) {
  return (
    <Select.Separator
      className={cn('bg-border pointer-events-none -mx-1 my-1 h-px', className)}
      data-slot="select-separator"
      {...props}
    />
  )
}

export {
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectRoot,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}
