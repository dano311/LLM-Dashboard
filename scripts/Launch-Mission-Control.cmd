@echo off
setlocal

set "PROJECT_DIR=C:\Users\danri\Documents\New project 7"
set "TAILSCALE_URL=https://tx-pc.cockatoo-roach.ts.net"
set "LOCAL_URL=http://127.0.0.1:8787"

if not exist "%PROJECT_DIR%\scripts\start-mission-control.ps1" (
  echo Mission Control project was not found:
  echo %PROJECT_DIR%
  pause
  exit /b 1
)

cd /d "%PROJECT_DIR%"

echo Starting Mission Control...
echo.
echo Keep the PowerShell window open while you use the dashboard.
echo.

start "Mission Control Server" powershell.exe -NoProfile -ExecutionPolicy Bypass -NoExit -File "%PROJECT_DIR%\scripts\start-mission-control.ps1"

timeout /t 4 /nobreak >nul

echo Opening dashboard...
start "" "%TAILSCALE_URL%"

echo.
echo If the Tailscale URL does not open, try:
echo %LOCAL_URL%
echo.
timeout /t 3 /nobreak >nul
