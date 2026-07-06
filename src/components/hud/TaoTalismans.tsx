import type { CSSProperties } from 'react'

/** Taoist talismans orbiting the core sphere */
const ORBITS = [
  { id: 'a', title: '敕令', sub: '太上', ring: 1, start: 0 },
  { id: 'b', title: '道符', sub: '天罡', ring: 1, start: 180 },
  { id: 'c', title: '靈符', sub: '八卦', ring: 2, start: 90 },
  { id: 'd', title: '法印', sub: '北斗', ring: 2, start: 270 },
] as const

export function TaoTalismans() {
  return (
    <div className="talisman-orbit-container" aria-hidden>
      <div className="talisman-orbit-ring talisman-orbit-ring-1">
        {ORBITS.filter((t) => t.ring === 1).map((t) => (
          <div
            key={t.id}
            className="talisman-orbit-item"
            style={{ '--start-angle': `${t.start}deg` } as CSSProperties}
          >
            <TalismanCard title={t.title} sub={t.sub} />
          </div>
        ))}
      </div>
      <div className="talisman-orbit-ring talisman-orbit-ring-2">
        {ORBITS.filter((t) => t.ring === 2).map((t) => (
          <div
            key={t.id}
            className="talisman-orbit-item"
            style={{ '--start-angle': `${t.start}deg` } as CSSProperties}
          >
            <TalismanCard title={t.title} sub={t.sub} />
          </div>
        ))}
      </div>
    </div>
  )
}

function TalismanCard({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="talisman">
      <svg viewBox="0 0 100 200" className="talisman-svg">
        <rect x="6" y="4" width="88" height="192" rx="2" fill="rgba(60, 8, 4, 0.4)" stroke="currentColor" strokeWidth="1.2" />
        <rect x="12" y="10" width="76" height="180" rx="1" fill="none" stroke="#d4a84b" strokeWidth="0.6" opacity="0.55" />
        <g className="talisman-glyphs">
          <path d="M50 32 L50 58 M38 42 L62 42 M44 52 Q50 58 56 52" stroke="currentColor" strokeWidth="1.4" fill="none" opacity="0.8" />
          <path d="M50 68 L50 92 M32 76 Q50 86 68 76" stroke="currentColor" strokeWidth="1.2" fill="none" opacity="0.75" />
          <path d="M50 102 L50 128 M28 112 Q50 122 72 112 M50 112 L50 124" stroke="currentColor" strokeWidth="1.2" fill="none" opacity="0.75" />
          <path d="M50 138 L50 162 M38 146 L62 146 M50 146 L38 158 M50 146 L62 158" stroke="currentColor" strokeWidth="1.3" fill="none" opacity="0.8" />
          <circle cx="50" cy="80" r="3" fill="#d4a84b" opacity="0.5" />
        </g>
        <text x="50" y="22" textAnchor="middle" fontSize="12" fill="currentColor" opacity="0.9" className="talisman-title">
          {title}
        </text>
        <text x="50" y="188" textAnchor="middle" fontSize="8" fill="#d4a84b" opacity="0.65">
          {sub}
        </text>
      </svg>
    </div>
  )
}
