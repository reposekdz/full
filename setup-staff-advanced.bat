@echo off

REM Set working directory to script location
cd /d "%~dp0"

echo ========================================
echo Staff Advanced Management Setup
echo ========================================
echo.

echo Running database migration...
node backend\scripts\setup-staff-advanced-tables.js

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Access the dashboard at: /staff-management-advanced
echo API endpoint: /api/staff-advanced
echo.
pause
