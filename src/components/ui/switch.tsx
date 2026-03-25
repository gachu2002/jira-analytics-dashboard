'use client'

import * as React from 'react'
import { Switch as SwitchPrimitive } from 'radix-ui'

import { cn } from '@/lib/utils'

function Switch({
  className,
  size = 'default',
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root> & {
  size?: 'sm' | 'default'
}) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      className={cn(
        'peer group/switch border-border focus-visible:border-ring focus-visible:ring-ring/50 data-[state=checked]:border-primary/40 data-[state=checked]:bg-primary data-[state=unchecked]:bg-secondary inline-flex shrink-0 items-center rounded-full border shadow-[var(--shadow-inset)] transition-all outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-[1.25rem] data-[size=default]:w-9 data-[size=sm]:h-3.5 data-[size=sm]:w-6',
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          'border-border/60 bg-background data-[state=checked]:bg-primary-foreground pointer-events-none block rounded-full border shadow-[0_1px_3px_rgba(9,30,66,0.18)] ring-0 transition-transform group-data-[size=default]/switch:size-[1rem] group-data-[size=sm]/switch:size-3 data-[state=checked]:translate-x-[calc(100%-3px)] data-[state=unchecked]:translate-x-[1px]',
        )}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
