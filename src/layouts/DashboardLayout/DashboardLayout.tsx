import { Outlet } from 'react-router-dom'

import { useMediaQuery } from '@/hooks/useMediaQuery'
import { Sidebar } from '@/layouts/DashboardLayout/Sidebar'
import { Topbar } from '@/layouts/DashboardLayout/Topbar'

export const DashboardLayout = () => {
  const isCompact = useMediaQuery('(max-width: 1023px)')

  return (
    <div className="bg-background text-foreground flex min-h-screen">
      <Sidebar compact={isCompact} />
      <div
        className={`flex h-screen min-w-0 flex-1 flex-col overflow-hidden ${
          isCompact ? 'ml-12' : 'ml-[220px]'
        }`}
      >
        <Topbar />
        <main className="flex-1 overflow-y-auto px-6 pt-10 pb-6">
          <div className="mx-auto max-w-[1680px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
