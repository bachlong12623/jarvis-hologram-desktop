import si from 'systeminformation'
import type { ModuleStatus, ProcessEntry, SystemMetrics } from '../src/types/systemMetrics.js'

function pickPrimaryInterface(
  interfaces: si.Systeminformation.NetworkStatsData[],
) {
  return (
    interfaces.find(
      (n) =>
        n.operstate === 'up' &&
        !n.iface.toLowerCase().includes('loopback') &&
        !n.iface.toLowerCase().startsWith('vbox') &&
        !n.iface.toLowerCase().startsWith('vmware'),
    ) ?? interfaces[0]
  )
}

function buildModules(
  cpu: number,
  mem: number,
  disk: number,
  netMbps: number,
  gpu: number,
): ModuleStatus[] {
  const mk = (
    name: string,
    load: number,
    warnAt: number,
  ): ModuleStatus => ({
    name,
    load: Math.round(Math.min(99, Math.max(0, load))),
    status:
      load >= warnAt ? 'WARN' : load >= warnAt * 0.7 ? 'ACTIVE' : load > 10 ? 'SYNC' : 'OK',
  })

  return [
    mk('KERNEL', cpu * 0.9, 85),
    mk('NEURAL', cpu, 90),
    mk('MEMORY', mem, 88),
    mk('DISK I/O', disk, 92),
    mk('NETWORK', Math.min(99, netMbps * 12), 80),
    mk('RENDER', gpu || cpu * 0.4, 85),
    mk('SYNC', Math.min(99, (cpu + mem) / 2), 85),
    mk('SECURITY', 8 + cpu * 0.05, 95),
    mk('PROCESS', Math.min(99, cpu * 0.75), 88),
    mk('SYSTEM', mem * 0.6 + disk * 0.4, 90),
  ]
}

function buildLogLine(
  hostname: string,
  cpu: number,
  mem: number,
  netMbps: number,
  topProcess?: ProcessEntry,
): string {
  const events = [
    `SYNC  ${hostname.toUpperCase().slice(0, 8)}  CPU ${cpu.toFixed(1)}%  MEM ${mem.toFixed(1)}%`,
    `NET   ↑↓ ${netMbps.toFixed(2)} MB/s  [LIVE]`,
    topProcess
      ? `PROC  ${topProcess.name.slice(0, 14)}  PID ${topProcess.pid}  ${topProcess.cpu}%`
      : `PROC  scheduler idle  0.0%`,
  ]
  return events[Math.floor(Math.random() * events.length)]
}

export async function collectMetrics(): Promise<SystemMetrics> {
  const [load, mem, network, processes, time, cpu, temp, disksIO, fsSize, osInfo, graphics] =
    await Promise.all([
      si.currentLoad(),
      si.mem(),
      si.networkStats(),
      si.processes(),
      si.time(),
      si.cpu(),
      si.cpuTemperature().catch(() => ({ main: null as number | null })),
      si.disksIO().catch(() => null),
      si.fsSize(),
      si.osInfo(),
      si.graphics().catch(() => ({ controllers: [] as si.Systeminformation.GraphicsControllerData[] })),
    ])

  const primaryNet = pickPrimaryInterface(network)
  const rxSec = primaryNet?.rx_sec ?? 0
  const txSec = primaryNet?.tx_sec ?? 0
  const throughputMB = (rxSec + txSec) / (1024 * 1024)
  const memPercent = mem.total > 0 ? (mem.used / mem.total) * 100 : 0
  const diskPercent =
    fsSize[0] && fsSize[0].size > 0 ? (fsSize[0].used / fsSize[0].size) * 100 : 0

  let gpuLoad = 0
  const gpuController = graphics.controllers.find((g) => g.utilizationGpu != null)
  if (gpuController?.utilizationGpu != null) {
    gpuLoad = gpuController.utilizationGpu
  }

  const topProcesses: ProcessEntry[] = processes.list
    .filter((p) => p.pid > 0 && p.name)
    .sort((a, b) => b.cpu - a.cpu)
    .slice(0, 6)
    .map((p) => ({
      pid: String(p.pid),
      name: p.name,
      cpu: p.cpu.toFixed(1),
      mem: p.mem.toFixed(0),
      state: p.state === 'running' || p.cpu > 0.05 ? 'RUN' : 'WAIT',
    }))

  const coreLoads = load.cpus.map((c) => Math.round(Math.min(100, Math.max(0, c.load))))
  while (coreLoads.length < 8) {
    coreLoads.push(0)
  }

  const metrics = {
    threads: String(processes.all || processes.running + processes.sleeping),
    latency: disksIO?.tIO_sec != null ? `${Math.round(disksIO.tIO_sec)}` : '—',
    throughput: throughputMB.toFixed(2),
    packets: `${Math.round((rxSec + txSec) / 1024)}`,
    temp: temp.main != null ? temp.main.toFixed(1) : '—',
    clock:
      cpu.speedMax > 0
        ? (cpu.speedMax / 1000).toFixed(2)
        : cpu.speed > 0
          ? (cpu.speed / 1000).toFixed(2)
          : '—',
    cache: mem.total > 0 ? ((mem.available / mem.total) * 100).toFixed(1) : '—',
    io: disksIO
      ? `${Math.round((disksIO.rIO_sec ?? 0) + (disksIO.wIO_sec ?? 0))}`
      : '—',
  }

  const gauges = {
    cpu: Math.round(load.currentLoad),
    mem: Math.round(memPercent),
    net: Math.min(99, Math.round(throughputMB * 15)),
    gpu: Math.round(gpuLoad),
  }

  return {
    connected: true,
    timestamp: Date.now(),
    gauges,
    metrics,
    coreLoads: coreLoads.slice(0, 8),
    coreCount: cpu.cores,
    processes: topProcesses,
    uptime: time.uptime,
    hostname: osInfo.hostname,
    platform: `${osInfo.distro} ${osInfo.release}`.trim(),
    cpuLoad: load.currentLoad,
    networkMBps: throughputMB,
    diskUsed: Math.round(diskPercent),
    modules: buildModules(gauges.cpu, gauges.mem, diskPercent, throughputMB, gauges.gpu),
    logLine: buildLogLine(osInfo.hostname, gauges.cpu, memPercent, throughputMB, topProcesses[0]),
  }
}
