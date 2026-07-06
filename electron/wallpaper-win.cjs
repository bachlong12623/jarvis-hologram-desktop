/**
 * Windows desktop wallpaper attachment.
 * - Win11 24H2+ (raised desktop): layered child under SHELLDLL_DefView
 * - Legacy: WorkerW parenting
 */
const { screen } = require('electron')
const fs = require('fs')
const path = require('path')

let koffi = null
try {
  koffi = require('koffi')
} catch {
  koffi = null
}

const GWL_STYLE = -16
const GWL_EXSTYLE = -20
const WS_CHILD = 0x40000000
const WS_VISIBLE = 0x10000000
const WS_EX_LAYERED = 0x00080000
const WS_EX_NOREDIRECTIONBITMAP = 0x00200000
const LWA_ALPHA = 0x2
const SWP_NOSIZE = 0x0001
const SWP_NOMOVE = 0x0002
const SWP_NOACTIVATE = 0x0010
const SWP_SHOWWINDOW = 0x0040

const LOG = path.join(
  process.env.LOCALAPPDATA || '',
  'JARVIS-Wallpaper',
  'wallpaper.log',
)

function log(msg) {
  try {
    fs.mkdirSync(path.dirname(LOG), { recursive: true })
    fs.appendFileSync(LOG, `[${new Date().toISOString()}] ${msg}\n`)
  } catch {
    /* ignore */
  }
  if (process.env.WALLPAPER_DEBUG) console.log(msg)
}

function readHwnd(win) {
  const buf = win.getNativeWindowHandle()
  return Number(buf.readBigUInt64LE(0))
}

function findShellAndWorker(user32, ffi) {
  const FindWindowA = user32.func('void* __stdcall FindWindowA(str, str)')
  const FindWindowExA = user32.func(
    'void* __stdcall FindWindowExA(void*, void*, str, str)',
  )
  const EnumWindows = user32.func('bool __stdcall EnumWindows(void*, intptr)')
  const SendMessageTimeoutA = user32.func(
    'uintptr __stdcall SendMessageTimeoutA(void*, uint, uintptr, intptr, uint, uint, _Out_ uint32*)',
  )

  const progman = FindWindowA('Progman', null)
  if (!progman) throw new Error('Progman not found')

  const result = [0]
  SendMessageTimeoutA(progman, 0x052c, 0, 0, 0, 1000, result)

  let shellView = FindWindowExA(progman, null, 'SHELLDLL_DefView', null)
  let workerW = null

  const EnumProc = ffi.proto('bool __stdcall EnumProc(void* hwnd, intptr lParam)')
  const callback = ffi.register((hwnd) => {
    const shell = FindWindowExA(hwnd, null, 'SHELLDLL_DefView', null)
    if (shell) {
      shellView = shell
      workerW = FindWindowExA(null, hwnd, 'WorkerW', null)
    }
    return true
  }, ffi.pointer(EnumProc))

  EnumWindows(callback, 0)
  ffi.unregister(callback)

  if (!shellView) {
    shellView = FindWindowExA(progman, null, 'SHELLDLL_DefView', null)
  }
  if (!workerW) {
    workerW = FindWindowExA(null, progman, 'WorkerW', null)
  }

  return { progman, shellView, workerW }
}

function isRaisedDesktop(user32) {
  const FindWindowA = user32.func('void* __stdcall FindWindowA(str, str)')
  const GetWindowLongPtrA = user32.func('intptr __stdcall GetWindowLongPtrA(void*, int)')
  const progman = FindWindowA('Progman', null)
  if (!progman) return true
  const ex = Number(GetWindowLongPtrA(progman, GWL_EXSTYLE))
  return (ex & WS_EX_NOREDIRECTIONBITMAP) !== 0
}

function attachWin11(user32, ffi, hwnd, width, height) {
  const SetParent = user32.func('void* __stdcall SetParent(void*, void*)')
  const SetWindowPos = user32.func('bool __stdcall SetWindowPos(void*, void*, int, int, int, int, uint)')
  const SetLayeredWindowAttributes = user32.func(
    'bool __stdcall SetLayeredWindowAttributes(void*, uint32, uint8, uint32)',
  )
  const GetWindowLongPtrA = user32.func('intptr __stdcall GetWindowLongPtrA(void*, int)')
  const SetWindowLongPtrA = user32.func('intptr __stdcall SetWindowLongPtrA(void*, int, intptr)')

  const { progman, shellView, workerW } = findShellAndWorker(user32, ffi)
  if (!shellView) throw new Error('SHELLDLL_DefView not found')

  let style = Number(GetWindowLongPtrA(hwnd, GWL_STYLE))
  style = (style | WS_CHILD | WS_VISIBLE) & ~0x00cf0000
  SetWindowLongPtrA(hwnd, GWL_STYLE, style)

  let exStyle = Number(GetWindowLongPtrA(hwnd, GWL_EXSTYLE))
  SetWindowLongPtrA(hwnd, GWL_EXSTYLE, exStyle | WS_EX_LAYERED)

  SetLayeredWindowAttributes(hwnd, 0, 255, LWA_ALPHA)
  SetParent(hwnd, progman)
  SetWindowPos(hwnd, shellView, 0, 0, width, height, SWP_SHOWWINDOW)

  if (workerW) {
    SetWindowPos(workerW, hwnd, 0, 0, 0, 0, SWP_NOSIZE | SWP_NOMOVE | SWP_NOACTIVATE)
  }

  log('[wallpaper] Win11 24H2 layered desktop attach OK')
}

function attachLegacy(user32, ffi, hwnd, width, height) {
  const SetParent = user32.func('void* __stdcall SetParent(void*, void*)')
  const SetWindowPos = user32.func('bool __stdcall SetWindowPos(void*, void*, int, int, int, int, uint)')
  const { workerW } = findShellAndWorker(user32, ffi)
  if (!workerW) throw new Error('WorkerW not found')

  SetParent(hwnd, workerW)
  SetWindowPos(hwnd, null, 0, 0, width, height, SWP_SHOWWINDOW)
  log('[wallpaper] legacy WorkerW attach OK')
}

function attachFallback(win) {
  const { width, height } = screen.getPrimaryDisplay().bounds
  win.setBounds({ x: 0, y: 0, width, height })
  win.setFullScreen(true)
  win.setAlwaysOnTop(false, 'screen-saver', 1)
  log('[wallpaper] fallback fullscreen mode')
}

function attachWallpaperWindow(win) {
  win.setMenuBarVisibility(false)
  win.setSkipTaskbar(true)

  const { width, height } = screen.getPrimaryDisplay().bounds
  win.setBounds({ x: 0, y: 0, width, height })
  win.setFullScreen(false)

  if (process.platform !== 'win32' || !koffi) {
    attachFallback(win)
    return
  }

  win.once('ready-to-show', () => {
    try {
      const user32 = koffi.load('user32.dll')
      const hwnd = readHwnd(win)

      if (isRaisedDesktop(user32)) {
        attachWin11(user32, koffi, hwnd, width, height)
      } else {
        attachLegacy(user32, koffi, hwnd, width, height)
      }

      win.show()
      win.focus()
      win.blur()
    } catch (err) {
      log(`[wallpaper] attach failed: ${err.message}`)
      attachFallback(win)
      win.show()
    }
  })
}

module.exports = { attachWallpaperWindow, log }
