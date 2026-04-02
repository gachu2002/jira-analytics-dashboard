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
  title = 'Loading workspace',
  detail,
}: LoadingScreenProps) {
  return (
    <main className="ops-shell flex min-h-screen items-center justify-center bg-[var(--workspace-bg)] px-6 text-[var(--foreground)]">
      <div className="ops-loading-panel w-full max-w-sm rounded-lg px-8 py-10">
        <LoadingContent title={title} detail={detail} />
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
    <section
      className="ops-loading-panel rounded-lg p-4"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div
        className="flex items-center justify-center"
        style={{ minHeight: `${Math.max(lines, 3) * 1.75 + 7}rem` }}
      >
        <LoadingContent title={title} detail={detail} compact />
      </div>
    </section>
  )
}

export function TimelineWorkspaceLoading({
  title = 'Loading timeline',
  detail,
}: LoadingScreenProps) {
  return (
    <div className="flex flex-1 px-4 py-4 lg:px-5">
      <div className="ops-loading-panel flex min-h-[28rem] w-full items-center justify-center rounded-lg px-6 py-10">
        <LoadingContent title={title} detail={detail} />
      </div>
    </div>
  )
}

function LoadingContent({
  title,
  detail,
  compact = false,
}: LoadingScreenProps & {
  compact?: boolean
}) {
  return (
    <div
      className="flex flex-col items-center text-center"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span
        aria-hidden="true"
        className={`ops-loading-spinner ${compact ? 'size-7' : 'size-9'}`}
      />
      <p
        className={`mt-4 font-medium tracking-[-0.01em] text-[var(--foreground)] ${compact ? 'text-sm' : 'text-base'}`}
      >
        {title}
      </p>
      {detail ? (
        <p className="mt-1 max-w-[20rem] text-xs leading-5 text-[var(--muted-foreground)]">
          {detail}
        </p>
      ) : null}
    </div>
  )
}
