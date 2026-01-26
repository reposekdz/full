@echo off
echo ========================================
echo Starting School Management System
echo ========================================
echo.

cd backend
echo Starting backend server...
start "Backend Server" cmd /k "npm run dev"

timeout /t 5 /nobreak >nul

echo.
echo Opening Trades & Courses View...
start "" "view-trades-courses.html"

echo.
echo ========================================
echo System Started Successfully!
echo ========================================
echo Backend: http://localhost:5000
echo Trades View: view-trades-courses.html
echo.
echo Press any key to exit...
pause >nul
