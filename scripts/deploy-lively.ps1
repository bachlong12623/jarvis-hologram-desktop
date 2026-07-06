# Build and deploy JARVIS hologram to Lively Wallpaper (Type 1 = Web)
$ErrorActionPreference = 'Stop'
$Root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$Template = Join-Path $Root 'lively-template'
$Dist = Join-Path $Root 'dist'
$Stage = Join-Path $env:TEMP 'jarvis-hologram-lively'
$LivelyLib = "$env:LOCALAPPDATA\Lively Wallpaper\Library\wallpapers\jarvis-hologram"

if (-not (Test-Path (Join-Path $Template 'LivelyInfo.json'))) {
  throw "Missing lively-template\LivelyInfo.json"
}

Write-Host "Building..."
Set-Location $Root
npm run build

Write-Host "Packaging..."
if (Test-Path $Stage) { Remove-Item $Stage -Recurse -Force }
New-Item -ItemType Directory -Force -Path $Stage | Out-Null
Copy-Item -Path (Join-Path $Dist '*') -Destination $Stage -Recurse -Force
Copy-Item (Join-Path $Template 'LivelyInfo.json') (Join-Path $Stage 'LivelyInfo.json') -Force

$Builtin = Get-ChildItem "$env:LOCALAPPDATA\Lively Wallpaper\Library\wallpapers" -Directory -ErrorAction SilentlyContinue |
  Where-Object { $_.Name -ne 'jarvis-hologram' } |
  Select-Object -First 1
if ($Builtin) {
  $thumb = Join-Path $Builtin.FullName 'lively_t.jpg'
  if (Test-Path $thumb) { Copy-Item $thumb (Join-Path $Stage 'lively_t.jpg') -Force }
}

Write-Host "Starting metrics server..."
& (Join-Path $Root 'scripts\start-metrics.ps1')
Start-Sleep -Seconds 3

Write-Host "Deploying to Lively library..."
if (Test-Path $LivelyLib) { Remove-Item $LivelyLib -Recurse -Force }
Copy-Item $Stage $LivelyLib -Recurse

Write-Host ""
Write-Host "=== Done ==="
Write-Host "1. Open Lively Wallpaper"
Write-Host "2. Right-click library -> Refresh"
Write-Host "3. Select 'JARVIS Hologram' -> Apply"
Write-Host ""
Write-Host "Package: $LivelyLib"
