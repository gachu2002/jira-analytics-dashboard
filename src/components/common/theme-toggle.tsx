import { MoonIcon, SunMediumIcon } from 'lucide-animated'
import { AnimatePresence, motion } from 'motion/react'

import { cn } from '@/lib/utils'
import { useThemeStore } from '@/stores/theme-store'

export function ThemeToggle({ className }: { className?: string }) {
  const theme = useThemeStore((state) => state.theme)
  const toggleTheme = useThemeStore((state) => state.toggleTheme)
  const isDark = theme === 'dark'
  const label = isDark ? 'Dark' : 'Light'
  const Icon = isDark ? MoonIcon : SunMediumIcon

  return (
    <motion.button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className={cn(
        'text-foreground hover:text-primary focus-visible:ring-ring/50 inline-flex items-center gap-2 rounded-xl px-0.5 py-0.5 text-sm font-medium transition-colors focus-visible:ring-[3px] focus-visible:outline-none',
        className,
      )}
      transition={{ type: 'spring', stiffness: 360, damping: 28 }}
    >
      <span className="sr-only">Toggle theme</span>
      <div className="border-border bg-card relative flex h-9 min-w-[4.6rem] items-center overflow-hidden rounded-xl border px-2 shadow-none">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={label}
            className="inline-flex w-full items-center justify-between gap-2"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >
            <span className="bg-accent text-accent-foreground border-border/70 flex size-[1.375rem] items-center justify-center rounded-lg border">
              <Icon className="size-3.5" size={14} />
            </span>
            <span className="text-right text-xs font-medium">{label}</span>
          </motion.span>
        </AnimatePresence>
      </div>
    </motion.button>
  )
}
