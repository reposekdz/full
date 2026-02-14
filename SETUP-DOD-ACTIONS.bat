@echo off

REM Set working directory to script location
cd /d "%~dp0"

echo ========================================
echo Setting up DOD Actions System
echo ========================================
cd backend
node scripts/setup-dod-actions.js
echo.
echo ========================================
echo Setup Complete!
echo ========================================
pause
