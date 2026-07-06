# Set Windows desktop to solid black (helps live wallpaper show through)
$ErrorActionPreference = 'SilentlyContinue'

Add-Type @"
using System;
using System.Runtime.InteropServices;
public class Wallpaper {
  [DllImport("user32.dll", CharSet = CharSet.Auto)]
  public static extern int SystemParametersInfo(int uAction, int uParam, string lpvParam, int fuWinIni);
}
"@

# SPI_SETDESKWALLPAPER = 20, SPIF_UPDATEINIFILE = 1
[Wallpaper]::SystemParametersInfo(20, 0, "", 3) | Out-Null

# Background color black via registry
Set-ItemProperty -Path 'HKCU:\Control Panel\Colors' -Name Background -Value '0 0 0'
Set-ItemProperty -Path 'HKCU:\Control Panel\Desktop' -Name WallpaperStyle -Value 0
Set-ItemProperty -Path 'HKCU:\Control Panel\Desktop' -Name TileWallpaper -Value 0

RUNDLL32.EXE user32.dll,UpdatePerUserSystemParameters 1, True | Out-Null
Write-Host 'Desktop background set to solid black.'
