import { useEffect, useMemo, useState } from 'react'

const WEEKDAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']

function buildMonthGrid(year: number, month: number): (number | null)[] {
  const first = new Date(year, month, 1)
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  let start = first.getDay()
  start = start === 0 ? 6 : start - 1

  const cells: (number | null)[] = []
  for (let i = 0; i < start; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}

export function DateTimeClock() {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const tick = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(tick)
  }, [])

  const time = now.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })

  const dateLine = now.toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const monthTitle = now.toLocaleDateString('vi-VN', {
    month: 'long',
    year: 'numeric',
  })

  const today = now.getDate()
  const cells = useMemo(
    () => buildMonthGrid(now.getFullYear(), now.getMonth()),
    [now.getFullYear(), now.getMonth()],
  )

  return (
    <div className="hud-datetime">
      <div className="hud-datetime-bracket hud-datetime-bracket-tl" />
      <div className="hud-datetime-bracket hud-datetime-bracket-tr" />
      <div className="hud-datetime-bracket hud-datetime-bracket-bl" />
      <div className="hud-datetime-bracket hud-datetime-bracket-br" />

      <div className="hud-datetime-clock">
        <span className="hud-datetime-time">{time}</span>
        <span className="hud-datetime-date">{dateLine}</span>
      </div>

      <div className="hud-datetime-calendar">
        <div className="hud-datetime-cal-header">
          <span className="hud-datetime-cal-title">{monthTitle}</span>
          <span className="hud-datetime-cal-tag">CHRONO</span>
        </div>
        <div className="hud-datetime-cal-grid">
          {WEEKDAYS.map((d) => (
            <span key={d} className="hud-datetime-cal-dow">
              {d}
            </span>
          ))}
          {cells.map((day, i) => (
            <span
              key={i}
              className={`hud-datetime-cal-day${day === today ? ' is-today' : ''}${day === null ? ' is-empty' : ''}`}
            >
              {day ?? ''}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
