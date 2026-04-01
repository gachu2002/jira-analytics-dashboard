import type { ReactNode } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function TimelineField({
  children,
  error,
  label,
}: {
  children: ReactNode
  error?: string
  label: string
}) {
  return (
    <label className="grid gap-1.5">
      <span className="ops-bug-toolbar-label">{label}</span>
      {children}
      {error ? (
        <span className="text-[11px] text-[var(--status-danger)]">{error}</span>
      ) : null}
    </label>
  )
}

export function TimelineFormActions({
  isPending,
  submitLabel,
  onCancel,
}: {
  isPending: boolean
  submitLabel: string
  onCancel: () => void
}) {
  return (
    <div className="flex gap-2 pt-2">
      <Button size="sm" type="submit" disabled={isPending}>
        {submitLabel}
      </Button>
      <Button size="sm" type="button" variant="outline" onClick={onCancel}>
        Cancel
      </Button>
    </div>
  )
}

export function TimelineDateField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <label className="ops-bug-date-field">
      <span className="ops-bug-toolbar-label">{label}</span>
      <Input
        className="ops-workspace-input ops-bug-filter-input h-10 min-w-[9.5rem] rounded-md"
        type="date"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  )
}
