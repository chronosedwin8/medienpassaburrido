# Quita el inicio automático de Medienpass (tarea programada «Medienpass») y detiene la app.
# Para volver a dejarla permanente: despliegue\instalar_inicio_automatico.cmd
$ErrorActionPreference = 'Continue'
$port = if ($env:PORT) { [int]$env:PORT } else { 3000 }

if (Get-ScheduledTask -TaskName 'Medienpass' -ErrorAction SilentlyContinue) {
    Stop-ScheduledTask -TaskName 'Medienpass' -ErrorAction SilentlyContinue
    Unregister-ScheduledTask -TaskName 'Medienpass' -Confirm:$false
    Write-Host 'Tarea «Medienpass» eliminada: la app ya no arrancará sola.'
} else {
    Write-Host 'No había tarea «Medienpass».'
}

# Detiene la app si sigue escuchando en el puerto (solo si es node.exe)
Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue | ForEach-Object {
    $process = Get-Process -Id $_.OwningProcess -ErrorAction SilentlyContinue
    if ($process -and $process.ProcessName -eq 'node') {
        Stop-Process -Id $process.Id -Force -Confirm:$false
        Write-Host "App detenida (node.exe, proceso $($process.Id))."
    }
}
