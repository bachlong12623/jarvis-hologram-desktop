import { useEffect, useState } from 'react'
import type { RefObject } from 'react'
import type { MousePosition } from '../hooks/useMouseParallax'
import { useSystemMetrics } from '../hooks/useSystemMetrics'
import { formatUptime } from '../utils/hudData'
import { DataLog } from './hud/DataLog'
import { Waveform } from './hud/Waveform'
import { RadialGauge } from './hud/RadialGauge'
import { ModuleGrid } from './hud/ModuleGrid'
import { ProcessTable } from './hud/ProcessTable'
import { Sparkline } from './hud/Sparkline'
import { MagicCircleHud } from './hud/MagicCircleHud'
import { TaoTalismans } from './hud/TaoTalismans'

type HudOverlayProps = {
  mouseRef: RefObject<MousePosition>
}

export function HudOverlay({ mouseRef: _mouseRef }: HudOverlayProps) {
  const { data, cpuSpark, netSpark, logLines, isLive } = useSystemMetrics()
  const [cursorVisible, setCursorVisible] = useState(true)

  useEffect(() => {
    const blink = setInterval(() => setCursorVisible((v) => !v), 530)
    return () => clearInterval(blink)
  }, [])

  const loadBars = data.coreLoads.length > 0 ? data.coreLoads : [0, 0, 0, 0, 0, 0, 0, 0]
  const coreLabel = data.coreCount > 0 ? `${data.coreCount} CORES` : 'CPU CORES'

  return (
    <div className="hud">
      <div className="hud-frame hud-frame-tl" />
      <div className="hud-frame hud-frame-tr" />
      <div className="hud-frame hud-frame-bl" />
      <div className="hud-frame hud-frame-br" />

      <div className="hud-ring" />
      <div className="hud-ring hud-ring-outer" />

      <div className="hud-header">
        <div className="hud-top-left">
          <span className="hud-brand">J.A.R.V.I.S</span>
          <span className="hud-divider">//</span>
          <span className="hud-label mystic-tag">☯ ARCANA SYS</span>
          <span className={`hud-cursor ${cursorVisible ? 'visible' : ''}`}>_</span>
          <span className="hud-label hud-live-tag">{isLive ? 'CORE ONLINE' : 'OFFLINE'}</span>
        </div>
        <div className="hud-header-center">
          <span className="hud-hex">{data.hostname.toUpperCase()}</span>
          <span className="hud-header-sep">|</span>
          <span className="hud-uptime">UPTIME {formatUptime(data.uptime)}</span>
          <span className="hud-header-sep">|</span>
          <span className="hud-version">{data.platform}</span>
        </div>
        <div className="hud-header-right">
          <span className={`hud-sync-dot ${isLive ? '' : 'hud-sync-off'}`} />
          <span>{isLive ? 'LIVE METRICS' : 'NO SERVER'}</span>
        </div>
      </div>

      <div className="hud-col hud-col-left">
        <DataLog lines={7} liveLines={logLines} isLive={isLive} />
        <Waveform />
        <div className="hud-panel hud-neural">
          <div className="hud-panel-header">
            <span className="hud-panel-title">CPU LOAD</span>
            <span className="hud-panel-sub">{coreLabel}</span>
          </div>
          <div className="hud-bars">
            {loadBars.map((val, i) => (
              <div key={i} className="hud-bar-track">
                <div className="hud-bar-fill" style={{ height: `${val}%` }} />
                <span className="hud-bar-pct">{val}</span>
              </div>
            ))}
          </div>
        </div>
        <ProcessTable processes={data.processes} />
      </div>

      <div className="hud-col hud-col-right">
        <div className="hud-gauges">
          <RadialGauge label="CPU" value={data.gauges.cpu} />
          <RadialGauge label="MEM" value={data.gauges.mem} />
          <RadialGauge label="NET" value={data.gauges.net} />
          <RadialGauge label="GPU" value={data.gauges.gpu} />
        </div>

        <div className="hud-panel hud-metrics-grid">
          <div className="hud-metric-cell">
            <span className="hud-key">PROCESSES</span>
            <span className="hud-val">{data.metrics.threads}</span>
          </div>
          <div className="hud-metric-cell">
            <span className="hud-key">DISK I/O</span>
            <span className="hud-val">{data.metrics.latency} t/s</span>
          </div>
          <div className="hud-metric-cell">
            <span className="hud-key">NET I/O</span>
            <span className="hud-val">{data.metrics.throughput} MB/s</span>
          </div>
          <div className="hud-metric-cell">
            <span className="hud-key">NET KB/s</span>
            <span className="hud-val">{data.metrics.packets}</span>
          </div>
          <div className="hud-metric-cell">
            <span className="hud-key">CPU TEMP</span>
            <span className="hud-val">
              {data.metrics.temp === '—' ? '—' : `${data.metrics.temp}°C`}
            </span>
          </div>
          <div className="hud-metric-cell">
            <span className="hud-key">CLOCK</span>
            <span className="hud-val">
              {data.metrics.clock === '—' ? '—' : `${data.metrics.clock} GHz`}
            </span>
          </div>
          <div className="hud-metric-cell">
            <span className="hud-key">MEM FREE</span>
            <span className="hud-val">{data.metrics.cache}%</span>
          </div>
          <div className="hud-metric-cell">
            <span className="hud-key">DISK RW</span>
            <span className="hud-val">{data.metrics.io} B/s</span>
          </div>
        </div>

        <Sparkline
          label="NETWORK I/O"
          data={netSpark}
          unit=" MB/s"
          current={data.metrics.throughput}
        />
        <Sparkline
          label="CPU LOAD"
          data={cpuSpark}
          unit="%"
          current={String(data.gauges.cpu)}
        />

        <ModuleGrid modules={data.modules} />
      </div>

      <div className="hud-statusbar">
        <span>HOST: {data.hostname}</span>
        <span>DISK: {data.diskUsed}%</span>
        <span>CPU: {data.gauges.cpu}%</span>
        <span>MEM: {data.gauges.mem}%</span>
        <span className="hud-statusbar-right">
          NET: {data.networkMBps.toFixed(2)} MB/s
        </span>
      </div>

      <div className="hud-mystic-layer">
        <MagicCircleHud />
        <TaoTalismans />
      </div>

      <div className="hud-scanline" />
    </div>
  )
}
