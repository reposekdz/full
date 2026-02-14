@echo off

REM Set working directory to script location
cd /d "%~dp0"

echo ========================================
echo DOS COMPREHENSIVE MANAGEMENT SETUP
echo ========================================
echo.

cd backend
node setup-dos-management.js

echo.
echo ========================================
echo Setup Complete!
echo ========================================
pause
