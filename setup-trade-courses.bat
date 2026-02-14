@echo off
echo ========================================
echo  Trade Courses System Setup
echo ========================================
echo.

cd /d "%~dp0"
cd backend
node setup-trade-courses.js

echo.
echo ========================================
echo  Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Restart your backend server
echo 2. Visit /trade-courses page to see all courses
echo 3. Use the API endpoints to integrate courses
echo.
pause
