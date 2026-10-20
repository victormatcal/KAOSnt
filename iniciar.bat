@echo off
rem Inicia KAOSnt en http://127.0.0.1:8765 (solo equipo local) y abre el navegador.
rem Opcional: --demo  --port N  --data-dir RUTA  --no-browser
setlocal
cd /d "%~dp0"
if not exist ".venv\Scripts\python.exe" (
  echo Falta el entorno. Ejecuta primero instalar.bat
  pause
  exit /b 1
)
start "KAOSnt" /min /D "%~dp0backend" "%~dp0.venv\Scripts\python.exe" -m kaosnt %*
