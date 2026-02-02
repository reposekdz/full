@echo off
echo ========================================
echo Ensuring Courses for All Trades
echo ========================================
echo.

cd /d "%~dp0backend"

node scripts\ensure-trades-courses.js

echo.
echo ========================================
echo Done!
echo ========================================
pause
