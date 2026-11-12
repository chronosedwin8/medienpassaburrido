# Deja Medienpass funcionando de forma permanente en este equipo (Windows), para el usuario actual.
# Crea la tarea programada «Medienpass»: al iniciar sesión ejecuta despliegue\servidor_windows.ps1,
# que mantiene la app en el puerto 3000 y la vuelve a iniciar si se cae. No necesita permisos de
# administrador. Para quitarla: despliegue\quitar_inicio_automatico.cmd
$ErrorActionPreference = 'Stop'
$app = Split-Path -Parent $PSScriptRoot
$script = Join-Path $PSScriptRoot 'servidor_windows.ps1'
$user = "$env:USERDOMAIN\$env:USERNAME"
$port = if ($env:PORT) { [int]$env:PORT } else { 3000 }

if (-not (Get-Command node.exe -ErrorAction SilentlyContinue)) {
    Write-Host 'No encuentro Node.js en este equipo. Instálalo desde https://nodejs.org y vuelve a intentarlo.' -ForegroundColor Red
    exit 1
}
if (-not (Test-Path -LiteralPath (Join-Path $app '.env'))) {
    Write-Host "Falta el archivo .env en $app (datos de conexión a Supabase)." -ForegroundColor Red
    exit 1
}

$action = New-ScheduledTaskAction -Execute 'powershell.exe' `
    -Argument "-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File `"$script`"" -WorkingDirectory $app
$trigger = New-ScheduledTaskTrigger -AtLogOn -User $user
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries `
    -ExecutionTimeLimit ([TimeSpan]::Zero) -RestartCount 3 -RestartInterval (New-TimeSpan -Minutes 1) `
    -MultipleInstances IgnoreNew -StartWhenAvailable
$principal = New-ScheduledTaskPrincipal -UserId $user -LogonType Interactive -RunLevel Limited

Register-ScheduledTask -TaskName 'Medienpass' -Force -Action $action -Trigger $trigger -Settings $settings -Principal $principal `
    -Description "Mantiene la app Medienpass funcionando en el puerto $port (despliegue\servidor_windows.ps1). Se inicia al iniciar sesión y se reinicia si falla." | Out-Null
Start-ScheduledTask -TaskName 'Medienpass'
Write-Host 'Tarea «Medienpass» creada e iniciada. Comprobando que la app responda...'

$ok = $false
for ($i = 0; $i -lt 20 -and -not $ok; $i++) {
    Start-Sleep -Seconds 2
    try { $ok = (Invoke-WebRequest -Uri "http://localhost:$port/login" -UseBasicParsing -TimeoutSec 5).StatusCode -eq 200 } catch { $ok = $false }
}
if ($ok) {
    $ip = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -notlike '127.*' -and $_.IPAddress -notlike '169.254.*' } | Select-Object -First 1).IPAddress
    Write-Host ''
    Write-Host 'Medienpass está funcionando.' -ForegroundColor Green
    Write-Host "  En este equipo:    http://localhost:$port/login"
    Write-Host "  Desde otro equipo: http://$($env:COMPUTERNAME):$port/login   (o http://${ip}:$port/login)"
    Write-Host 'Cada vez que inicies sesión en Windows, la app arrancará sola.'
} else {
    Write-Host "La tarea se creó, pero la app no respondió todavía. Revisa $app\logs\servidor.log" -ForegroundColor Yellow
}
