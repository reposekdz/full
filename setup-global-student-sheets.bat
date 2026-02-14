@echo off

REM Set working directory to script location
cd /d "%~dp0"

echo ========================================
echo GLOBAL STUDENT SHEETS SYSTEM SETUP
echo ========================================
echo.

cd backend
node setup-global-student-sheets.js

echo.
echo ========================================
echo Setup Complete!
echo ========================================
pause
