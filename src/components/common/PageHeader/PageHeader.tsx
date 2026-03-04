import type { PropsWithChildren } from 'react'

type PageHeaderProps = PropsWithChildren<{
  title: string
}>

export const PageHeader = ({ title, children }: PageHeaderProps) => {
  return (
    <header className="mb-6 flex items-center justify-between">
      <h1 className="text-2xl font-semibold">{title}</h1>
      {children}
    </header>
  )
}
