@echo off
echo ========================================
echo  Dynamic Columns System Setup
echo ========================================
echo.

cd backend

echo [1/2] Creating database tables...
node setup-dynamic-columns.js

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo  Setup Complete!
    echo ========================================
    echo.
    echo Features enabled:
    echo  - Accountant: Dynamic column management
    echo  - DOS/Headmaster: Advanced student management
    echo  - Parent: Student connection system
    echo.
    echo API Endpoints:
    echo  - GET  /api/management/trades
    echo  - GET  /api/management/levels
    echo  - GET  /api/management/columns/:tradeId/:levelId
    echo  - POST /api/management/columns
    echo  - GET  /api/management/students/:tradeId/:levelId
    echo  - POST /api/management/students
    echo  - GET  /api/management/students/search
    echo  - POST /api/management/parent/connect
    echo  - GET  /api/management/parent/connections
    echo.
) else (
    echo.
    echo ========================================
    echo  Setup Failed!
    echo ========================================
    echo Please check the error messages above.
)

cd ..
pause
