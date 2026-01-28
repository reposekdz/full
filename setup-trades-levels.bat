@echo off
echo ========================================
echo  Setup Trades and Levels Database
echo ========================================
echo.

cd backend
node setup-trades-levels.js

echo.
echo Press any key to exit...
pause > nul
