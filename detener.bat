@echo off
rem Cierre controlado. Uso: detener.bat  (puerto 8765)  o  detener.bat 8766  (demo)
set "PORT=%~1"
if "%PORT%"=="" set "PORT=8765"
powershell -NoProfile -ExecutionPolicy Bypass -Command "try { Invoke-RestMethod -Method Post -Uri ('http://127.0.0.1:' + $env:PORT + '/api/system/shutdown') -Headers @{ 'X-KAOSnt' = '1' } | Out-Null; Write-Host 'KAOSnt cerrado.' } catch { Write-Host 'No estaba en marcha en ese puerto o no responde.' }"
timeout /t 2 >nul
