import { useEffect, useRef } from 'react'
import { generateLogLine } from '../../utils/hudData'

type DataLogProps = {
  lines?: number
  liveLines?: string[]
  isLive?: boolean
}

export function DataLog({ lines = 8, liveLines, isLive }: DataLogProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    if (isLive && liveLines && liveLines.length > 0) {
      el.innerHTML = liveLines
        .slice(-lines)
        .map((l) => `<div class="hud-log-line">${l}</div>`)
        .join('')
      return
    }

    const initial = Array.from({ length: lines }, () => generateLogLine())
    el.innerHTML = initial.map((l) => `<div class="hud-log-line">${l}</div>`).join('')

    const interval = setInterval(() => {
      const line = document.createElement('div')
      line.className = 'hud-log-line'
      line.textContent = generateLogLine()
      el.appendChild(line)
      while (el.children.length > lines) {
        el.removeChild(el.firstChild!)
      }
    }, 180)

    return () => clearInterval(interval)
  }, [lines, isLive, liveLines])

  return (
    <div className="hud-panel hud-log">
      <div className="hud-panel-header">
        <span className="hud-panel-title">DATA STREAM</span>
        <span className="hud-panel-badge">{isLive ? 'LIVE' : 'SIM'}</span>
      </div>
      <div className="hud-log-body" ref={ref} />
    </div>
  )
}
