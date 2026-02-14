@echo off

REM Set working directory to script location
cd /d "%~dp0"

echo ========================================
echo Staff Access Code Management Setup
echo ========================================
echo.

cd backend

echo Running setup script...
node scripts/setup-staff-access-codes.js

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Restart your server
echo 2. Login as Admin or Headmaster
echo 3. Navigate to Staff Access Code Manager
echo 4. Update the access code as needed
echo.
echo Current default code: g@2026
echo.
pause
