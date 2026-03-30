type LoadingScreenProps = {
  title?: string
  detail?: string
}

type LoadingPanelProps = {
  title?: string
  detail?: string
  lines?: number
}

export function AppLoadingScreen({
  title = 'Opening workspace',
  detail = 'Loading routes and shared context.',
}: LoadingScreenProps) {
  return (
    <main className="ops-shell bg-background text-foreground flex min-h-screen items-center justify-center px-4">
      <div className="ops-loading-screen ops-panel-strong w-full max-w-lg rounded-[28px] p-6 sm:p-8">
        <div className="ops-loading-stage flex items-center gap-4">
          <div className="ops-loading-core">
            <span className="ops-loading-core-ring" />
            <span className="ops-loading-core-dot" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="ops-kicker">Loading</p>
            <h1 className="mt-2 text-xl font-semibold tracking-[-0.03em]">
              {title}
            </h1>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {detail}
            </p>
          </div>
        </div>
        <div className="mt-6 grid gap-3">
          <LoadingLine width="72%" />
          <LoadingLine width="96%" />
          <LoadingLine width="84%" />
        </div>
        <div className="mt-5 grid grid-cols-3 gap-3">
          <LoadingTile />
          <LoadingTile />
          <LoadingTile />
        </div>
      </div>
    </main>
  )
}

export function LoadingPanel({
  title = 'Loading',
  detail,
  lines = 3,
}: LoadingPanelProps) {
  return (
    <div className="ops-loading-panel rounded-xl p-4">
      <div className="flex items-center gap-3">
        <div className="ops-loading-dot" />
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold tracking-[-0.02em] text-[var(--foreground)]">
            {title}
          </div>
          {detail ? (
            <div className="mt-1 text-xs text-[var(--muted-foreground)]">
              {detail}
            </div>
          ) : null}
        </div>
      </div>
      <div className="mt-4 grid gap-2.5">
        {Array.from({ length: lines }).map((_, index) => (
          <LoadingLine
            key={index}
            width={
              index === lines - 1 ? '68%' : index % 2 === 0 ? '94%' : '82%'
            }
          />
        ))}
      </div>
    </div>
  )
}

export function TimelineWorkspaceLoading() {
  return (
    <div className="flex flex-1 px-4 py-4 lg:px-5">
      <div className="grid min-h-[32rem] w-full grid-cols-[18rem_minmax(0,1fr)] overflow-hidden rounded-xl border border-[color:var(--border)]/80 bg-[color:var(--workspace-pane)] shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]">
        <div className="border-r border-[color:var(--border)]/75 bg-[color:var(--workspace-pane-muted)] p-4">
          <div className="grid gap-3">
            <LoadingLine width="40%" />
            <LoadingLine width="90%" />
            <LoadingLine width="74%" />
          </div>
          <div className="mt-5 grid gap-2.5">
            {Array.from({ length: 7 }).map((_, index) => (
              <div key={index} className="ops-loading-row rounded-lg px-3 py-3">
                <LoadingLine width={index % 2 === 0 ? '72%' : '58%'} />
              </div>
            ))}
          </div>
        </div>
        <div className="p-4">
          <div className="grid gap-3">
            <div className="grid grid-cols-4 gap-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <LoadingTile key={index} />
              ))}
            </div>
            <div className="ops-loading-grid rounded-xl p-4">
              <div className="grid grid-cols-6 gap-2">
                {Array.from({ length: 18 }).map((_, index) => (
                  <span
                    key={index}
                    className="ops-loading-cell h-8 rounded-md"
                    style={{ animationDelay: `${index * 40}ms` }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function LoadingTile() {
  return (
    <div className="ops-loading-tile rounded-xl p-3">
      <LoadingLine width="44%" />
      <div className="mt-3">
        <LoadingLine width="78%" />
      </div>
    </div>
  )
}

function LoadingLine({ width }: { width: string }) {
  return (
    <div className="ops-loading-line h-2.5 rounded-full" style={{ width }} />
  )
}
