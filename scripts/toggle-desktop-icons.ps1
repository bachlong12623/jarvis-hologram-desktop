# Toggle Windows desktop icon visibility
$path = 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced'
$name = 'HideIcons'
$current = (Get-ItemProperty -Path $path -Name $name -ErrorAction SilentlyContinue).$name

if ($null -eq $current -or $current -eq 0) {
  Set-ItemProperty -Path $path -Name $name -Value 1
  Write-Host 'Desktop icons: HIDDEN'
} else {
  Set-ItemProperty -Path $path -Name $name -Value 0
  Write-Host 'Desktop icons: SHOWN'
}

Stop-Process -Name explorer -Force
