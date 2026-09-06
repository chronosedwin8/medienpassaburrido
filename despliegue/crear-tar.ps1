# Empaqueta el contenido de app/ en medienpass-caprover.tar
# IMPORTANTE: captain-definition y Dockerfile quedan en la RAIZ del tar
# (requisito de CapRover -> Deployment -> Method 2: Tarball).
$ErrorActionPreference = 'Stop'

$here    = Split-Path -Parent $MyInvocation.MyCommand.Path
$appDir  = Join-Path $here 'app'
$tarPath = Join-Path $here 'medienpass-caprover.tar'

if (-not (Test-Path $appDir)) {
    throw "No existe la carpeta app/ en $here"
}

if (Test-Path $tarPath) {
    Remove-Item $tarPath -Force
}

# -C $appDir .  => empaqueta el CONTENIDO de app/, no la carpeta app/ en si,
# de modo que captain-definition queda en ./captain-definition dentro del tar.
tar -cf $tarPath -C $appDir .

Write-Host "Tar creado: $tarPath"
Write-Host "Contenido (raiz del tar):"
tar -tf $tarPath
