@echo off
echo ========================================
echo Garden TVET - Student Application System Setup
echo ========================================
echo.

cd backend

echo [1/3] Creating database tables...
node scripts/setup-application-system.js
if errorlevel 1 (
    echo ERROR: Database setup failed!
    pause
    exit /b 1
)

echo.
echo [2/3] Restarting backend server...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul
start "Garden TVET Backend" cmd /k "node server.js"

echo.
echo [3/3] Setup complete!
echo.
echo ========================================
echo NEXT STEPS:
echo ========================================
echo 1. Application form is ready at: /apply
echo 2. DOS can manage at: /dashboard-director-study
echo 3. Headmaster can manage at: /dashboard-headmaster
echo.
echo API Endpoint: http://localhost:5000/api/student-applications
echo.
echo ========================================
pause
