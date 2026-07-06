export type ProcessEntry = {
  pid: string
  name: string
  cpu: string
  mem: string
  state: string
}

export type ModuleStatus = {
  name: string
  load: number
  status: 'OK' | 'ACTIVE' | 'SYNC' | 'WARN'
}

export type SystemMetrics = {
  connected: boolean
  timestamp: number
  gauges: {
    cpu: number
    mem: number
    net: number
    gpu: number
  }
  metrics: {
    threads: string
    latency: string
    throughput: string
    packets: string
    temp: string
    clock: string
    cache: string
    io: string
  }
  coreLoads: number[]
  coreCount: number
  processes: ProcessEntry[]
  uptime: number
  hostname: string
  platform: string
  cpuLoad: number
  networkMBps: number
  diskUsed: number
  modules: ModuleStatus[]
  logLine: string
}
