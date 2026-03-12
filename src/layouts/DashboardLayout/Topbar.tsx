import { DataSourceBar } from '@/features/dashboard/components/DataSourceBar'

export const Topbar = () => {
  return (
    <header className="bg-background/90 sticky top-0 z-10 backdrop-blur">
      <DataSourceBar />
    </header>
  )
}
