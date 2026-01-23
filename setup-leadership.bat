@echo off
echo ========================================
echo Setting up Leadership Database
echo ========================================
echo.

cd backend
node scripts/setup-leadership.js

echo.
echo ========================================
echo Leadership Setup Complete!
echo ========================================
pause
