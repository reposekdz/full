@echo off

REM Set working directory to script location
cd /d "%~dp0"

echo ========================================
echo   POWERFUL SEARCH SYSTEM SETUP
echo ========================================
echo.

cd backend
node scripts\setup-search-system.js

echo.
echo ========================================
echo   SEARCH SYSTEM READY!
echo ========================================
echo.
echo Features:
echo  - Global search across all content
echo  - Real-time suggestions
echo  - Search history tracking
echo  - Trending searches
echo  - Advanced filtering
echo  - Search analytics
echo.
pause
