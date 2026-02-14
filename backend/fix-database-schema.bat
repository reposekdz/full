@echo off
echo ============================================
echo DATABASE SCHEMA FIX SCRIPT
echo ============================================
echo.
echo This script will fix the following issues:
echo - Create missing class_enrollments table
echo - Add missing 'name' column to cells table
echo - Add missing 'course_id' column to assignments table
echo - Add missing 'total_amount' column to student_fees table
echo - Add missing 'student_code' column to users table
echo.
echo ============================================
echo.

set /p MYSQL_USER="Enter MySQL username (default: root): "
if "%MYSQL_USER%"=="" set MYSQL_USER=root

set /p MYSQL_PASS="Enter MySQL password: "

echo.
echo Running database schema fixes...
echo.

mysql -u %MYSQL_USER% -p%MYSQL_PASS% < fix-database-schema.sql

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ============================================
    echo ✅ DATABASE SCHEMA FIXED SUCCESSFULLY!
    echo ============================================
    echo.
    echo Fixed issues:
    echo ✓ Created class_enrollments table
    echo ✓ Added 'name' column to cells table
    echo ✓ Added 'course_id' column to assignments table
    echo ✓ Added 'total_amount' column to student_fees table
    echo ✓ Added 'student_code' column to users table
    echo ✓ Generated student codes for existing students
    echo ✓ Created necessary indexes
    echo.
    echo You can now restart your server!
    echo.
) else (
    echo.
    echo ============================================
    echo ❌ ERROR: Failed to fix database schema
    echo ============================================
    echo.
    echo Please check:
    echo 1. MySQL credentials are correct
    echo 2. MySQL server is running
    echo 3. Database 'school_management' exists
    echo.
)

pause
