@echo off
echo ========================================
echo Fixing Courses Table Structure
echo ========================================
echo.

cd /d "%~dp0backend"

node scripts\fix-courses-table.js

echo.
pause
