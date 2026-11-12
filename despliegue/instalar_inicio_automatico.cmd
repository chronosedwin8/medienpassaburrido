@echo off
rem Doble clic: deja Medienpass funcionando siempre en este equipo (arranca al iniciar sesion).
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0instalar_inicio_automatico.ps1"
echo.
pause
