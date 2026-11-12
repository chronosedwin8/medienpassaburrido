# Medienpass permanente en este equipo (Windows).
# Lo inicia la tarea programada «Medienpass» al iniciar sesión (ver README › Dejar la app
# funcionando en este equipo). Si la app se cierra o falla, la vuelve a iniciar a los 10 segundos.
# Si ya hay una copia corriendo en el puerto (por ejemplo, abierta a mano), no inicia otra.
# Registro: logs\servidor.log (al pasar de 10 MB se guarda como logs\servidor.anterior.log).
$ErrorActionPreference = 'Continue'
$app = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $app

$port = if ($env:PORT) { [int]$env:PORT } else { 3000 }
$logDir = Join-Path $app 'logs'
New-Item -ItemType Directory -Force -Path $logDir | Out-Null
$log = Join-Path $logDir 'servidor.log'
$node = (Get-Command node.exe -ErrorAction SilentlyContinue).Source
if (-not $node) { $node = Join-Path $env:ProgramFiles 'nodejs\node.exe' }

function Write-Log([string]$text) {
    Add-Content -LiteralPath $log -Value ('[{0}] {1}' -f (Get-Date -Format 'yyyy-MM-dd HH:mm:ss'), $text) -Encoding UTF8
}

while ($true) {
    if ((Test-Path -LiteralPath $log) -and (Get-Item -LiteralPath $log).Length -gt 10MB) {
        Move-Item -LiteralPath $log -Destination (Join-Path $logDir 'servidor.anterior.log') -Force
    }
    if (Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue) {
        Start-Sleep -Seconds 60   # ya está corriendo: se revisa otra vez en un minuto
        continue
    }
    Write-Log "Iniciando Medienpass en el puerto $port"
    $cmdLine = "/c `"`"$node`" server.js >> `"$log`" 2>&1`""
    $process = Start-Process -FilePath $env:ComSpec -ArgumentList $cmdLine -WorkingDirectory $app -WindowStyle Hidden -Wait -PassThru
    Write-Log "Medienpass se detuvo (código $($process.ExitCode)). Se vuelve a iniciar en 10 segundos."
    Start-Sleep -Seconds 10
}
