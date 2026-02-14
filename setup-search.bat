@echo off

REM Set working directory to script location
cd /d "%~dp0"

echo ========================================
echo  POWERFUL SEARCH SYSTEM SETUP
echo  Garden TVET School Management System
echo ========================================
echo.

echo [1/2] Setting up search database tables...
node backend\scripts\setup-search-system.js

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ Setup failed! Please check the error messages above.
    pause
    exit /b 1
)

echo.
echo [2/2] Verifying search system...
echo.

echo ========================================
echo  ✅ SEARCH SYSTEM READY!
echo ========================================
echo.
echo Your powerful search features include:
echo   🔍 Universal search across all content
echo   🎤 Voice search support
echo   🎯 Advanced filtering and sorting
echo   🔥 Trending searches
echo   📜 Search history
echo   ⚡ Real-time results
echo   🌐 Multi-language support
echo   📊 Search analytics
echo.
echo Next steps:
echo   1. Start your backend: npm start (in backend folder)
echo   2. Start your frontend: npm run dev (in root folder)
echo   3. Press Ctrl+K to open search anywhere!
echo.
echo 📖 Read SEARCH_FEATURES.md for complete documentation
echo.
pause
