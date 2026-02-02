@echo off
cls
echo ╔════════════════════════════════════════╗
echo ║   FIX PARENT DASHBOARD REDIRECT        ║
echo ╚════════════════════════════════════════╝
echo.
echo Database: school_management
echo Problem: Parent redirects to admin dashboard
echo Solution: Fix role in database
echo.
echo This will update the role from "student" to "parent"
echo for phone: 0796329328
echo.
pause

echo.
echo Running SQL fix...
echo.

cd /d "%~dp0"

echo Option 1: Using MySQL Command Line
echo -----------------------------------
echo mysql -u root school_management ^< FIX-PARENT-ROLE-NOW.sql
echo.
echo OR
echo.
echo Option 2: Copy and paste this SQL into phpMyAdmin or MySQL Workbench:
echo.
type FIX-PARENT-ROLE-NOW.sql
echo.
echo.
echo ════════════════════════════════════════
echo MANUAL STEPS:
echo ════════════════════════════════════════
echo.
echo 1. Open MySQL (phpMyAdmin, Workbench, or command line)
echo 2. Select database: school_management
echo 3. Run the SQL from FIX-PARENT-ROLE-NOW.sql
echo 4. Restart backend server
echo 5. Login again - should go to parent dashboard!
echo.
echo ════════════════════════════════════════
pause
