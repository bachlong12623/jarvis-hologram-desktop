type SparklineProps = {
  label: string
  data: number[]
  unit?: string
  current?: string
}

export function Sparkline({ label, data, unit = '', current }: SparklineProps) {
  const max = Math.max(...data, 1)
  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * 100
      const y = 100 - (v / max) * 100
      return `${x},${y}`
    })
    .join(' ')

  return (
    <div className="hud-sparkline">
      <div className="hud-sparkline-header">
        <span className="hud-sparkline-label">{label}</span>
        {current && <span className="hud-sparkline-val">{current}{unit}</span>}
      </div>
      <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="hud-sparkline-svg">
        <polyline points={points} fill="none" stroke="rgba(77, 232, 255, 0.6)" strokeWidth="1.5" />
        <polyline
          points={`0,30 ${points} 100,30`}
          fill="rgba(77, 232, 255, 0.06)"
          stroke="none"
        />
      </svg>
    </div>
  )
}
