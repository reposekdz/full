@echo off
echo ========================================
echo COMPLETE ADMIN SYSTEM SETUP
echo ========================================
echo.
echo This will setup:
echo - Content Management System
echo - News Article System
echo - User Management
echo - Analytics System
echo - Notifications System
echo.
pause

cd backend

echo.
echo [1/3] Setting up Content Management...
node scripts/setup-content-management.js

echo.
echo [2/3] Setting up News Articles...
node scripts/setup-news-articles.js

echo.
echo [3/3] Setting up Admin Routes...
node scripts/setup-admin-system.js

echo.
echo ========================================
echo SETUP COMPLETE!
echo ========================================
echo.
echo All systems are ready!
echo.
echo Start the servers:
echo   Backend: cd backend && npm start
echo   Frontend: npm run dev
echo.
echo Login as admin to access all features.
echo.
pause
