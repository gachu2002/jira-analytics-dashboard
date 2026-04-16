import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export type WorkspaceSelectOption = {
  value: string
  label: string
}

export function WorkspaceSelect({
  disabled = false,
  options,
  placeholder,
  value,
  onValueChange,
}: {
  disabled?: boolean
  options: WorkspaceSelectOption[]
  placeholder: string
  value?: string
  onValueChange: (value: string) => void
}) {
  return (
    <Select disabled={disabled} value={value} onValueChange={onValueChange}>
      <SelectTrigger className="h-10 w-full rounded-md border-[color:color-mix(in_srgb,var(--border)_94%,transparent)] bg-[var(--workspace-pane)] px-3 text-left text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] transition-[border-color,box-shadow,background-color] hover:border-[color:color-mix(in_srgb,var(--border)_84%,transparent)] focus-visible:border-[color:color-mix(in_srgb,var(--primary)_52%,var(--border))] focus-visible:ring-[3px] focus-visible:ring-[color:color-mix(in_srgb,var(--primary)_18%,transparent)] data-[placeholder]:text-[var(--muted-foreground)]">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent
        align="start"
        className="rounded-lg border-[color:color-mix(in_srgb,var(--border)_92%,transparent)] bg-[var(--workspace-pane)] text-[var(--foreground)] shadow-[0_14px_32px_rgba(15,23,42,0.14)]"
        position="popper"
        sideOffset={2}
      >
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
