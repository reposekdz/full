@echo off
echo.
echo ========================================================================
echo   Starting Garden TVET School Management System
echo ========================================================================
echo.

echo [1/2] Starting Backend Server...
cd backend
start "Backend Server" cmd /k "npm start"

timeout /t 3 /nobreak >nul

echo [2/2] Starting Frontend...
cd ..
start "Frontend" cmd /k "npm run dev"

echo.
echo ========================================================================
echo   Servers Started!
echo ========================================================================
echo.
echo   Backend:  http://localhost:5000
echo   Frontend: http://localhost:5173
echo.
echo   Press any key to close this window...
echo ========================================================================
pause >nul
