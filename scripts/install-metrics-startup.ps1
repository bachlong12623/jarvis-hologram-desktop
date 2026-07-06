# Add JARVIS metrics server to Windows Startup (for Lively HUD)
$ErrorActionPreference = 'Stop'
$Root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$Startup = [Environment]::GetFolderPath('Startup')
$ShortcutPath = Join-Path $Startup 'JARVIS-Metrics.lnk'
$ScriptPath = Join-Path $Root 'scripts\start-metrics.ps1'

$Wsh = New-Object -ComObject WScript.Shell
$Shortcut = $Wsh.CreateShortcut($ShortcutPath)
$Shortcut.TargetPath = 'powershell.exe'
$Shortcut.Arguments = "-ExecutionPolicy Bypass -WindowStyle Hidden -File `"$ScriptPath`""
$Shortcut.WorkingDirectory = $Root
$Shortcut.Description = 'JARVIS Hologram Metrics Server'
$Shortcut.Save()

Write-Host "Startup shortcut created: $ShortcutPath"
