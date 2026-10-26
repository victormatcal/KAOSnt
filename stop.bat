@echo off
rem Controlled shutdown. Usage: stop.bat  (port 8765)  or  stop.bat 8766  (demo)
set "PORT=%~1"
if "%PORT%"=="" set "PORT=8765"
powershell -NoProfile -ExecutionPolicy Bypass -Command "try { Invoke-RestMethod -Method Post -Uri ('http://127.0.0.1:' + $env:PORT + '/api/system/shutdown') -Headers @{ 'X-KAOSnt' = '1' } | Out-Null; Write-Host 'KAOSnt closed.' } catch { Write-Host 'It was not running on that port or does not respond.' }"
timeout /t 2 >nul
