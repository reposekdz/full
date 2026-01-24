@echo off
echo ========================================
echo   DYNAMIC SYSTEM SETUP
echo ========================================
echo.

echo Step 1: Setting up database...
cd backend
node scripts\setup-dynamic-system.js

echo.
echo Step 2: Starting comprehensive server...
start "Backend Server" cmd /k "node server-comprehensive.js"

timeout /t 3 /nobreak > nul

cd ..
echo.
echo Step 3: Starting frontend...
start "Frontend Server" cmd /k "npm run dev"

echo.
echo ========================================
echo   DYNAMIC SYSTEM READY!
echo ========================================
echo.
echo Dashboard: http://localhost:5173
echo Admin Config: http://localhost:5173/admin/config
echo API: http://localhost:5000/api/dynamic-system
echo.
echo Features:
echo  - Auto-refreshing statistics
echo  - Real-time calculations
echo  - Admin-controlled settings
echo  - Custom theming
echo  - Configurable widgets
echo.
pause
