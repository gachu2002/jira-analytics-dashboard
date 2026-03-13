type DashboardStateNoticeProps = {
  message: string
  title: string
}

export const DashboardStateNotice = ({
  message,
  title,
}: DashboardStateNoticeProps) => (
  <div className="dashboard-card p-5">
    <p className="text-text-primary text-sm font-medium">{title}</p>
    <p className="text-text-muted mt-1 text-sm">{message}</p>
  </div>
)
