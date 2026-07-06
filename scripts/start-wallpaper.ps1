# Start JARVIS hologram desktop wallpaper
$ErrorActionPreference = 'Stop'
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

$LogDir = Join-Path $env:LOCALAPPDATA 'JARVIS-Wallpaper'
New-Item -ItemType Directory -Force -Path $LogDir | Out-Null
$LogFile = Join-Path $LogDir 'wallpaper.log'
"--- start $(Get-Date -Format o) ---" | Out-File $LogFile -Append

# Stop ALL electron wallpaper instances (stale processes block desktop attach)
Get-Process -Name 'electron' -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

if (-not (Test-Path (Join-Path $Root 'dist\index.html'))) {
  "Building..." | Out-File $LogFile -Append
  npm run build 2>&1 | Out-File $LogFile -Append
}

& (Join-Path $Root 'scripts\set-black-desktop.ps1') 2>&1 | Out-File $LogFile -Append

$Electron = Join-Path $Root 'node_modules\electron\dist\electron.exe'
if (-not (Test-Path $Electron)) {
  throw "Electron not found. Run: npm install"
}

$env:WALLPAPER_MODE = '1'
"Launching electron..." | Out-File $LogFile -Append

Start-Process -FilePath $Electron -ArgumentList '.' -WorkingDirectory $Root -WindowStyle Hidden

Start-Sleep -Seconds 3
$running = Get-Process electron -ErrorAction SilentlyContinue
if ($running) {
  "Wallpaper started ($($running.Count) electron process(es))" | Out-File $LogFile -Append
  Write-Host "Wallpaper started. Press Win+D to view desktop."
  Write-Host "Log: $LogFile"
  Write-Host "Quit: Ctrl+Shift+Q"
} else {
  "FAILED to start wallpaper" | Out-File $LogFile -Append
  Write-Host "Failed to start. Check log: $LogFile"
  exit 1
}
