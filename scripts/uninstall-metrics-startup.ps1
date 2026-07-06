# Remove JARVIS metrics server from Windows Startup
$Startup = [Environment]::GetFolderPath('Startup')
$ShortcutPath = Join-Path $Startup 'JARVIS-Metrics.lnk'

if (Test-Path $ShortcutPath) {
  Remove-Item $ShortcutPath -Force
  Write-Host "Removed: $ShortcutPath"
} else {
  Write-Host "Startup shortcut not found."
}
