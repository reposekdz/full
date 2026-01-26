@echo off
echo ========================================
echo   COMPREHENSIVE API TEST SUITE
echo   Testing All Platform APIs
echo ========================================
echo.
echo Make sure backend server is running!
echo Press Ctrl+C to cancel or
pause
echo.

cd backend
node scripts/test-all-apis.js

echo.
echo ========================================
echo   Test Complete!
echo ========================================
pause
