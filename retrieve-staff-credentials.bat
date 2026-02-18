@echo off
REM Script to retrieve all staff credentials from the database

cd /d "%~dp0"

echo ========================================
echo Retrieving Staff Credentials from Database
echo ========================================
echo.

cd backend

echo Running script to get real credentials...
node scripts/retrieve-staff-credentials.js

echo.
echo ========================================
echo Done!
echo ========================================
pause
