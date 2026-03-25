import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'

import { ThemeToggle } from '@/components/common/theme-toggle'
import { AppSidebar } from '@/components/common/app-sidebar'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const mobileNavItems = [
  { label: 'Milestones', to: '/milestones' },
  { label: 'Bugs', to: '/bugs' },
]

export function AppLayout() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  return (
    <main className="ops-shell bg-background text-foreground">
      <div
        className="ops-workspace-layout min-h-screen w-full"
        data-sidebar-collapsed={isSidebarCollapsed}
      >
        <div className="hidden lg:block">
          <AppSidebar
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={() => setIsSidebarCollapsed((value) => !value)}
          />
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="ops-topbar lg:hidden">
            <div className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <p className="ops-kicker">Workspace</p>
                <p className="mt-1 truncate text-sm font-semibold tracking-[-0.02em]">
                  Delivery
                </p>
              </div>
              <ThemeToggle />
            </div>

            <div className="flex gap-2 px-4 pb-3">
              {mobileNavItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      buttonVariants({ size: 'sm', variant: 'ghost' }),
                      'rounded-md px-3',
                      isActive
                        ? 'ops-sidebar-link ops-sidebar-link-active text-foreground'
                        : 'ops-sidebar-link',
                    )
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>

          <div className="ops-workspace-main min-w-0 flex-1">
            <Outlet />
          </div>
        </div>
      </div>
    </main>
  )
}
