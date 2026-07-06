const HEX_CHARS = '0123456789ABCDEF'
const PROCESS_NAMES = [
  'neural_infer', 'tensor_core', 'quantum_sync', 'mem_cache',
  'io_dispatch', 'kernel_sched', 'holo_render', 'data_pipeline',
  'crypto_hash', 'net_stack', 'gpu_cluster', 'ai_orchestrator',
]
const MODULES = [
  'KERNEL', 'NEURAL', 'QUANTUM', 'SYNC', 'CRYPTO', 'I/O',
  'RENDER', 'MEMORY', 'NETWORK', 'SECURITY',
]

export function randomHex(bytes: number) {
  let out = '0x'
  for (let i = 0; i < bytes; i++) {
    out += HEX_CHARS[Math.floor(Math.random() * 16)]
    out += HEX_CHARS[Math.floor(Math.random() * 16)]
  }
  return out
}

export function randomHash() {
  return Array.from({ length: 8 }, () =>
    HEX_CHARS[Math.floor(Math.random() * 16)],
  ).join('')
}

export function randomMetric(base: number, range: number, decimals = 1) {
  return (base + (Math.random() - 0.5) * range).toFixed(decimals)
}

export function formatUptime(seconds: number) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function generateLogLine() {
  const types = ['READ', 'WRITE', 'EXEC', 'SYNC', 'PUSH', 'PULL']
  const type = types[Math.floor(Math.random() * types.length)]
  return `${type}  ${randomHex(4)}  →  ${randomHex(4)}  [${randomHash()}]  ${randomMetric(0, 999, 0)}μs`
}

export type ProcessEntry = {
  pid: string
  name: string
  cpu: string
  mem: string
  state: string
}

export function generateProcess(): ProcessEntry {
  const name = PROCESS_NAMES[Math.floor(Math.random() * PROCESS_NAMES.length)]
  return {
    pid: String(1000 + Math.floor(Math.random() * 8999)),
    name,
    cpu: randomMetric(Math.random() * 30, 10, 1),
    mem: randomMetric(Math.random() * 512, 100, 0),
    state: Math.random() > 0.15 ? 'RUN' : 'WAIT',
  }
}

export type ModuleStatus = {
  name: string
  load: number
  status: 'OK' | 'ACTIVE' | 'SYNC' | 'WARN'
}

export function generateModules(): ModuleStatus[] {
  return MODULES.map((name) => ({
    name,
    load: Math.floor(20 + Math.random() * 75),
    status: (['OK', 'ACTIVE', 'SYNC', 'WARN'] as const)[
      Math.floor(Math.random() * 4)
    ],
  }))
}

export function generateSparkline(length: number, base: number) {
  return Array.from({ length }, () =>
    Math.max(5, Math.min(95, base + (Math.random() - 0.5) * 40)),
  )
}
