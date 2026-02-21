@echo off
echo.
echo ============================================================
echo    PARENT DASHBOARD APIS SETUP
echo ============================================================
echo.

cd backend
node setup-parent-dashboard-apis.js

echo.
echo Ready to use! Restart backend: npm start
echo.
pause
