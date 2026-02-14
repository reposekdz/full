@echo off

REM Set working directory to script location
cd /d "%~dp0"

echo ========================================
echo Comprehensive Content Setup
echo ========================================
echo.
echo Setting up all content management tables...
echo.

cd backend
node scripts/setup-comprehensive-content.js

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo You can now use the Comprehensive Content Management system.
echo.
pause
