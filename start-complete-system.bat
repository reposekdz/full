@echo off
echo ========================================
echo   COMPLETE SYSTEM STARTUP
echo ========================================
echo.

echo Step 1: Setup dynamic system database...
cd backend
node scripts\setup-dynamic-system.js

echo.
echo Step 2: Starting backend server...
start "Backend Server" cmd /k "node server-updated.js"

timeout /t 3 /nobreak > nul

cd ..
echo.
echo Step 3: Starting frontend...
start "Frontend Server" cmd /k "npm run dev"

echo.
echo ========================================
echo   SYSTEM READY!
echo ========================================
echo.
echo Access Points:
echo  - Dashboard: http://localhost:5173
echo  - Leadership Admin: http://localhost:5173/admin/leadership
echo  - Config Admin: http://localhost:5173/admin/config
echo  - API: http://localhost:5000/api
echo.
echo Active Routes:
echo  - /api/auth
echo  - /api/leadership
echo  - /api/comprehensive-db
echo  - /api/dynamic-system
echo  - /api/students
echo  - /api/teachers
echo  - /api/academics
echo  - /api/finance
echo.
pause
