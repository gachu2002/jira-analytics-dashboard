type ChartLegendItemProps = {
  color: string
  label: string
  dashed?: boolean
  width?: number
}

export const ChartLegendItem = ({
  color,
  label,
  dashed = false,
  width = 16,
}: ChartLegendItemProps) => {
  return (
    <div className="flex items-center gap-2">
      <svg height="2" width={width}>
        {dashed ? (
          <line
            stroke={color}
            strokeDasharray="3 2"
            strokeWidth="1.5"
            x1="0"
            x2={String(width)}
            y1="1"
            y2="1"
          />
        ) : (
          <line
            stroke={color}
            strokeWidth="2"
            x1="0"
            x2={String(width)}
            y1="1"
            y2="1"
          />
        )}
      </svg>
      <span className="text-[11px] text-[var(--text-secondary)]">{label}</span>
    </div>
  )
}
