@echo off
rem Inicia Centro de trabajo en http://127.0.0.1:8765 (solo equipo local) y abre el navegador.
rem Parametros opcionales: --demo  --port N  --data-dir RUTA  --no-browser
setlocal
cd /d "%~dp0"
if not exist ".venv\Scripts\python.exe" (
  echo Falta el entorno. Ejecuta primero instalar.bat
  pause
  exit /b 1
)
start "Centro de trabajo" /min /D "%~dp0backend" "%~dp0.venv\Scripts\python.exe" -m centro %*
