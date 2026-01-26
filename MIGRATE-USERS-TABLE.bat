@echo off
echo ========================================
echo   USERS TABLE MIGRATION
echo   Adding Staff Management Columns
echo ========================================
echo.

cd backend
node scripts/migrate-users-table.js

echo.
echo ========================================
echo   Migration Complete!
echo ========================================
pause
