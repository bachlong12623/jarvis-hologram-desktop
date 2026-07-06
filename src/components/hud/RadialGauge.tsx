type RadialGaugeProps = {
  label: string
  value: number
  unit?: string
  size?: number
}

export function RadialGauge({ label, value, unit = '%', size = 64 }: RadialGaugeProps) {
  const radius = (size - 8) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (value / 100) * circumference * 0.75
  const cx = size / 2
  const cy = size / 2

  return (
    <div className="hud-gauge">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke="rgba(77, 232, 255, 0.08)"
          strokeWidth="3"
          strokeDasharray={`${circumference * 0.75} ${circumference * 0.25}`}
          transform={`rotate(135 ${cx} ${cy})`}
        />
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke="#4de8ff"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={`${circumference * 0.75} ${circumference * 0.25}`}
          strokeDashoffset={offset}
          transform={`rotate(135 ${cx} ${cy})`}
          opacity={0.7}
        />
        <text
          x={cx}
          y={cy - 2}
          textAnchor="middle"
          className="hud-gauge-value"
          fontSize="11"
        >
          {value.toFixed(0)}
        </text>
        <text
          x={cx}
          y={cy + 10}
          textAnchor="middle"
          className="hud-gauge-unit"
          fontSize="7"
        >
          {unit}
        </text>
      </svg>
      <span className="hud-gauge-label">{label}</span>
    </div>
  )
}
