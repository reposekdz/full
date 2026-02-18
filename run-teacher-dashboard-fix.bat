@echo off
echo ========================================
echo Teacher Dashboard Database Fix
echo ========================================
echo.

cd /d "%~dp0"

echo Running database fix...
mysql -u root -p school_management < backend\migrations\teacher-dashboard-fix.sql

if %errorlevel% equ 0 (
    echo.
    echo ✅ Database fix completed successfully!
) else (
    echo.
    echo ❌ Database fix failed. Please check your MySQL connection.
    echo Make sure MySQL is running and you have the correct credentials.
)

echo.
pause
