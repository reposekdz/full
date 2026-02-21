@echo off
echo.
echo ========================================
echo   RESTARTING BACKEND SERVER
echo ========================================
echo.

cd backend

echo Stopping any running Node processes...
taskkill /F /IM node.exe 2>nul

echo.
echo Starting backend server...
echo.

start cmd /k "npm start"

echo.
echo ========================================
echo   BACKEND SERVER RESTARTED!
echo ========================================
echo.
echo Backend is now running on http://localhost:5000
echo.
echo Press any key to close this window...
pause >nul
