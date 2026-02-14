@echo off

REM Set working directory to script location
cd /d "%~dp0"

echo ========================================
echo Sports & Hero Management Setup
echo ========================================
echo.

cd backend
node scripts/setup-sports-hero.js

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Sports & Hero Management is ready!
echo.
echo You can now manage:
echo - Sports Teams
echo - Players
echo - Coaches
echo - Achievements
echo - Hero Section
echo.
pause
