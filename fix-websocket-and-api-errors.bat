@echo off
echo ========================================
echo FIXING WEBSOCKET AND API ERRORS
echo ========================================

echo.
echo 1. Stopping any running servers...
taskkill /f /im node.exe 2>nul
timeout /t 2 >nul

echo.
echo 2. Fixed Issues:
echo    ✅ WebSocket connection - Changed HMR port to 5174
echo    ✅ Global student sheets API - Fixed database queries
echo    ✅ Added fallback data for missing tables
echo    ✅ Fixed column structure for teacher dashboard

echo.
echo 3. Starting backend server...
cd backend
start "Backend Server" cmd /k "npm start"

echo.
echo 4. Waiting for backend to start...
timeout /t 5 >nul

echo.
echo 5. Starting frontend server...
cd ..
start "Frontend Server" cmd /k "npm run dev"

echo.
echo ========================================
echo SERVERS STARTED WITH FIXES APPLIED
echo ========================================
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:5173
echo.
echo WebSocket now uses port 5174 for HMR
echo API endpoints fixed for global-student-sheets
echo.
echo Press any key to exit...
pause >nul