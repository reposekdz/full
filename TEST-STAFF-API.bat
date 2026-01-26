@echo off
echo ========================================
echo   TESTING STAFF MANAGEMENT API
echo ========================================
echo.
echo Make sure backend server is running!
echo.

cd backend
node scripts/test-staff-api.js

echo.
pause
