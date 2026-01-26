@echo off
echo ========================================
echo SYSTEM VERIFICATION
echo ========================================
echo.
echo Checking database tables and API endpoints...
echo.
echo NOTE: Make sure backend server is running!
echo.

cd backend
node scripts/verify-system.js

echo.
pause
