@echo off
echo ========================================
echo Advanced Student Sheets Setup
echo ========================================
echo.

cd /d "%~dp0backend"

echo Setting up database tables...
node scripts\setup-advanced-sheets.js

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Features enabled:
echo - Dynamic column creation
echo - Formula calculations (SUM, AVG, custom)
echo - Auto-calculations
echo - Action logging for all staff roles
echo - Bulk updates
echo.
echo Access at: http://localhost:5000/api/management
echo.
pause
