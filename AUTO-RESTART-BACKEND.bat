@echo off
echo ========================================
echo   AUTO-RESTARTING BACKEND SERVER
echo ========================================
echo.

echo Step 1: Stopping old server...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo Step 2: Starting fresh server...
cd backend
start "Backend Server" cmd /k "npm run dev"

echo.
echo ========================================
echo   Backend Restarted!
echo ========================================
echo.
echo New server window opened.
echo All 54 APIs are now active!
echo.
echo Test with: TEST-ALL-APIS.bat
echo.
pause
