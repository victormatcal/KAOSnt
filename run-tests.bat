@echo off
rem Server tests (first: .venv\Scripts\python.exe -m pip install -r requirements-dev.txt)
cd /d "%~dp0backend"
"%~dp0.venv\Scripts\python.exe" -m pytest -q
pause
