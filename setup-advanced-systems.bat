@echo off
echo ============================================================
echo  ADVANCED AUTO-LINKING ^& DOS MANAGEMENT SYSTEM SETUP
echo ============================================================
echo.

cd /d "%~dp0backend"

echo [1/3] Installing dependencies...
call npm install mysql2 bcrypt
echo.

echo [2/3] Running setup script...
node setup-advanced-systems.js
echo.

echo [3/3] Setup complete!
echo.
echo ============================================================
echo  READY TO USE!
echo ============================================================
echo.
echo Next: Start your server with "npm run dev"
echo.
pause
