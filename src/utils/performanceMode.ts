export type PerformanceProfile = {
  isWallpaper: boolean
  targetFps: number
  dpr: [number, number]
  antialias: boolean
  chromaticAberration: boolean
  bloomMipmapBlur: boolean
  bloomIntensity: number
  sphereSegments: number
  ringSegments: number
  dataStreams: { streams: number; bits: number }
  metricsPollMs: number
  waveformFps: number
}

function isWallpaperRuntime(): boolean {
  if (typeof window === 'undefined') return false
  if (import.meta.env.DEV) return false

  // Lively / packaged wallpaper loads from disk
  if (window.location.protocol === 'file:') return true

  // WebView2 host (Lively on Windows)
  const w = window as Window & { chrome?: { webview?: unknown } }
  return Boolean(w.chrome?.webview)
}

function buildProfile(): PerformanceProfile {
  const isWallpaper = isWallpaperRuntime()

  if (!isWallpaper) {
    return {
      isWallpaper: false,
      targetFps: 60,
      dpr: [1, 1.5],
      antialias: true,
      chromaticAberration: true,
      bloomMipmapBlur: true,
      bloomIntensity: 1.15,
      sphereSegments: 32,
      ringSegments: 64,
      dataStreams: { streams: 12, bits: 24 },
      metricsPollMs: 1000,
      waveformFps: 60,
    }
  }

  return {
    isWallpaper: true,
    targetFps: 24,
    dpr: [1, 1],
    antialias: false,
    chromaticAberration: false,
    bloomMipmapBlur: false,
    bloomIntensity: 0.85,
    sphereSegments: 20,
    ringSegments: 32,
    dataStreams: { streams: 8, bits: 14 },
    metricsPollMs: 3000,
    waveformFps: 12,
  }
}

export const perf = buildProfile()
