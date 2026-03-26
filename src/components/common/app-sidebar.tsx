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
  { label: 'Milestones', to: '/milestones', icon: Flag },
  { label: 'Bugs', to: '/bugs', icon: Bug },
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
      className="ops-sidebar flex h-dvh w-full flex-col"
      data-collapsed={isCollapsed}
    >
      <div className={cn('px-3 pt-3 pb-2', isCollapsed && 'px-2')}>
        <div
          className={cn(
            'flex items-center',
            isCollapsed ? 'justify-center' : 'justify-between gap-3',
          )}
        >
          {!isCollapsed ? (
            <div className="flex min-w-0 items-center gap-3 overflow-hidden">
              <div className="ops-sidebar-brand flex size-9 shrink-0 items-center justify-center rounded-lg text-[var(--primary)]">
                <LayoutGrid className="size-4" />
              </div>
              <div className="max-w-[9rem] min-w-0 overflow-hidden opacity-100 transition-[max-width,opacity] duration-200 ease-out">
                <p className="truncate text-sm font-semibold tracking-[-0.02em]">
                  Delivery
                </p>
                <p className="mt-0.5 truncate text-xs text-[var(--muted-foreground)]">
                  Workspace
                </p>
              </div>
            </div>
          ) : null}

          <Button
            className={cn(
              'ops-sidebar-utility shrink-0 rounded-md px-0',
              isCollapsed ? 'mx-auto size-10' : 'size-8',
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

      <div className={cn('px-3', isCollapsed && 'px-2')}>
        <Separator className="mx-0" />
      </div>

      <nav
        className={cn(
          'min-h-0 flex-1 overflow-auto px-2 py-3',
          isCollapsed && 'px-2',
        )}
      >
        <div className="flex flex-col gap-1">
          {navigationItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  buttonVariants({ variant: 'ghost', size: 'lg' }),
                  'ops-sidebar-link relative gap-3 overflow-hidden',
                  isCollapsed
                    ? 'mx-auto size-10 justify-center rounded-lg px-0'
                    : 'h-10 justify-start rounded-lg px-3',
                  isActive
                    ? 'ops-sidebar-link-active text-foreground'
                    : 'text-[var(--muted-foreground)]',
                )
              }
            >
              <span className="ops-sidebar-link-indicator" aria-hidden="true" />
              <item.icon className="size-4 shrink-0" />
              {!isCollapsed ? (
                <span className="min-w-0 truncate text-sm font-medium whitespace-nowrap">
                  {item.label}
                </span>
              ) : null}
            </NavLink>
          ))}
        </div>
      </nav>

      <div className={cn('mt-auto px-3 py-3', isCollapsed && 'px-2')}>
        <Separator className="mx-0" />
        <div className="flex flex-col gap-1 pt-3">
          <Button
            className={cn(
              'ops-sidebar-utility gap-3',
              isCollapsed
                ? 'mx-auto size-10 justify-center rounded-lg px-0'
                : 'h-10 justify-start rounded-lg px-3',
            )}
            variant="ghost"
            onClick={toggleTheme}
          >
            {theme === 'dark' ? (
              <MoonStar className="size-4 shrink-0" />
            ) : (
              <SunMedium className="size-4 shrink-0" />
            )}
            {!isCollapsed ? (
              <span className="text-sm font-medium whitespace-nowrap">
                {theme === 'dark' ? 'Dark mode' : 'Light mode'}
              </span>
            ) : null}
          </Button>

          <Button
            className={cn(
              'ops-sidebar-utility gap-3',
              isCollapsed
                ? 'mx-auto size-10 justify-center rounded-lg px-0'
                : 'h-10 justify-start rounded-lg px-3',
            )}
            variant="ghost"
            onClick={clearSession}
          >
            <LogOut className="size-4 shrink-0" />
            {!isCollapsed ? (
              <span className="text-sm font-medium whitespace-nowrap">
                Sign out
              </span>
            ) : null}
          </Button>
        </div>
      </div>
    </aside>
  )
}
