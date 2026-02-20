@echo off
echo ========================================
echo Adding Missing Tables and Columns
echo ========================================
echo.

cd backend
node scripts/add-missing-tables.js

echo.
echo ========================================
echo Now run: node scripts/populate-global-sheets-computed-safe.js
echo ========================================
pause
