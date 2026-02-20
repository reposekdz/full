@echo off
echo ========================================
echo DOD Parent Management System Setup
echo ========================================
echo.

cd backend

echo [1/2] Setting up database tables...
node scripts/setup-dod-parent-final.js

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Database setup failed!
    pause
    exit /b 1
)

echo.
echo [2/2] Restarting server...
echo.

echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo API Endpoints Available:
echo   GET  /api/dod-parent-management/level4-sod-students
echo   GET  /api/dod-parent-management/parents
echo   POST /api/dod-parent-management/link-parent-student
echo   POST /api/dod-parent-management/auto-link-parent
echo   POST /api/dod-parent-management/contact-parent
echo   POST /api/dod-parent-management/contact-student-parents
echo   GET  /api/dod-parent-management/stats
echo.
echo Now restart your backend server with: npm start
echo.
pause
