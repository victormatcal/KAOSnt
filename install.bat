@echo off
rem Initial setup (needs a connection only this time): creates the environment and downloads dependencies.
setlocal
cd /d "%~dp0"
set "PY=python"
where py >nul 2>nul && set "PY=py -3"
if not exist ".venv\Scripts\python.exe" (
  echo Creating the virtual environment in .venv ...
  %PY% -m venv .venv || goto :error
)
".venv\Scripts\python.exe" -m pip install --disable-pip-version-check -r requirements.txt || goto :error
echo.
echo Installation completed. Use start.bat to open KAOSnt.
pause
exit /b 0
:error
echo.
echo ERROR during installation. Check the message above (proxy, permissions or Python 3.10+).
pause
exit /b 1
