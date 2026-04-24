@echo off
setlocal EnableExtensions EnableDelayedExpansion
cd /d "%~dp0"

echo [DataGuard] Stopping listeners on port 5000 (API) and port 5173 (Vite)...

:: Find and kill processes listening on specific ports
for %%P in (5000 5173) do (
    for /f "tokens=5" %%A in ('netstat -ano ^| findstr /r /c:":%%P  *LISTENING" ^| findstr /v /r "::"') do (
        echo [DataGuard] Killing process with PID %%A on port %%P...
        taskkill /F /PID %%A /T >nul 2>&1
    )
)

:: Also kill node processes related to the project by checking command line
:: (Optional but helpful if port check fails)
taskkill /FI "IMAGENAME eq node.exe" /F >nul 2>&1

echo.
echo [DataGuard] Project processes stopped.
echo [DataGuard] If any window remains open, please close it manually.
echo.
pause
exit /b 0
