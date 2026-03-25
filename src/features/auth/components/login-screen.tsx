import { Layers3 } from 'lucide-react'

import { ThemeToggle } from '@/components/common/theme-toggle'

import { LoginForm } from '@/features/auth/components/login-form'

const workspaceNotes = ['Milestone review', 'Bug timeline']

export function LoginScreen() {
  return (
    <main className="ops-shell bg-background text-foreground">
      <div className="ops-auth-layout">
        <section className="ops-auth-rail px-6 py-6 sm:px-8 sm:py-8 lg:px-12 lg:py-10">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="ops-kicker">Workspace</p>
              <h1 className="mt-2 text-xl font-semibold tracking-[-0.03em]">
                Jira Analytics
              </h1>
            </div>
            <ThemeToggle className="hidden md:inline-flex" />
          </div>

          <div className="flex flex-1 flex-col justify-center py-10">
            <div className="max-w-xl">
              <p className="ops-kicker">Sign in</p>
              <h2 className="mt-3 text-4xl font-semibold tracking-[-0.045em] text-balance sm:text-5xl">
                Delivery review, without the noise.
              </h2>
              <p className="text-muted-foreground mt-4 max-w-lg text-base leading-7">
                A compact workspace for milestones, bugs, and delivery status.
              </p>
            </div>

            <div className="mt-10 grid max-w-3xl gap-3 sm:grid-cols-3">
              {workspaceNotes.map((item) => (
                <div key={item} className="ops-auth-stat rounded-2xl px-4 py-4">
                  <p className="text-sm font-semibold tracking-[-0.02em]">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="ops-login-beacon pt-6">
            <div className="flex items-center gap-3 text-sm">
              <div className="bg-accent text-accent-foreground flex size-8 shrink-0 items-center justify-center rounded-lg">
                <Layers3 className="size-4" />
              </div>
              <p className="text-muted-foreground leading-6">
                Milestones and bugs stay in one review surface.
              </p>
            </div>
          </div>
        </section>

        <section className="ops-auth-pane min-h-screen px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
          <div className="flex items-center justify-end pb-4 md:hidden">
            <ThemeToggle />
          </div>

          <div className="flex flex-1 items-center justify-center">
            <div className="w-full max-w-lg">
              <LoginForm />
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
