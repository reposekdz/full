@echo off
echo ========================================
echo   TEACHER MARKS SHEET - DATABASE SETUP
echo ========================================
echo.

echo Creating student_marks table...
mysql -u root -p school_management_db < backend\migrations\create_student_marks_table.sql

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo   SUCCESS! Database table created
    echo ========================================
    echo.
    echo Next steps:
    echo 1. Restart backend: cd backend ^&^& npm start
    echo 2. Login as teacher
    echo 3. Navigate to Marks Sheet tab
    echo 4. Select Trade and Level
    echo 5. Start entering marks!
    echo.
) else (
    echo.
    echo ========================================
    echo   ERROR! Failed to create table
    echo ========================================
    echo.
    echo Please check:
    echo 1. MySQL is running
    echo 2. Database 'school_management_db' exists
    echo 3. You have correct MySQL password
    echo.
)

pause
