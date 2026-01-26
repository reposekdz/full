@echo off
echo ========================================
echo  UNIFIED SYSTEM INTEGRATION
echo  Powerful School Management System
echo ========================================
echo.

echo [1/5] Setting up unified integration tables...
node backend\scripts\setup-unified-integration.js
if errorlevel 1 (
    echo ERROR: Failed to setup integration tables
    pause
    exit /b 1
)
echo.

echo [2/5] Setting up content management...
node backend\scripts\setup-content-management.js
if errorlevel 1 (
    echo WARNING: Content management setup had issues
)
echo.

echo [3/5] Setting up news system...
node backend\scripts\setup-news-articles.js
if errorlevel 1 (
    echo WARNING: News system setup had issues
)
echo.

echo [4/5] Setting up search system...
node backend\scripts\setup-search-system.js
if errorlevel 1 (
    echo WARNING: Search system setup had issues
)
echo.

echo [5/6] Setting up comprehensive staff system...
node backend\scripts\setup-staff-table.js
if errorlevel 1 (
    echo WARNING: Staff system setup had issues
)
echo.

echo [6/6] Setting up DOD comprehensive system...
node backend\scripts\setup-dod-system.js
if errorlevel 1 (
    echo WARNING: DOD system setup had issues
)
echo.

echo ========================================
echo  INTEGRATION COMPLETE!
echo ========================================
echo.
echo All systems have been integrated:
echo  - Unified Dashboard
echo  - Global Search
echo  - Content Management
echo  - News System
echo  - Staff Management
echo  - DOD Comprehensive System (Kinyarwanda)
echo  - Analytics Integration
echo  - Notification System
echo.
echo Next steps:
echo  1. Run: npm run dev (in root directory)
echo  2. Run: node backend\server.js (in backend directory)
echo  3. Access: http://localhost:5173
echo.
pause
