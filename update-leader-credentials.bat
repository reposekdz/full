@echo off
echo ========================================
echo   UPDATING LEADER CREDENTIALS
echo ========================================
echo.
echo Updating:
echo - Matron: Ishimwe Esther (0787342430)
echo - Advisor: 0788815924
echo - Accountant: 0788622709
echo.

cd /d "%~dp0backend"
node scripts\update-leader-credentials.js

echo.
echo ========================================
echo   CREDENTIALS UPDATED!
echo ========================================
echo.
echo All leader information is now up to date.
echo.
pause
