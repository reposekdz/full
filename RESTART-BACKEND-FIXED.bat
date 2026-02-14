@echo off
echo ========================================
echo   RESTARTING BACKEND SERVER
echo   Fixes Applied:
echo   - Advanced Search API (/api/advanced-search/popular)
echo   - Gallery Campus API (/api/gallery/campus)
echo   - Staff Headmaster Overview (/api/staff/headmaster/overview)
echo   - Trade Images (auto.jpg, sod.jpg, bdc.jpg)
echo ========================================
echo.

cd backend

echo Stopping any running Node processes on port 5000...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5000') do taskkill /F /PID %%a 2>nul

echo.
echo Starting backend server...
start "Backend Server" cmd /k "node server.js"

echo.
echo ========================================
echo   Backend server is starting...
echo   Server will be available at:
echo   http://localhost:5000
echo ========================================
echo.
pause
