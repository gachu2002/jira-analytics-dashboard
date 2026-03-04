import type { PropsWithChildren } from 'react'

export const DataTable = ({ children }: PropsWithChildren) => {
  return (
    <div className="overflow-hidden rounded-[0px]">
      <table className="w-full border-collapse">{children}</table>
    </div>
  )
}

export const DataTableHeader = ({ children }: PropsWithChildren) => {
  return <thead className="bg-[var(--surface-elevated)]">{children}</thead>
}

export const DataTableHeaderCell = ({ children }: PropsWithChildren) => {
  return (
    <th className="border-b border-[var(--border)] px-2 py-1 text-left text-[10px] font-normal tracking-[0.08em] text-[var(--text-muted)] uppercase">
      {children}
    </th>
  )
}

export const DataTableBody = ({ children }: PropsWithChildren) => {
  return <tbody>{children}</tbody>
}

type DataTableRowProps = PropsWithChildren<{
  active?: boolean
}>

export const DataTableRow = ({
  children,
  active = false,
}: DataTableRowProps) => {
  return (
    <tr
      className={`data-row h-9 border-b border-[var(--border)] text-xs transition-colors duration-150 ${
        active
          ? 'bg-[var(--row-active-bg)] font-medium text-[var(--text-primary)] [&>td:first-child]:border-l-[2px] [&>td:first-child]:border-[var(--accent-blue)]'
          : 'text-[var(--text-secondary)] hover:bg-[var(--surface-elevated)]'
      }`}
    >
      {children}
    </tr>
  )
}

type DataTableCellProps = PropsWithChildren<{
  numeric?: boolean
}>

export const DataTableCell = ({
  children,
  numeric = false,
}: DataTableCellProps) => {
  return (
    <td className={`px-2 py-1 ${numeric ? 'table-cell-numeric' : 'text-left'}`}>
      {children}
    </td>
  )
}
