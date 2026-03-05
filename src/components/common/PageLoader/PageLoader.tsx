type PageLoaderProps = {
  blocks?: number
}

export const PageLoader = ({ blocks = 1 }: PageLoaderProps) => {
  return (
    <div className="grid grid-cols-1 gap-4">
      {Array.from({ length: blocks }).map((_, index) => (
        <div
          className="dashboard-card bg-surface-elevated h-52 animate-pulse"
          key={`page-loader-${index}`}
        />
      ))}
    </div>
  )
}
