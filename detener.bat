@echo off
rem Cierre controlado: pide al servidor que termine (vacia el registro WAL de SQLite y sale).
set "PORT=%~1"
if "%PORT%"=="" set "PORT=8765"
powershell -NoProfile -ExecutionPolicy Bypass -Command "try { Invoke-RestMethod -Method Post -Uri ('http://127.0.0.1:' + $env:PORT + '/api/system/shutdown') -Headers @{ 'X-Centro' = '1' } | Out-Null; Write-Host 'Centro de trabajo cerrado.' } catch { Write-Host 'No estaba en marcha en ese puerto o no responde.' }"
timeout /t 2 >nul
