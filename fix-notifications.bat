@echo off
echo ========================================
echo   FIX NOTIFICATIONS TABLE
echo ========================================
echo.

cd backend
node scripts/fixNotificationsTable.js

echo.
echo ========================================
echo   DONE!
echo ========================================
pause
