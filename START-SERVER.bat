@echo off
echo ========================================
echo Cleaning up and starting server...
echo ========================================

REM Kill any existing node processes on port 5000
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000') do (
    taskkill /F /PID %%a 2>nul
)

echo.
echo Starting backend server...
cd backend
start "School Management Backend" cmd /k "npm run dev"

echo.
echo Waiting for server to start...
timeout /t 8 /nobreak >nul

echo.
echo Opening Trades & Courses View...
cd ..
start "" "view-trades-courses.html"

echo.
echo ========================================
echo Server Started!
echo ========================================
echo Backend: http://localhost:5000
echo API: http://localhost:5000/api/trades-courses/structure
echo.
