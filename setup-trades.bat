@echo off

REM Set working directory to script location
cd /d "%~dp0"

echo ========================================
echo Setting up Comprehensive Trades System
echo ========================================
echo.

cd backend
node scripts/setup-comprehensive-trades.js

echo.
echo ========================================
echo Setup Complete!
echo ========================================
pause
