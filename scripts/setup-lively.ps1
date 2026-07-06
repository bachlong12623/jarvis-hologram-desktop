# Build and deploy fixed Lively wallpaper package (Type 1 = Web)
$ErrorActionPreference = 'Stop'
$Root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$Template = Join-Path $Root 'lively-template'
$PkgDir = Join-Path $Root 'lively-wallpaper'
$Dist = Join-Path $Root 'dist'
$LivelyLib = "$env:LOCALAPPDATA\Lively Wallpaper\Library\wallpapers\jarvis-hologram"

Write-Host "Building..."
Set-Location $Root
npm run build

Write-Host "Packaging for Lively (web type)..."
if (Test-Path $PkgDir) { Remove-Item $PkgDir -Recurse -Force }
New-Item -ItemType Directory -Force -Path $PkgDir | Out-Null
Copy-Item -Path (Join-Path $Dist '*') -Destination $PkgDir -Recurse -Force
Copy-Item (Join-Path $Template 'LivelyInfo.json') (Join-Path $PkgDir 'LivelyInfo.json') -Force

# Thumbnail: copy from any built-in Lively wallpaper
$Builtin = Get-ChildItem "$env:LOCALAPPDATA\Lively Wallpaper\Library\wallpapers" -Directory |
  Where-Object { $_.Name -ne 'jarvis-hologram' } |
  Select-Object -First 1
if ($Builtin) {
  $thumb = Join-Path $Builtin.FullName 'lively_t.jpg'
  if (Test-Path $thumb) { Copy-Item $thumb (Join-Path $PkgDir 'lively_t.jpg') -Force }
}

# Start metrics server
$MetricsScript = Join-Path $Root 'scripts\start-metrics.ps1'
@'
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root
Get-Process -Name node -ErrorAction SilentlyContinue | Where-Object {
  $_.Path -and (Get-CimInstance Win32_Process -Filter "ProcessId=$($_.Id)").CommandLine -like '*server\index.ts*'
} | Stop-Process -Force -ErrorAction SilentlyContinue
$tsx = Join-Path $Root 'node_modules\tsx\dist\cli.mjs'
Start-Process -FilePath 'node' -ArgumentList "`"$tsx`"", 'server\index.ts' -WorkingDirectory $Root -WindowStyle Hidden
'@ | Set-Content $MetricsScript -Encoding UTF8

& $MetricsScript
Start-Sleep -Seconds 5

# Deploy to Lively library
if (Test-Path $LivelyLib) { Remove-Item $LivelyLib -Recurse -Force }
Copy-Item $PkgDir $LivelyLib -Recurse

Write-Host ""
Write-Host "=== Done ==="
Write-Host "1. Open Lively Wallpaper"
Write-Host "2. Right-click library -> Refresh (or restart Lively)"
Write-Host "3. Select 'JARVIS Hologram' and Apply"
Write-Host ""
Write-Host "If web wallpapers fail: Settings -> Wallpaper -> Web Browser -> WebView2"
Write-Host "Package: $LivelyLib"
