import {
  Bug,
  Flag,
  LayoutGrid,
  LogOut,
  MoonStar,
  PanelLeftClose,
  PanelLeftOpen,
  SunMedium,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'

import { Button, buttonVariants } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useAuthStore } from '@/features/auth'
import { cn } from '@/lib/utils'
import { useThemeStore } from '@/stores/theme-store'

const navigationItems = [
  {
    label: 'Milestones',
    to: '/milestones',
    icon: Flag,
  },
  {
    label: 'Bugs',
    to: '/bugs',
    icon: Bug,
  },
]

type AppSidebarProps = {
  isCollapsed: boolean
  onToggleCollapse: () => void
}

export function AppSidebar({ isCollapsed, onToggleCollapse }: AppSidebarProps) {
  const clearSession = useAuthStore((state) => state.clearSession)
  const theme = useThemeStore((state) => state.theme)
  const toggleTheme = useThemeStore((state) => state.toggleTheme)

  return (
    <aside
      className="ops-sidebar flex h-full w-full flex-col py-3"
      data-collapsed={isCollapsed}
    >
      <div
        className={cn(
          'ops-sidebar-header px-3 pt-2 pb-3',
          isCollapsed && 'px-2',
        )}
      >
        <div
          className={cn(
            'flex items-center gap-3',
            isCollapsed ? 'flex-col items-center' : 'justify-between',
          )}
        >
          <div className="flex min-w-0 items-center gap-3 overflow-hidden">
            <div className="ops-sidebar-brand flex size-9 shrink-0 items-center justify-center rounded-md text-[var(--primary)]">
              <LayoutGrid className="size-4" />
            </div>
            <div
              className={cn(
                'ops-sidebar-copy min-w-0 overflow-hidden transition-[max-width,opacity,transform] duration-200 ease-out',
                isCollapsed
                  ? 'max-w-0 -translate-x-1 opacity-0'
                  : 'max-w-[9rem] translate-x-0 opacity-100',
              )}
            >
              <p className="ops-kicker whitespace-nowrap">Workspace</p>
              <p className="mt-1 truncate text-sm font-semibold tracking-[-0.02em] whitespace-nowrap">
                Delivery
              </p>
            </div>
          </div>

          <Button
            className={cn(
              'ops-sidebar-utility shrink-0 rounded-md px-0',
              isCollapsed ? 'size-10' : 'size-8',
            )}
            size="sm"
            variant="ghost"
            onClick={onToggleCollapse}
          >
            {isCollapsed ? (
              <PanelLeftOpen className="size-4" />
            ) : (
              <PanelLeftClose className="size-4" />
            )}
          </Button>
        </div>
      </div>

      <Separator className="mx-3 mt-1" />

      <nav
        className={cn('flex flex-col gap-1 px-2 pt-3', isCollapsed && 'px-1.5')}
      >
        {navigationItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                buttonVariants({ variant: 'ghost', size: 'lg' }),
                isCollapsed
                  ? 'h-10 justify-center rounded-md px-0'
                  : 'h-10 justify-start rounded-md px-3',
                isActive
                  ? 'ops-sidebar-link ops-sidebar-link-active text-foreground'
                  : 'ops-sidebar-link',
              )
            }
          >
            <item.icon className="size-4 shrink-0" />
            <span
              className={cn(
                'truncate text-sm font-medium whitespace-nowrap transition-[max-width,opacity,transform] duration-200 ease-out',
                isCollapsed
                  ? 'max-w-0 -translate-x-1 opacity-0'
                  : 'max-w-[8rem] translate-x-0 opacity-100',
              )}
            >
              {item.label}
            </span>
          </NavLink>
        ))}
      </nav>

      <div className={cn('mt-auto px-3 pt-6', isCollapsed && 'px-1.5')}>
        <Separator className="mx-0" />
        <div className="flex flex-col gap-2 pt-4">
          <Button
            className={cn(
              'ops-sidebar-utility',
              isCollapsed
                ? 'size-10 justify-center rounded-md px-0'
                : 'h-10 justify-start rounded-md',
            )}
            variant="ghost"
            onClick={toggleTheme}
          >
            {theme === 'dark' ? (
              <MoonStar className="size-4 shrink-0" />
            ) : (
              <SunMedium className="size-4 shrink-0" />
            )}
            <span
              className={cn(
                'whitespace-nowrap transition-[max-width,opacity,transform] duration-200 ease-out',
                isCollapsed
                  ? 'max-w-0 -translate-x-1 opacity-0'
                  : 'max-w-[6rem] translate-x-0 opacity-100',
              )}
            >
              {theme === 'dark' ? 'Dark' : 'Light'}
            </span>
          </Button>

          <Button
            className={cn(
              'ops-sidebar-utility',
              isCollapsed
                ? 'size-10 justify-center rounded-md px-0'
                : 'h-10 justify-start rounded-md',
            )}
            variant="ghost"
            onClick={clearSession}
          >
            <LogOut className="size-4 shrink-0" />
            <span
              className={cn(
                'whitespace-nowrap transition-[max-width,opacity,transform] duration-200 ease-out',
                isCollapsed
                  ? 'max-w-0 -translate-x-1 opacity-0'
                  : 'max-w-[6rem] translate-x-0 opacity-100',
              )}
            >
              Sign out
            </span>
          </Button>
        </div>
      </div>
    </aside>
  )
}
