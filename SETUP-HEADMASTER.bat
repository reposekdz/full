@echo off
cls
echo ╔═══════════════════════════════════════════════════════════╗
echo ║  HEADMASTER ADVANCED MANAGEMENT SYSTEM SETUP              ║
echo ║  Database: school_management                              ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.
echo This will setup:
echo  ✅ Permissions system
echo  ✅ Headmaster full access
echo  ✅ Global sheets access
echo  ✅ Advanced analytics
echo  ✅ Student management (Add/Remove/Edit)
echo  ✅ Staff management
echo  ✅ Financial oversight
echo.
pause

echo.
echo Running setup...
echo.

cd /d "%~dp0backend"

echo Option 1: Using MySQL Command Line
echo -----------------------------------
echo mysql -u root school_management ^< setup-headmaster-advanced.sql
echo.
echo OR
echo.
echo Option 2: Using phpMyAdmin
echo --------------------------
echo 1. Open phpMyAdmin
echo 2. Select database: school_management
echo 3. Click SQL tab
echo 4. Copy and paste content from:
echo    backend\setup-headmaster-advanced.sql
echo 5. Click Go
echo.
echo.
echo ═══════════════════════════════════════════════════════════
echo AFTER SETUP:
echo ═══════════════════════════════════════════════════════════
echo.
echo 1. Restart backend server
echo 2. Login as headmaster
echo 3. Access new features:
echo    - Global Student Sheets
echo    - Advanced Analytics
echo    - Student Management
echo    - Staff Management
echo    - Financial Reports
echo.
echo ═══════════════════════════════════════════════════════════
pause
