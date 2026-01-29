@echo off
echo ========================================
echo ADVANCED SMS ^& JWT TESTING
echo ========================================
echo.
echo This test will:
echo 1. Verify JWT authentication
echo 2. Check Africa's Talking configuration
echo 3. Test connection to Africa's Talking
echo 4. Optionally send a test SMS
echo.
pause
echo.

cd /d "%~dp0backend"

node test-sms-advanced.js

cd ..
pause
