@echo off
rem Doble clic: quita el inicio automatico de Medienpass y detiene la app.
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0quitar_inicio_automatico.ps1"
echo.
pause
