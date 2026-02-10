@echo off
echo ========================================
echo   DOD Dashboard Advanced Setup
echo ========================================
echo.

echo [1/3] Checking database connection...
node backend\scripts\test-db-connection.js
if errorlevel 1 (
    echo ERROR: Database connection failed!
    pause
    exit /b 1
)

echo.
echo [2/3] Setting up global student sheets...
node backend\scripts\setup-global-sheets.js

echo.
echo [3/3] Verifying setup...
echo.

echo ========================================
echo   Setup Complete!
echo ========================================
echo.
echo The DOD Dashboard Advanced is now ready!
echo.
echo Features:
echo  - Global student sheet access
echo  - Remove conduct with parent notifications
echo  - Contact parents via SMS/WhatsApp
echo  - Advanced filtering and search
echo  - Bulk operations
echo  - Real-time statistics
echo.
echo Access the dashboard at:
echo http://localhost:5173/dod-dashboard
echo.
pause
