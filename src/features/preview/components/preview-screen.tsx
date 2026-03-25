import { Palette } from 'lucide-react'
import { motion } from 'motion/react'
import { Link } from 'react-router-dom'

import { ThemeToggle } from '@/components/common/theme-toggle'
import { useAuthStore } from '@/features/auth'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const colorTokens = [
  { label: 'Primary', value: 'Blue emphasis', swatch: 'bg-primary' },
  { label: 'Accent', value: 'Review highlight', swatch: 'bg-accent' },
  {
    label: 'Success',
    value: 'Healthy state',
    swatch: 'bg-[var(--status-success)]',
  },
  {
    label: 'Warning',
    value: 'Needs review',
    swatch: 'bg-[var(--status-warning)]',
  },
  {
    label: 'Danger',
    value: 'Critical issue',
    swatch: 'bg-[var(--status-danger)]',
  },
]

const timelineRows = [
  {
    label: 'Plan',
    owner: 'PMO',
    start: 6,
    span: 18,
    tone: 'bg-[var(--lane-blue)]',
  },
  {
    label: 'Build',
    owner: 'ENG',
    start: 22,
    span: 30,
    tone: 'bg-[var(--lane-teal)]',
  },
  {
    label: 'Review',
    owner: 'QA',
    start: 54,
    span: 16,
    tone: 'bg-[var(--lane-amber)]',
  },
  {
    label: 'Blocker',
    owner: 'OPS',
    start: 70,
    span: 12,
    tone: 'bg-[var(--lane-coral)]',
  },
]

const typographySpec = [
  'Display: IBM Plex Sans Condensed.',
  'Body: IBM Plex Sans.',
  'Color stays semantic.',
]

export function PreviewScreen() {
  const session = useAuthStore((state) => state.session)
  const clearSession = useAuthStore((state) => state.clearSession)

  return (
    <main className="ops-shell bg-background text-foreground">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <motion.header
          className="ops-panel flex flex-col gap-4 rounded-[28px] px-5 py-5 lg:flex-row lg:items-center lg:justify-between"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
        >
          <div className="flex items-start gap-4">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent-strong)]">
              <Palette className="size-6" />
            </div>
            <div>
              <p className="ops-kicker">Preview</p>
              <h1 className="font-display mt-2 text-[2.2rem] leading-none tracking-[-0.04em] sm:text-[2.8rem]">
                Theme, components, and timeline patterns
              </h1>
              <p className="text-muted-foreground mt-3 max-w-3xl text-sm leading-7 sm:text-base">
                A design lab for tokens, components, and presentation patterns.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">Components</Badge>
              <Badge variant="outline">Theme</Badge>
              <Badge variant="outline">Timeline</Badge>
              {session ? (
                <Badge variant="outline">{session.username}</Badge>
              ) : null}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button asChild size="sm" variant="outline">
                <Link to="/login">Login</Link>
              </Button>
              {session ? (
                <Button size="sm" variant="outline" onClick={clearSession}>
                  Sign out
                </Button>
              ) : null}
              <ThemeToggle />
            </div>
          </div>
        </motion.header>

        <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <motion.section
            className="ops-panel ops-mesh rounded-[32px] p-6 sm:p-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05, ease: 'easeOut' }}
          >
            <Badge className="ops-chip rounded-full px-3 py-1 text-[11px] font-semibold tracking-[0.18em] uppercase">
              Atlassian-adjacent
            </Badge>
            <h2 className="ops-display mt-5 text-[3rem] sm:text-[4rem] lg:text-[4.6rem]">
              Cooler, clearer, more operational.
            </h2>
            <p className="text-muted-foreground mt-5 max-w-2xl text-base leading-8 sm:text-lg">
              Stronger contrast, tighter hierarchy, and semantic color for
              timeline-first product work.
            </p>

            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {colorTokens.map((token) => (
                <div
                  key={token.label}
                  className="ops-panel-strong rounded-[24px] px-4 py-4"
                >
                  <div className={`h-14 rounded-2xl ${token.swatch}`} />
                  <p className="text-foreground mt-4 text-sm font-semibold">
                    {token.label}
                  </p>
                  <p className="text-muted-foreground mt-2 text-sm">
                    {token.value}
                  </p>
                </div>
              ))}
            </div>
          </motion.section>

          <motion.section
            className="grid gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1, ease: 'easeOut' }}
          >
            <Card className="ops-panel gap-0 rounded-[32px] py-0">
              <CardHeader className="px-6 py-6">
                <CardTitle className="text-xl tracking-[-0.03em]">
                  Typography
                </CardTitle>
                <CardDescription>
                  Clear hierarchy for dense analytical surfaces.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-muted-foreground grid gap-3 px-6 pb-6 text-sm">
                {typographySpec.map((item) => (
                  <div
                    key={item}
                    className="ops-panel-muted rounded-2xl px-4 py-3 leading-6"
                  >
                    {item}
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="ops-panel gap-0 rounded-[32px] py-0">
              <CardHeader className="px-6 py-6">
                <CardTitle className="text-xl tracking-[-0.03em]">
                  Surfaces
                </CardTitle>
                <CardDescription>
                  Primary and secondary panel treatments.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 px-6 pb-6">
                <div className="ops-panel-strong rounded-[24px] px-4 py-4">
                  <p className="text-foreground text-sm font-semibold">
                    Strong panel
                  </p>
                </div>
                <div className="ops-panel-muted rounded-[24px] px-4 py-4">
                  <p className="text-foreground text-sm font-semibold">
                    Muted panel
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.section>
        </section>

        <Tabs defaultValue="components" className="gap-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="ops-kicker">Showcase</p>
              <h2 className="font-display mt-2 text-3xl tracking-[-0.04em] sm:text-[2.3rem]">
                Reusable pieces
              </h2>
            </div>
            <TabsList>
              <TabsTrigger value="components">Components</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="components">
            <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
              <Card className="ops-panel gap-0 rounded-[32px] py-0">
                <CardHeader className="px-6 py-6">
                  <CardTitle className="text-xl tracking-[-0.03em]">
                    Buttons and badges
                  </CardTitle>
                  <CardDescription>Actions and status labels.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-5 px-6 pb-6">
                  <div className="flex flex-wrap gap-3">
                    <Button>Primary</Button>
                    <Button variant="outline">Secondary</Button>
                    <Button variant="ghost">Ghost</Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge>Primary</Badge>
                    <Badge variant="outline">Outline</Badge>
                    <Badge variant="secondary">Secondary</Badge>
                    <Badge variant="destructive">Critical</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="ops-panel gap-0 rounded-[32px] py-0">
                <CardHeader className="px-6 py-6">
                  <CardTitle className="text-xl tracking-[-0.03em]">
                    Inputs
                  </CardTitle>
                  <CardDescription>
                    Default treatment for auth and filters.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 px-6 pb-6">
                  <Input
                    className="bg-background/95 h-12 rounded-2xl"
                    placeholder="Search"
                  />
                  <Input
                    className="bg-background/95 h-12 rounded-2xl"
                    placeholder="Owner"
                  />
                  <div className="ops-panel-muted text-muted-foreground rounded-[24px] px-4 py-4 text-sm leading-6">
                    High-contrast, quiet by default.
                  </div>
                </CardContent>
              </Card>
            </section>
          </TabsContent>

          <TabsContent value="timeline">
            <Card className="ops-panel gap-0 rounded-[32px] py-0">
              <CardHeader className="px-6 py-6">
                <CardTitle className="text-xl tracking-[-0.03em]">
                  Timeline bars
                </CardTitle>
                <CardDescription>
                  Lane treatment for milestone and bug views.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-5 px-6 pb-6">
                <div className="text-muted-foreground grid grid-cols-12 gap-2 text-center text-[11px] font-semibold tracking-[0.18em] uppercase sm:text-xs">
                  {Array.from({ length: 12 }, (_, index) => (
                    <div key={index}>W{index + 1}</div>
                  ))}
                </div>

                <div className="grid gap-4">
                  {timelineRows.map((row, index) => (
                    <div key={row.label} className="grid gap-2">
                      <div className="flex items-center justify-between gap-3 text-sm">
                        <div>
                          <p className="text-foreground font-semibold">
                            {row.label}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            {row.owner}
                          </p>
                        </div>
                        <Badge variant="outline">Pattern</Badge>
                      </div>

                      <div className="relative h-16 rounded-2xl bg-[linear-gradient(90deg,var(--timeline-stripe)_0_1px,transparent_1px)] bg-[length:8.333333%_100%]">
                        <div className="bg-background/60 absolute inset-y-2 right-0 left-0 rounded-2xl border border-[color:var(--gridline-strong)]/60" />
                        <motion.div
                          className={`absolute inset-y-2 rounded-2xl shadow-[var(--shadow-card)] ${row.tone}`}
                          initial={{ opacity: 0, scaleX: 0.78 }}
                          animate={{ opacity: 1, scaleX: 1 }}
                          transition={{
                            delay: 0.08 + index * 0.05,
                            duration: 0.28,
                          }}
                          style={{
                            left: `${row.start}%`,
                            width: `${row.span}%`,
                            transformOrigin: 'left center',
                          }}
                        >
                          <div className="flex h-full items-center justify-between gap-2 px-4 text-sm font-semibold text-white/96">
                            <span>{row.label}</span>
                            <span className="hidden sm:inline">
                              {row.owner}
                            </span>
                          </div>
                        </motion.div>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="grid gap-3 md:grid-cols-3">
                  <div className="ops-panel-muted text-muted-foreground rounded-[22px] px-4 py-4 text-sm leading-6">
                    Bars stay saturated enough to scan quickly.
                  </div>
                  <div className="ops-panel-muted text-muted-foreground rounded-[22px] px-4 py-4 text-sm leading-6">
                    Grid lines keep durations anchored.
                  </div>
                  <div className="ops-panel-muted text-muted-foreground rounded-[22px] px-4 py-4 text-sm leading-6">
                    Labels remain explicit.
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
