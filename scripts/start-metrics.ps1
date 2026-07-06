$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root
Get-Process -Name node -ErrorAction SilentlyContinue | Where-Object {
  $_.Path -and (Get-CimInstance Win32_Process -Filter "ProcessId=$($_.Id)").CommandLine -like '*server\index.ts*'
} | Stop-Process -Force -ErrorAction SilentlyContinue
$tsx = Join-Path $Root 'node_modules\tsx\dist\cli.mjs'
Start-Process -FilePath 'node' -ArgumentList "`"$tsx`"", 'server\index.ts' -WorkingDirectory $Root -WindowStyle Hidden
