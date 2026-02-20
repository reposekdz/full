@echo off
echo ========================================
echo Advanced Parent Linking System Setup
echo Real Trades (BDC, SOD, AUTO)
echo Real Levels from Database
echo Real Messages from DOD/DOS
echo ========================================
echo.

cd backend
node scripts/setup-parent-linking-advanced.js

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Next: Restart your backend server
echo   cd backend
echo   npm start
echo.
pause
