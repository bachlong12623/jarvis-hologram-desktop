import { useEffect, useRef, useState } from 'react'
import type { SystemMetrics } from '../types/systemMetrics'
import { generateSparkline } from '../utils/hudData'
import { perf } from '../utils/performanceMode'

const METRICS_URL = import.meta.env.VITE_METRICS_URL ?? ''
const API_BASE = METRICS_URL || (import.meta.env.DEV ? '' : 'http://127.0.0.1:3742')
const POLL_MS = perf.metricsPollMs

const FALLBACK: SystemMetrics = {
  connected: false,
  timestamp: 0,
  gauges: { cpu: 0, mem: 0, net: 0, gpu: 0 },
  metrics: {
    threads: '—',
    latency: '—',
    throughput: '—',
    packets: '—',
    temp: '—',
    clock: '—',
    cache: '—',
    io: '—',
  },
  coreLoads: [0, 0, 0, 0, 0, 0, 0, 0],
  coreCount: 0,
  processes: [],
  uptime: 0,
  hostname: 'OFFLINE',
  platform: 'Waiting for metrics server',
  cpuLoad: 0,
  networkMBps: 0,
  diskUsed: 0,
  modules: [],
  logLine: 'WAIT  metrics server offline  →  npm run dev',
}

export function useSystemMetrics() {
  const [data, setData] = useState<SystemMetrics>(FALLBACK)
  const [cpuSpark, setCpuSpark] = useState(() => generateSparkline(24, 10))
  const [netSpark, setNetSpark] = useState(() => generateSparkline(24, 5))
  const [logLines, setLogLines] = useState<string[]>([])
  const lastLogRef = useRef('')

  useEffect(() => {
    let alive = true

    const poll = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/metrics`, { cache: 'no-store' })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const json = (await res.json()) as SystemMetrics
        if (!alive) return

        setData(json)
        setCpuSpark((prev) => [
          ...prev.slice(1),
          Math.max(2, Math.min(98, Math.round(json.gauges.cpu))),
        ])
        setNetSpark((prev) => [
          ...prev.slice(1),
          Math.max(2, Math.min(98, Math.round(json.networkMBps * 15))),
        ])

        if (json.logLine && json.logLine !== lastLogRef.current) {
          lastLogRef.current = json.logLine
          setLogLines((prev) => [...prev.slice(-6), json.logLine])
        }
      } catch {
        if (!alive) return
        setData((prev) => ({ ...FALLBACK, hostname: prev.hostname }))
      }
    }

    void poll()
    const id = setInterval(poll, POLL_MS)
    return () => {
      alive = false
      clearInterval(id)
    }
  }, [])

  return { data, cpuSpark, netSpark, logLines, isLive: data.connected }
}
