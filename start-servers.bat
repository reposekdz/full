@echo off
echo ========================================
echo Starting Garden TVET School System
echo ========================================
echo.

REM Start Backend Server
echo [1/2] Starting Backend Server on port 5000...
start "Backend Server" cmd /k "cd backend && npm start"
timeout /t 5 /nobreak >nul

REM Start Frontend Server
echo [2/2] Starting Frontend Server on port 5173...
start "Frontend Server" cmd /k "npm run dev"

echo.
echo ========================================
echo Servers Starting...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:5173
echo ========================================
echo.
echo Press any key to close this window...
pause >nul
