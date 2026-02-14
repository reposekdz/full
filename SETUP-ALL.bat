@echo off

REM Set working directory to script location
cd /d "%~dp0"

echo ========================================
echo MASTER SETUP - ALL SYSTEMS
echo ========================================
echo.
echo This will setup ALL admin features:
echo - Content Management System
echo - News Article System
echo - Sports Management (Teams, Players, Coaches, Achievements)
echo - Hero Section Management
echo - User Management (All Roles)
echo - Analytics System
echo - Reports System
echo - Notifications System
echo.
pause

cd backend
node scripts/master-setup.js

echo.
echo ========================================
echo ALL SYSTEMS READY!
echo ========================================
echo.
echo Login credentials:
echo   Username: admin
echo   Password: admin123
echo.
echo Start the servers:
echo   Backend: cd backend ^&^& npm start
echo   Frontend: npm run dev
echo.
pause
