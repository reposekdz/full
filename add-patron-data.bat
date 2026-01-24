@echo off
echo ========================================
echo   Adding Patron Data to Database
echo ========================================
echo.

cd backend
node scripts/update-patron-data.js

echo.
echo ========================================
echo   Process Complete!
echo ========================================
pause
