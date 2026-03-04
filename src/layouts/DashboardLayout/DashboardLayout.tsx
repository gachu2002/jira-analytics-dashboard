import { Outlet } from 'react-router-dom'

import { useMediaQuery } from '@/hooks/useMediaQuery'
import { Sidebar } from '@/layouts/DashboardLayout/Sidebar'
import { Topbar } from '@/layouts/DashboardLayout/Topbar'

export const DashboardLayout = () => {
  const isCompact = useMediaQuery('(max-width: 1023px)')

  return (
    <div className="bg-background text-foreground flex min-h-screen">
      <Sidebar compact={isCompact} />
      <div className="min-w-0 flex-1">
        <Topbar />
        <main className="p-6">
          <div className="mx-auto max-w-[1680px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
