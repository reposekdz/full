@echo off
echo ========================================
echo QUICK FIX: Parent Login
echo ========================================
echo.
echo Fixing role for phone: 0796329328
echo.

cd /d "%~dp0backend"

echo Running SQL fix...
mysql -u root -p garden_tvet_school < fix-parent-role.sql

echo.
echo ========================================
echo DONE!
echo ========================================
echo.
echo Now RESTART your backend server:
echo 1. Stop backend (Ctrl+C)
echo 2. Run: npm start
echo.
echo Then login with:
echo Phone: 0796329328
echo Password: 1234567
echo.
pause
