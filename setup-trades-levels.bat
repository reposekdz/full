@echo off
echo ========================================
echo  Setup Trades and Levels Database
echo ========================================
echo.
echo Setting up the following trades:
echo - SOD (Level 3, 4, 5)
echo - BDC (Level 3, 4, 5)
echo - AUT (Level 3, 4A, 4B, 5A, 5B)
echo.

cd backend
node setup-trades-levels.js

echo.
echo Setup complete!
echo Press any key to exit...
pause > nul
