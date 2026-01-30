@echo off
cls
echo ========================================
echo  DOD/MATRON/PATRON MANAGEMENT SYSTEM
echo  Complete Setup
echo ========================================
echo.

cd backend

echo [1/4] Installing dependencies...
call npm install multer bcryptjs --save
echo.

echo [2/4] Creating directories...
if not exist "uploads\discipline" mkdir uploads\discipline
if not exist "uploads\profiles" mkdir uploads\profiles
echo.

echo [3/4] Setting up database...
node scripts\run-complete-schema.js
echo.

echo [4/4] Verifying installation...
node scripts\verify-tables.js
echo.

echo ========================================
echo  SETUP COMPLETE!
echo ========================================
echo.
echo System Features:
echo  - 12 Advanced Tables with Foreign Keys
echo  - Incident Management
echo  - Behavior Points System
echo  - Wellness Tracking
echo  - Appeals System
echo  - Dormitory Management
echo  - Counseling Sessions
echo  - Parent Notifications
echo  - Recognition Awards
echo  - Advanced Reports
echo.
echo Roles: DOD, Matron, Patron, Admin
echo.
echo API Base: /api/discipline-management/*
echo Dashboard: /api/staff/dod/*
echo.
echo Next: Restart your server with 'npm run dev'
echo.
pause
