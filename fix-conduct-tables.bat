@echo off
echo ========================================
echo Fix Conduct/Discipline Tables
echo ========================================
echo.
echo This will:
echo 1. Standardize all conduct tables to student_conduct_records
echo 2. Create compatibility views for old table names
echo 3. Fix column name issues (conduct_type -> incident_type)
echo.
pause

cd backend

echo.
echo Running migration...
mysql -u root -p school_management_db < migrations\fix-conduct-tables.sql

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo SUCCESS! Conduct tables fixed
    echo ========================================
    echo.
    echo All conduct/discipline data now uses:
    echo - Main table: student_conduct_records
    echo - Compatibility views: discipline_records, student_discipline_records
    echo.
    echo You can now use any of these table names in your queries.
    echo.
) else (
    echo.
    echo ========================================
    echo ERROR: Migration failed
    echo ========================================
    echo.
    echo Please check:
    echo 1. MySQL is running
    echo 2. Database credentials are correct
    echo 3. Database 'school_management_db' exists
    echo.
)

pause
