@echo off
echo ========================================
echo   Testing SMS API - Africa's Talking
echo   Target: 0784484638
echo ========================================
echo.

cd backend
node test-sms-to-number.js

echo.
echo ========================================
echo   Test Complete!
echo ========================================
pause
