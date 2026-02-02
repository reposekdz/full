@echo off
cls
echo ========================================
echo FIXING PARENT LOGIN
echo ========================================
echo.
echo Creating parent account with:
echo Phone: 0796329328
echo Password: 1234567
echo.
echo Please wait...
echo.

cd backend
node create-test-parent.js

echo.
echo ========================================
echo.
echo If successful, you can now login at:
echo http://localhost:5173
echo.
echo Use "Telefoni" tab with:
echo Phone: 0796329328
echo Password: 1234567
echo.
echo ========================================
pause
