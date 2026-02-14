@echo off
echo ========================================
echo Garden TVET - DOS Dashboard Migration
echo ========================================
echo.

cd /d "%~dp0backend"

echo Running DOS Dashboard migration...
node run-dos-dashboard-migration.js

echo.
echo ========================================
echo Migration completed!
echo ========================================
pause
