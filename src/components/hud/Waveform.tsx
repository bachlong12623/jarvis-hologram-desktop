import { useEffect, useRef } from 'react'

type WaveformProps = {
  width?: number
  height?: number
}

export function Waveform({ width = 280, height = 60 }: WaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const phaseRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let frame: number

    const draw = () => {
      phaseRef.current += 0.04
      const phase = phaseRef.current
      const w = canvas.width
      const h = canvas.height

      ctx.clearRect(0, 0, w, h)

      const waves = [
        { amp: 0.22, freq: 2.5, speed: 1.0, color: 'rgba(77, 232, 255, 0.5)' },
        { amp: 0.14, freq: 4.0, speed: 1.6, color: 'rgba(61, 139, 253, 0.35)' },
        { amp: 0.08, freq: 7.0, speed: 2.2, color: 'rgba(232, 244, 255, 0.2)' },
      ]

      for (const wave of waves) {
        ctx.beginPath()
        for (let x = 0; x < w; x++) {
          const t = x / w
          const y =
            h / 2 +
            Math.sin(t * Math.PI * wave.freq + phase * wave.speed) * h * wave.amp +
            Math.sin(t * Math.PI * 12 + phase * 3) * h * 0.03
          if (x === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        ctx.strokeStyle = wave.color
        ctx.lineWidth = 1
        ctx.stroke()
      }

      ctx.strokeStyle = 'rgba(77, 232, 255, 0.08)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(0, h / 2)
      ctx.lineTo(w, h / 2)
      ctx.stroke()

      frame = requestAnimationFrame(draw)
    }

    draw()
    return () => cancelAnimationFrame(frame)
  }, [height])

  return (
    <div className="hud-panel hud-waveform">
      <div className="hud-panel-header">
        <span className="hud-panel-title">SIGNAL ANALYSIS</span>
        <span className="hud-panel-sub">44.1 kHz</span>
      </div>
      <canvas ref={canvasRef} width={width} height={height} />
    </div>
  )
}
