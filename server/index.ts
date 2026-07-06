import express from 'express'
import cors from 'cors'
import { collectMetrics } from './collectMetrics.js'
import type { SystemMetrics } from '../src/types/systemMetrics.js'

const PORT = Number(process.env.METRICS_PORT ?? 3742)
const app = express()

app.use(cors())

let cache: SystemMetrics | null = null
let inFlight: Promise<SystemMetrics> | null = null

function refresh(): Promise<SystemMetrics> {
  if (inFlight) return inFlight

  inFlight = collectMetrics()
    .then((data) => {
      cache = data
      return data
    })
    .finally(() => {
      inFlight = null
    })

  return inFlight
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, port: PORT, ready: cache !== null })
})

app.get('/api/metrics', async (_req, res) => {
  try {
    const data = await refresh()
    res.json(data)
  } catch (err) {
    console.error('[metrics] collect failed:', err)
    if (cache) {
      res.json(cache)
      return
    }
    res.status(503).json({ connected: false, error: 'Metrics unavailable' })
  }
})

setInterval(() => {
  void refresh()
}, 2000)

console.log('[metrics] collecting initial snapshot...')
void refresh().then(() => {
  app.listen(PORT, '127.0.0.1', () => {
    console.log(`[metrics] listening on http://127.0.0.1:${PORT}`)
  })
})
