# Install JARVIS wallpaper to Windows Startup (runs on login)
$ErrorActionPreference = 'Stop'
$Root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$Startup = [Environment]::GetFolderPath('Startup')
$ShortcutPath = Join-Path $Startup 'JARVIS-Wallpaper.lnk'
$ScriptPath = Join-Path $Root 'scripts\start-wallpaper.ps1'

Write-Host "Building wallpaper..."
Set-Location $Root
npm run build

Write-Host "Setting desktop to solid black..."
& (Join-Path $Root 'scripts\set-black-desktop.ps1')

Write-Host "Creating startup shortcut..."
$Wsh = New-Object -ComObject WScript.Shell
$Shortcut = $Wsh.CreateShortcut($ShortcutPath)
$Shortcut.TargetPath = 'powershell.exe'
$Shortcut.Arguments = "-ExecutionPolicy Bypass -WindowStyle Hidden -File `"$ScriptPath`""
$Shortcut.WorkingDirectory = $Root
$Shortcut.Description = 'JARVIS Hologram Desktop Wallpaper'
$Shortcut.Save()

Write-Host ""
Write-Host "Done! Wallpaper will start automatically on login."
Write-Host "Shortcut: $ShortcutPath"
Write-Host ""
Write-Host "Starting wallpaper now..."
& $ScriptPath
