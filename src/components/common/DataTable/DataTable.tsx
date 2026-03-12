import type { PropsWithChildren } from 'react'

export const DataTable = ({ children }: PropsWithChildren) => {
  return (
    <div className="overflow-hidden rounded-[0px]">
      <table className="w-full border-collapse">{children}</table>
    </div>
  )
}

export const DataTableHeader = ({ children }: PropsWithChildren) => {
  return <thead className="bg-surface-elevated">{children}</thead>
}

export const DataTableHeaderCell = ({ children }: PropsWithChildren) => {
  return (
    <th className="border-border text-text-muted border-b px-2 py-1 text-left text-[10px] font-normal tracking-[0.08em] uppercase">
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
      className={`data-row border-border h-9 border-b text-xs transition-colors duration-150 ${
        active
          ? 'bg-row-active-bg text-text-primary [&>td:first-child]:border-primary font-medium [&>td:first-child]:border-l-[2px]'
          : 'text-text-secondary hover:bg-surface-elevated'
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
