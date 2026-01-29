@echo off
echo ========================================
echo  Discipline Management System Setup
echo ========================================
echo.

cd backend

echo [1/3] Installing dependencies...
call npm install multer
echo.

echo [2/3] Setting up database...
node scripts\setup-discipline-management.js
echo.

echo [3/3] Setup complete!
echo.
echo ========================================
echo  SETUP SUCCESSFUL!
echo ========================================
echo.
echo The Discipline Management System is now ready!
echo.
echo Features:
echo  - Conduct Records Management
echo  - Behavior Points System
echo  - Dormitory Inspections
echo  - Counseling Sessions
echo  - Parent Notifications
echo  - Advanced Reports
echo.
echo Accessible by: DOD, Matron, Patron, Admin
echo.
echo Press any key to exit...
pause >nul
