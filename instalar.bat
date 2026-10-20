@echo off
rem Preparación inicial (requiere conexión solo esta vez): crea el entorno y descarga dependencias.
setlocal
cd /d "%~dp0"
set "PY=python"
where py >nul 2>nul && set "PY=py -3"
if not exist ".venv\Scripts\python.exe" (
  echo Creando entorno virtual en .venv ...
  %PY% -m venv .venv || goto :error
)
".venv\Scripts\python.exe" -m pip install --disable-pip-version-check -r requirements.txt || goto :error
echo.
echo Instalacion completada. Usa iniciar.bat para abrir Centro de trabajo.
pause
exit /b 0
:error
echo.
echo ERROR durante la instalacion. Revisa el mensaje anterior (proxy, permisos o version de Python 3.10+).
pause
exit /b 1
