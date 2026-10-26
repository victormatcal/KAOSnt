@echo off
rem Starts KAOSnt on http://127.0.0.1:8765 (local computer only) and opens the browser.
rem Optional: --demo  --port N  --data-dir PATH  --no-browser
setlocal
cd /d "%~dp0"
if not exist ".venv\Scripts\python.exe" (
  echo The environment is missing. Run install.bat first
  pause
  exit /b 1
)
start "KAOSnt" /min /D "%~dp0backend" "%~dp0.venv\Scripts\python.exe" -m kaosnt %*
