@echo off
echo ========================================
echo   COMPLETE SYSTEM SETUP
echo   School Management System
echo ========================================
echo.

cd backend

echo [1/5] Setting up Class Sheets System...
node scripts/setup-class-sheets-system.js
if errorlevel 1 (
    echo ERROR: Class sheets setup failed!
    pause
    exit /b 1
)
echo.

echo [2/5] Setting up DOS Management System...
node scripts/setup-dos-management.js
if errorlevel 1 (
    echo ERROR: DOS management setup failed!
    pause
    exit /b 1
)
echo.

echo [3/5] Updating Student Auth Schema...
node scripts/update-student-auth-schema.js
if errorlevel 1 (
    echo ERROR: Student auth update failed!
    pause
    exit /b 1
)
echo.

echo [4/5] Initializing Homepage Data...
node scripts/init-homepage-data.js
if errorlevel 1 (
    echo ERROR: Homepage data initialization failed!
    pause
    exit /b 1
)
echo.

echo [5/5] Testing Database Connection...
node scripts/test-db-connection.js
if errorlevel 1 (
    echo ERROR: Database connection test failed!
    pause
    exit /b 1
)
echo.

echo ========================================
echo   ✓ COMPLETE SYSTEM SETUP SUCCESSFUL!
echo ========================================
echo.
echo System Features Enabled:
echo   ✓ Homepage with real database data
echo   ✓ Student management with serial codes
echo   ✓ Class sheets with auto-numbering
echo   ✓ DOS management dashboard
echo   ✓ Teacher assignments
echo   ✓ Timetable generation
echo   ✓ Admin homepage manager
echo.
echo Next Steps:
echo   1. Start backend: npm start
echo   2. Start frontend: npm run dev
echo   3. Access: http://localhost:5173
echo.
echo Admin Routes:
echo   /admin/homepage-manager    - Manage homepage content
echo   /admin/student-management  - Manage students
echo   /admin/dos-management      - DOS dashboard
echo   /admin/class-sheet/:id     - View class sheets
echo.
pause
