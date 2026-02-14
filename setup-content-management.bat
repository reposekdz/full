@echo off

REM Set working directory to script location
cd /d "%~dp0"

echo ========================================
echo Content Management System Setup
echo ========================================
echo.

cd backend
node scripts/setup-content-management.js

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Content Management is now ready!
echo.
echo Access from Admin Dashboard:
echo - Content Management section
echo - Manage Sports, Leadership, Trades, Developers
echo.
pause
