import { useState } from 'react'

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

import { ChartTooltip } from '@/components/common/ChartTooltip/ChartTooltip'
import type { BugStatisticPoint } from '@/features/dashboard/types/dashboard.types'

type BugAnalysisPieCardProps = {
  data: BugStatisticPoint[]
}

const hashCategory = (value: string) => {
  let hash = 0

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0
  }

  return hash
}

export const getBugAnalysisColor = (category: string, index: number) => {
  const hash = hashCategory(category)
  const hue = Math.round((index * 137.508 + (hash % 37)) % 360)
  const saturation = 62 + (hash % 12)
  const lightness = 48 + ((hash >> 3) % 10)

  return `hsl(${hue} ${saturation}% ${lightness}%)`
}

export const BugAnalysisPieCard = ({ data }: BugAnalysisPieCardProps) => {
  const [activePieIndex, setActivePieIndex] = useState<number | null>(null)
  const [activeLegendIndex, setActiveLegendIndex] = useState<number | null>(
    null,
  )
  const total = data.reduce((sum, item) => sum + item.count, 0)
  const leadCategory = data[0]
  const activeIndex = activeLegendIndex ?? activePieIndex
  const activeItem = activeLegendIndex !== null ? data[activeLegendIndex] : null

  return (
    <section className="dashboard-card px-5 py-4">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-text-muted text-[10px] tracking-[0.1em] uppercase">
            Bug Analysis
          </p>
          <p className="text-text-primary mt-1 text-[13px]">
            Distribution of bug disposition categories
          </p>
        </div>
        <div className="border-border bg-surface-elevated rounded-[4px] border px-3 py-2 text-right">
          <p className="text-text-muted text-[10px] tracking-[0.08em] uppercase">
            Total Bugs
          </p>
          <p className="metric-value text-text-primary mt-1 text-lg">{total}</p>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,420px)_minmax(0,1fr)] xl:items-center">
        <div className="relative mx-auto h-[340px] w-full max-w-[420px]">
          <ResponsiveContainer
            height="100%"
            minHeight={1}
            minWidth={0}
            width="100%"
          >
            <PieChart>
              <Pie
                animationBegin={0}
                animationDuration={900}
                cx="50%"
                cy="50%"
                data={data}
                dataKey="count"
                onMouseEnter={(_, index) => setActivePieIndex(index)}
                onMouseLeave={() => setActivePieIndex(null)}
                outerRadius={128}
                paddingAngle={0.4}
                stroke="rgba(15, 23, 42, 0.22)"
                strokeWidth={1.25}
              >
                {data.map((item, index) => (
                  <Cell
                    fill={getBugAnalysisColor(item.category, index)}
                    fillOpacity={
                      activeIndex === null || activeIndex === index ? 1 : 0.66
                    }
                    key={item.category}
                    stroke={
                      activeIndex === index
                        ? 'rgba(255, 255, 255, 0.78)'
                        : 'rgba(15, 23, 42, 0.22)'
                    }
                    strokeWidth={activeIndex === index ? 2.5 : 1.25}
                  />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null

                  const point = payload[0]?.payload as
                    | BugStatisticPoint
                    | undefined
                  if (!point) return null

                  return (
                    <ChartTooltip
                      sprintLabel={point.category}
                      rows={[
                        {
                          label: 'Bugs',
                          value: point.count.toLocaleString(),
                          color: payload[0]?.color ?? 'var(--chart-rate)',
                        },
                        {
                          label: 'Share',
                          value: `${point.share.toFixed(1)}%`,
                          color: 'var(--status-neutral)',
                        },
                      ]}
                    />
                  )
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          {activeItem ? (
            <div className="pointer-events-none absolute top-3 right-3 z-10">
              <ChartTooltip
                sprintLabel={activeItem.category}
                rows={[
                  {
                    label: 'Bugs',
                    value: activeItem.count.toLocaleString(),
                    color: getBugAnalysisColor(
                      activeItem.category,
                      activeIndex ?? 0,
                    ),
                  },
                  {
                    label: 'Share',
                    value: `${activeItem.share.toFixed(1)}%`,
                    color: 'var(--status-neutral)',
                  },
                ]}
              />
            </div>
          ) : null}
        </div>

        <div className="grid gap-3">
          <div className="border-border bg-surface-elevated rounded-[4px] border p-3">
            <p className="text-text-muted text-[10px] tracking-[0.08em] uppercase">
              Leading Category
            </p>
            <p className="text-text-primary mt-2 text-sm break-all">
              {leadCategory?.category ?? '--'}
            </p>
            <p className="metric-value text-text-primary mt-2 text-2xl leading-none">
              {leadCategory?.count.toLocaleString() ?? '0'}
            </p>
            <p className="text-text-secondary mt-1 text-[11px]">
              {leadCategory
                ? `${leadCategory.share.toFixed(1)}% of total bugs`
                : 'No data'}
            </p>
          </div>
          <div className="border-border bg-surface-elevated rounded-[4px] border p-3">
            <p className="text-text-muted mb-3 text-[10px] tracking-[0.08em] uppercase">
              Legend
            </p>
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
              {data.map((item, index) => (
                <div
                  className={`rounded-[4px] px-2 py-1 transition-colors ${
                    activeIndex === index ? 'bg-surface' : 'hover:bg-surface'
                  }`}
                  key={item.category}
                  onMouseEnter={() => setActiveLegendIndex(index)}
                  onMouseLeave={() => setActiveLegendIndex(null)}
                >
                  <div className="flex items-start gap-2">
                    <span
                      className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{
                        backgroundColor: getBugAnalysisColor(
                          item.category,
                          index,
                        ),
                      }}
                    />
                    <div className="min-w-0">
                      <p className="text-text-primary text-[11px] break-all">
                        {item.category}
                      </p>
                      <p className="text-text-secondary text-[10px]">
                        {item.count.toLocaleString()} bugs ·{' '}
                        {item.share.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
