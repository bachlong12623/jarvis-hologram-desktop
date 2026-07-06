/** Western magic circle HUD overlay — counter-rotating sacred geometry */
export function MagicCircleHud() {
  return (
    <div className="magic-circle-hud" aria-hidden>
      <svg className="magic-circle-svg magic-circle-outer" viewBox="0 0 400 400">
        <circle cx="200" cy="200" r="190" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.25" />
        <circle cx="200" cy="200" r="175" fill="none" stroke="currentColor" strokeWidth="0.3" strokeDasharray="4 6" opacity="0.2" />
        {Array.from({ length: 36 }).map((_, i) => {
          const a = (i / 36) * Math.PI * 2
          const x1 = 200 + Math.cos(a) * 168
          const y1 = 200 + Math.sin(a) * 168
          const x2 = 200 + Math.cos(a) * 182
          const y2 = 200 + Math.sin(a) * 182
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="currentColor" strokeWidth="0.6" opacity="0.35" />
        })}
        {['ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', 'ᚱ', 'ᚲ', 'ᚷ', 'ᚹ'].map((rune, i) => {
          const a = (i / 8) * Math.PI * 2 - Math.PI / 2
          const x = 200 + Math.cos(a) * 155
          const y = 200 + Math.sin(a) * 155
          return (
            <text
              key={i}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="10"
              fill="currentColor"
              opacity="0.4"
              transform={`rotate(${(a * 180) / Math.PI + 90}, ${x}, ${y})`}
            >
              {rune}
            </text>
          )
        })}
      </svg>

      <svg className="magic-circle-svg magic-circle-mid" viewBox="0 0 400 400">
        <polygon
          points="200,55 331,150 280,305 120,305 69,150"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.8"
          opacity="0.35"
        />
        <polygon
          points="200,95 295,165 265,275 135,275 105,165"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.5"
          opacity="0.25"
        />
        <polygon
          points="200,120 120,180 200,280 280,180"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.6"
          opacity="0.3"
        />
      </svg>

      <svg className="magic-circle-svg magic-circle-inner" viewBox="0 0 400 400">
        <polygon
          points="200,140 260,220 200,260 140,220"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.5"
          opacity="0.3"
        />
        <circle cx="200" cy="200" r="30" fill="none" stroke="currentColor" strokeWidth="0.4" opacity="0.25" />
        <text x="200" y="206" textAnchor="middle" fontSize="14" fill="currentColor" opacity="0.35">
          ✦
        </text>
      </svg>
    </div>
  )
}
