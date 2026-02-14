@echo off

REM Set working directory to script location
cd /d "%~dp0"

echo ========================================
echo School Owner Role Setup
echo ========================================
echo.

echo Adding School Owner role to the system...
echo This will grant supreme access to finances, performance, stock, and analytics.
echo.

cd backend

echo Running migration...
node setup-school-owner.js

if %ERRORLEVEL% EQU 0 (
  echo.
  echo ========================================
  echo Setup Complete!
  echo ========================================
) else (
  echo.
  echo ========================================
  echo Setup Failed!
  echo ========================================
  echo Please check the error messages above.
)

echo.
pause
