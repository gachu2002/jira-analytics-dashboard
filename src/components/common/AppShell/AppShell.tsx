import type { PropsWithChildren } from 'react'

export const AppShell = ({ children }: PropsWithChildren) => {
  return <div className="min-h-screen">{children}</div>
}
