const { app, BrowserWindow, screen, globalShortcut } = require('electron')
const path = require('path')
const { spawn } = require('child_process')
const http = require('http')
const { attachWallpaperWindow, log } = require('./wallpaper-win.cjs')

const isDev = process.env.DEV === '1'
const isWallpaper = process.env.WALLPAPER_MODE === '1'
const METRICS_PORT = process.env.METRICS_PORT ?? '3742'
const ROOT = path.join(__dirname, '..')

let metricsProcess = null
let mainWindow = null

if (isWallpaper) {
  app.commandLine.appendSwitch('disable-features', 'CalculateNativeWinOcclusion')
  // Layered desktop on Win11 24H2: software rendering is more reliable
  app.disableHardwareAcceleration()
}

function startMetricsServer() {
  if (metricsProcess) return Promise.resolve()

  const serverEntry = path.join(ROOT, 'server', 'index.ts')
  const tsxCli = path.join(ROOT, 'node_modules', 'tsx', 'dist', 'cli.mjs')

  log('[wallpaper] starting metrics server...')

  metricsProcess = spawn(process.execPath, [tsxCli, serverEntry], {
    cwd: ROOT,
    env: { ...process.env, METRICS_PORT },
    stdio: 'ignore',
    windowsHide: true,
    detached: false,
  })

  metricsProcess.on('exit', (code) => {
    log(`[wallpaper] metrics server exited: ${code}`)
    metricsProcess = null
  })

  return waitForMetrics(45_000)
}

function waitForMetrics(timeoutMs) {
  const deadline = Date.now() + timeoutMs

  return new Promise((resolve) => {
    const poll = () => {
      const req = http.get(`http://127.0.0.1:${METRICS_PORT}/api/health`, (res) => {
        res.resume()
        if (res.statusCode === 200) {
          log('[wallpaper] metrics server ready')
          resolve()
        } else if (Date.now() < deadline) {
          setTimeout(poll, 500)
        } else {
          resolve()
        }
      })
      req.on('error', () => {
        if (Date.now() < deadline) setTimeout(poll, 500)
        else resolve()
      })
      req.setTimeout(2000, () => req.destroy())
    }
    poll()
  })
}

function createWindow() {
  const { width, height } = screen.getPrimaryDisplay().bounds

  mainWindow = new BrowserWindow({
    width,
    height,
    x: 0,
    y: 0,
    frame: false,
    transparent: false,
    resizable: false,
    movable: false,
    minimizable: false,
    maximizable: false,
    closable: true,
    skipTaskbar: isWallpaper,
    fullscreen: false,
    show: false,
    backgroundColor: '#010610',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      backgroundThrottling: false,
    },
  })

  const url = isDev
    ? 'http://localhost:5173'
    : `file://${path.join(ROOT, 'dist', 'index.html').replace(/\\/g, '/')}`

  log(`[wallpaper] loading ${url}`)

  if (isWallpaper) {
    attachWallpaperWindow(mainWindow)
  }

  mainWindow.loadURL(url)

  mainWindow.webContents.on('did-finish-load', () => {
    log('[wallpaper] page loaded')
  })

  mainWindow.webContents.on('did-fail-load', (_e, code, desc) => {
    log(`[wallpaper] load failed: ${code} ${desc}`)
  })

  if (!isWallpaper) {
    mainWindow.once('ready-to-show', () => mainWindow?.show())
  }

  if (isDev && !isWallpaper) {
    mainWindow.webContents.openDevTools({ mode: 'detach' })
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

function registerShortcuts() {
  if (!isWallpaper) return
  globalShortcut.register('Control+Shift+Q', () => {
    log('[wallpaper] quit shortcut')
    app.quit()
  })
}

app.whenReady().then(async () => {
  log('[wallpaper] app ready')
  registerShortcuts()
  await startMetricsServer()
  setTimeout(createWindow, isDev ? 1500 : 500)
})

app.on('will-quit', () => {
  globalShortcut.unregisterAll()
})

app.on('window-all-closed', () => {
  if (metricsProcess) metricsProcess.kill()
  if (process.platform !== 'darwin') app.quit()
})

app.on('before-quit', () => {
  if (metricsProcess) metricsProcess.kill()
})
