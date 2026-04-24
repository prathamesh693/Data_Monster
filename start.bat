@echo off
setlocal EnableExtensions
cd /d "%~dp0"

echo [DataGuard] Initializing environment...

where node >nul 2>&1
if errorlevel 1 (
  echo [DataGuard] Node.js was not found. Please install it from https://nodejs.org/
  pause
  exit /b 1
)

where npm >nul 2>&1
if errorlevel 1 (
  echo [DataGuard] npm was not found. Please reinstall Node.js.
  pause
  exit /b 1
)

set "NEEDS_INSTALL=0"
if not exist "node_modules\" set "NEEDS_INSTALL=1"
if not exist "client\node_modules\" set "NEEDS_INSTALL=1"
if not exist "server\node_modules\" set "NEEDS_INSTALL=1"

if "%NEEDS_INSTALL%"=="1" (
  echo [DataGuard] Installing dependencies for root, client, and server...
  call npm run install:all
  if errorlevel 1 (
    echo [DataGuard] Dependency installation failed. Please check your internet connection and try again.
    pause
    exit /b 1
  )
)

echo.
echo [DataGuard] Starting API (Port 5000) and Web UI (Vite)...
echo [DataGuard] Keep this window open to see logs, or run stop.bat to terminate.
echo.

:: Using concurrently from the root node_modules
call npm run dev
if errorlevel 1 (
  echo [DataGuard] Application failed to start.
  pause
  exit /b 1
)

pause
exit /b 0
